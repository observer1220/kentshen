// scripts/prerender.mjs — runs after `vite build` (see the build script in package.json).
//
// The site is a React single-page app: without this step every URL serves the same
// empty <div id="root"></div>, and anything that does not run JavaScript (AdSense
// review, search engines, Threads/LINE link previews) sees a blank page.
//
// For each route this writes a static HTML file with the page already rendered inside
// #root and its own <title>/description/og tags. The browser still loads the same JS
// bundle, which takes over the page as before.
//
// Files are written as dist/<path>.html (not <path>/index.html) so the asset layer's
// default html_handling serves them at /about, /blog/<slug> with no trailing slash.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ORIGIN = "https://kentshen.com";

const { render, routes, feed } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
const template = readFileSync(join(dist, "index.html"), "utf8");

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Swap one tag's content="" (or the <title> text); fail loudly if the template changed
// and the tag is gone, instead of silently shipping the generic site title everywhere.
function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
  return html.replace(pattern, replacement);
}

function pageHtml(route) {
  const url = ORIGIN + (route.path === "/" ? "/" : route.path);
  let html = template;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${attr(route.title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*"/, `<meta name="description" content="${attr(route.description)}"`);
  html = setTag(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${attr(url)}"`);
  html = setTag(html, /<meta property="og:type" content="[^"]*"/, `<meta property="og:type" content="${route.type || "website"}"`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${attr(route.title)}"`);
  html = setTag(html, /<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${attr(route.description)}"`);
  html = setTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${attr(url)}"`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${attr(route.title)}"`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${attr(route.description)}"`);
  html = setTag(html, /<div id="root"><\/div>/, `<div id="root">${render(route.path)}</div>`);

  const extra = [];
  if (route.published) extra.push(`<meta property="article:published_time" content="${attr(route.published)}" />`, `<meta property="article:author" content="${ORIGIN}/about" />`);
  for (const t of route.tags || []) extra.push(`<meta property="article:tag" content="${attr(t)}" />`);
  if (route.jsonld && route.jsonld.length) {
    // "</" must not appear raw inside a <script>, or a title could close the tag early.
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": route.jsonld }).replace(/</g, "\\u003c");
    extra.push(`<script type="application/ld+json">${json}</script>`);
  }
  if (extra.length) html = setTag(html, /<\/head>/, `${extra.join("\n    ")}\n  </head>`);
  return html;
}

const all = routes();
for (const route of all) {
  const file = route.path === "/" ? join(dist, "index.html") : join(dist, `${route.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pageHtml(route));
}

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    all
      .map((r) => `<url><loc>${ORIGIN}${r.path === "/" ? "/" : r.path}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ""}</url>`)
      .join("\n") +
    "\n</urlset>\n"
);

// RSS feed, so readers and feed-based crawlers pick up new posts.
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const items = feed();
writeFileSync(
  join(dist, "rss.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
    `<title>Kent Shen's Workspace — Blog</title>\n<link>${ORIGIN}/blog</link>\n` +
    `<atom:link href="${ORIGIN}/rss.xml" rel="self" type="application/rss+xml" />\n` +
    `<description>做工具時踩過的坑、設計取捨與筆記。</description>\n<language>zh-TW</language>\n` +
    (items[0] ? `<lastBuildDate>${new Date(items[0].date + "T00:00:00+08:00").toUTCString()}</lastBuildDate>\n` : "") +
    items
      .map(
        (p) =>
          `<item><title>${xml(p.title)}</title><link>${ORIGIN}/blog/${p.slug}</link><guid>${ORIGIN}/blog/${p.slug}</guid>` +
          `<pubDate>${new Date(p.date + "T00:00:00+08:00").toUTCString()}</pubDate><description>${xml(p.summary)}</description>` +
          p.tags.map((t) => `<category>${xml(t)}</category>`).join("") +
          `</item>`
      )
      .join("\n") +
    `\n</channel>\n</rss>\n`
);

// A real 404 page (served by the Worker with status 404 for unknown /blog/ slugs),
// kept out of search results.
const notFound = pageHtml({ path: "/blog/__not-found__", title: "找不到這篇文章 — Kent Shen's Workspace", description: "這個網址沒有文章。" })
  .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex" />');
writeFileSync(join(dist, "404.html"), notFound);

// Every path that has a page, for the Worker to tell a real page from a typo (404).
writeFileSync(join(dist, "routes.json"), JSON.stringify(all.map((r) => r.path)));

rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${all.length} pages + sitemap.xml`);
