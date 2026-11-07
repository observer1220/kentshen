const CANONICAL_HOST = "kentshen.com";

// Paths that have a prerendered page, read once per isolate from dist/routes.json.
let known = null;

async function knownPaths(env, url) {
  if (!known) {
    const res = await env.ASSETS.fetch(new URL("/routes.json", url));
    known = new Set(res.ok ? await res.json() : []);
  }
  return known;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.endsWith(".workers.dev")) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    // An unknown /blog/<slug> would otherwise fall back to the home page with status
    // 200, which search engines index as a duplicate ("soft 404"). Answer 404 instead.
    if (url.pathname.startsWith("/blog/")) {
      const paths = await knownPaths(env, url);
      let path = url.pathname.replace(/\/+$/, "");
      try {
        path = decodeURIComponent(path);
      } catch {}
      if (paths.size && !paths.has(path)) {
        const page = await env.ASSETS.fetch(new URL("/404", url));
        return new Response(page.body, {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
