const { sanityConfigured, sanityQuery } = require("../lib/sanity");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Método não permitido." });
  }

  if (!sanityConfigured()) {
    return response.status(503).json({
      error: "O blog está sendo configurado.",
      code: "SANITY_NOT_CONFIGURED",
    });
  }

  try {
    const posts = await sanityQuery(`
      *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        category,
        publishedAt,
        readingTime,
        "coverImage": coverImage.asset->url,
        "coverAlt": coverImage.alt
      }
    `);

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
    return response.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Não foi possível carregar os artigos." });
  }
};
