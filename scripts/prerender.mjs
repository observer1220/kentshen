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

const { render, routes } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
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
    all.map((r) => `<url><loc>${ORIGIN}${r.path === "/" ? "/" : r.path}</loc></url>`).join("\n") +
    "\n</urlset>\n"
);

rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${all.length} pages + sitemap.xml`);
