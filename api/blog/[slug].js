const { sanityConfigured, sanityQuery } = require("../../lib/sanity");

const SITE_URL = "https://www.yasmindesigner.com";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSpan(span, markDefs = []) {
  let content = escapeHtml(span.text || "");
  const marks = span.marks || [];

  marks.forEach((mark) => {
    if (mark === "strong") content = `<strong>${content}</strong>`;
    if (mark === "em") content = `<em>${content}</em>`;
    if (mark === "underline") content = `<u>${content}</u>`;
    if (mark === "code") content = `<code>${content}</code>`;

    const definition = markDefs.find((item) => item._key === mark);
    if (definition?._type === "link" && definition.href) {
      const external = /^https?:\/\//.test(definition.href);
      content = `<a href="${escapeHtml(definition.href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${content}</a>`;
    }
  });

  return content;
}

function renderBody(blocks = []) {
  let html = "";
  let activeList = null;

  const closeList = () => {
    if (activeList) html += `</${activeList}>`;
    activeList = null;
  };

  blocks.forEach((block) => {
    if (block._type === "image" && block.url) {
      closeList();
      html += `<figure><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || "")}" loading="lazy"><figcaption>${escapeHtml(block.caption || "")}</figcaption></figure>`;
      return;
    }

    if (block._type !== "block") return;
    const text = (block.children || []).map((span) => renderSpan(span, block.markDefs)).join("");

    if (block.listItem) {
      const list = block.listItem === "number" ? "ol" : "ul";
      if (activeList !== list) {
        closeList();
        html += `<${list}>`;
        activeList = list;
      }
      html += `<li>${text}</li>`;
      return;
    }

    closeList();
    const styles = { h2: "h2", h3: "h3", h4: "h4", blockquote: "blockquote", normal: "p" };
    const tag = styles[block.style] || "p";
    html += `<${tag}>${text}</${tag}>`;
  });

  closeList();
  return html;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}

function renderPage(post) {
  const title = escapeHtml(post.seoTitle || post.title);
  const description = escapeHtml(post.seoDescription || post.excerpt || "Conteúdo sobre design, marca e percepção criado pela YA Design.");
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const image = post.coverImage || `${SITE_URL}/Ya-Design/og-header.jpg`;
  const articleBody = renderBody(post.body);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/svg+xml" href="/Ya-Design/Logo-green-favicon.svg">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#050505">
  <meta name="robots" content="index, follow">
  <meta name="author" content="${escapeHtml(post.author || "YA Design")}">
  <meta name="description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="YA Design">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="article:published_time" content="${escapeHtml(post.publishedAt)}">
  <meta name="twitter:card" content="summary_large_image">
  <title>${title} | Blog YA Design</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Ubuntu:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/blog/blog.css">
</head>
<body class="blog-page">
  <header class="blog-header">
    <div class="site-header container">
      <a class="brand" href="/" aria-label="Ir para a página inicial da YA Design"><img src="/Ya-Design/logo-ya-green.png" alt="YA Design" width="500" height="500"></a>
      <nav class="site-nav blog-nav" aria-label="Navegação principal">
        <a class="site-nav__link" href="/">Home</a>
        <a class="site-nav__link" href="/blog/">Blog</a>
        <a class="site-nav__link" href="/#servicos">Serviços</a>
        <a class="site-nav__link" href="/#contato">Contato</a>
      </nav>
    </div>
  </header>
  <main>
    <article class="article">
      <header class="article__hero container">
        <a class="article__back" href="/blog/">← Voltar ao blog</a>
        <span class="eyebrow">${escapeHtml(post.category || "Estratégia de marca")}</span>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="article__excerpt">${escapeHtml(post.excerpt || "")}</p>
        <div class="article__meta"><span>${escapeHtml(post.author || "YA Design")}</span><span>${formatDate(post.publishedAt)}</span><span>${Number(post.readingTime) || 5} min de leitura</span></div>
      </header>
      ${post.coverImage ? `<div class="article__cover container"><img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.coverAlt || post.title)}"></div>` : ""}
      <div class="article__body">${articleBody}</div>
      <footer class="article__cta container">
        <div><span class="eyebrow">Próximo passo</span><h2>Sua marca está transmitindo o valor que entrega?</h2></div>
        <a class="btn btn--light" href="https://wa.me/5518998045806?text=Ol%C3%A1%2C%20li%20um%20artigo%20no%20blog%20da%20YA%20Design%20e%20quero%20conversar%20sobre%20minha%20marca." target="_blank" rel="noopener">Conversar com a YA Design</a>
      </footer>
    </article>
  </main>
  <footer class="footer blog-footer"><div class="footer__inner"><div class="footer__brand"><a href="/"><img src="/Ya-Design/logo-ya-green.png" alt="YA Design" width="500" height="500"></a><p>Presença visual estratégica para marcas que precisam parecer tão fortes quanto são.</p></div><div class="footer__bottom"><span>&copy; 2026 YA Design. Todos os direitos reservados.</span><a href="mailto:contato@yasmindesigner.com">contato@yasmindesigner.com</a></div></div></footer>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt, image, datePublished: post.publishedAt, author: { "@type": "Organization", name: post.author || "YA Design" }, publisher: { "@type": "Organization", name: "YA Design", logo: { "@type": "ImageObject", url: `${SITE_URL}/Ya-Design/logo-ya-green.png` } }, mainEntityOfPage: canonical }).replaceAll("<", "\\u003c")}</script>
</body>
</html>`;
}

module.exports = async function handler(request, response) {
  if (!sanityConfigured()) {
    return response.status(503).send("O blog está sendo configurado.");
  }

  const slug = Array.isArray(request.query.slug) ? request.query.slug[0] : request.query.slug;
  if (!slug) return response.status(404).send("Artigo não encontrado.");

  try {
    const post = await sanityQuery(`
      *[_type == "post" && slug.current == $slug][0] {
        title,
        "slug": slug.current,
        excerpt,
        category,
        publishedAt,
        readingTime,
        author,
        seoTitle,
        seoDescription,
        "coverImage": coverImage.asset->url,
        "coverAlt": coverImage.alt,
        body[]{..., "url": asset->url}
      }
    `, { slug });

    if (!post) return response.status(404).send("Artigo não encontrado.");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    return response.status(200).send(renderPage(post));
  } catch (error) {
    console.error(error);
    return response.status(500).send("Não foi possível carregar este artigo.");
  }
};
