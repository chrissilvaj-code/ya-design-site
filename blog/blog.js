const grid = document.querySelector("#blog-grid");

function escapeHtml(value = "") {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function postCard(post, index) {
  const image = post.coverImage
    ? `<img src="${escapeHtml(post.coverImage)}?auto=format&w=1200&q=85" alt="${escapeHtml(post.coverAlt || post.title)}" loading="${index === 0 ? "eager" : "lazy"}">`
    : `<div class="blog-card__placeholder"><img src="../Ya-Design/logo-ya-green.png" alt="" aria-hidden="true"></div>`;

  return `<article class="blog-card${index === 0 ? " blog-card--featured" : ""}">
    <a class="blog-card__image" href="/blog/${encodeURIComponent(post.slug)}" tabindex="-1">${image}</a>
    <div class="blog-card__content">
      <div class="blog-card__meta"><span>${escapeHtml(post.category || "Estratégia de marca")}</span><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time></div>
      <h3><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt || "")}</p>
      <a class="blog-card__link" href="/blog/${encodeURIComponent(post.slug)}">Ler artigo <span aria-hidden="true">→</span></a>
    </div>
  </article>`;
}

async function loadPosts() {
  try {
    const response = await fetch("/api/posts");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.code || "LOAD_ERROR");

    if (!payload.posts.length) {
      grid.innerHTML = `<div class="blog-state"><h3>Os primeiros artigos estão a caminho.</h3><p>Em breve, novas ideias sobre estratégia, design e percepção de marca.</p></div>`;
      return;
    }

    grid.innerHTML = payload.posts.map(postCard).join("");
  } catch (error) {
    const setup = error.message === "SANITY_NOT_CONFIGURED";
    grid.innerHTML = `<div class="blog-state"><h3>${setup ? "O blog está quase pronto." : "Não foi possível carregar os artigos agora."}</h3><p>${setup ? "A conexão com o painel editorial está sendo finalizada." : "Tente novamente em alguns instantes."}</p></div>`;
  }
}

loadPosts();
