// Build-time entry for scripts/prerender.mjs: renders one route to an HTML string.
// Not shipped to the browser; `vite build --ssr` bundles it into dist-ssr/.
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { posts, pages } from "./blog/posts";
import zh from "./i18n/zh.json";

export function render(path) {
  return renderToString(<App path={path} />);
}

// Every URL that gets its own static HTML file, with the title and description
// that go into its <head>. Search engines and link previews read these without
// running any JavaScript.
export function routes() {
  const site = zh.meta.title;
  const list = [
    { path: "/", title: site, description: zh.meta.description },
    { path: "/blog", title: `Blog — ${site}`, description: zh.ui.home.blog.desc },
    { path: "/contact", title: `${zh.ui.contact.heading} — ${site}`, description: zh.ui.home.contact.desc },
  ];
  for (const p of pages) list.push({ path: `/${p.slug}`, title: `${p.title} — ${site}`, description: p.summary || zh.meta.description });
  for (const p of posts) list.push({ path: `/blog/${p.slug}`, title: `${p.title} — ${site}`, description: p.summary || zh.meta.description, type: "article" });
  return list;
}
