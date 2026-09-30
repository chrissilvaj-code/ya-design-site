const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2026-09-30";

function sanityConfigured() {
  return Boolean(projectId && dataset);
}

async function sanityQuery(query, params = {}) {
  if (!sanityConfigured()) {
    throw new Error("SANITY_NOT_CONFIGURED");
  }

  const search = new URLSearchParams({ query });
  Object.entries(params).forEach(([key, value]) => {
    search.set(`$${key}`, JSON.stringify(value));
  });

  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${search}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Sanity respondeu com status ${response.status}`);
  }

  const payload = await response.json();
  return payload.result;
}

module.exports = { sanityConfigured, sanityQuery };
