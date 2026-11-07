// Build-time entry for scripts/prerender.mjs: renders one route to an HTML string.
// Not shipped to the browser; `vite build --ssr` bundles it into dist-ssr/.
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { posts, pages } from "./blog/posts";
import zh from "./i18n/zh.json";

export function render(path) {
  return renderToString(<App path={path} />);
}

import { social } from "./config/social";

const ORIGIN = "https://kentshen.com";
const person = {
  "@type": "Person",
  "@id": `${ORIGIN}/#person`,
  name: "Kent Shen",
  url: `${ORIGIN}/about`,
  sameAs: [`https://www.threads.com/@${social.threads}`, `https://www.instagram.com/${social.instagram}/`],
  address: { "@type": "PostalAddress", addressLocality: "Kaohsiung", addressCountry: "TW" },
};
const crumbs = (...items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: ORIGIN + path })),
});
const latest = posts[0] ? posts[0].date : "";
// Google wants a full ISO 8601 time with a zone; posts only carry a date (Taiwan time).
const isoTime = (d) => `${d}T00:00:00+08:00`;

// Every URL that gets its own static HTML file, with the title, description and
// structured data that go into its <head>. Search engines and link previews read
// these without running any JavaScript.
export function routes() {
  const site = zh.meta.title;
  const list = [
    {
      path: "/",
      title: `${site}｜高雄個人開發者 Kent Shen 的作品與開發筆記`,
      description: zh.meta.description,
      lastmod: latest,
      jsonld: [
        { "@type": "WebSite", "@id": `${ORIGIN}/#website`, name: site, url: `${ORIGIN}/`, inLanguage: "zh-Hant", publisher: { "@id": person["@id"] } },
        person,
        {
          "@type": "ItemList",
          name: zh.ui.works.heading,
          itemListElement: zh.products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "SoftwareApplication", name: p.title, description: p.tagline, url: p.links[0].url, image: p.thumbnail, applicationCategory: p.kind === "Chrome 外掛" ? "BrowserApplication" : "WebApplication", operatingSystem: p.kind === "Chrome 外掛" ? "Chrome" : "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" } },
          })),
        },
      ],
    },
    {
      path: "/blog",
      title: `Blog — ${site}`,
      description: zh.ui.home.blog.desc,
      lastmod: latest,
      jsonld: [
        { "@type": "Blog", name: `Blog — ${site}`, url: `${ORIGIN}/blog`, inLanguage: "zh-Hant", author: { "@id": person["@id"] } },
        crumbs(["首頁", "/"], ["Blog", "/blog"]),
      ],
    },
    { path: "/contact", title: `${zh.ui.contact.heading} — ${site}`, description: zh.ui.home.contact.desc, jsonld: [crumbs(["首頁", "/"], [zh.ui.contact.heading, "/contact"])] },
  ];
  for (const p of pages) {
    const jsonld = [crumbs(["首頁", "/"], [p.title, `/${p.slug}`])];
    if (p.slug === "about") jsonld.push({ "@type": "ProfilePage", mainEntity: person, dateModified: p.updated || undefined });
    list.push({ path: `/${p.slug}`, title: `${p.title} — ${site}`, description: p.summary || zh.meta.description, lastmod: p.updated, jsonld });
  }
  for (const p of posts) {
    const url = `${ORIGIN}/blog/${p.slug}`;
    list.push({
      path: `/blog/${p.slug}`,
      title: `${p.title} — ${site}`,
      description: p.summary || zh.meta.description,
      type: "article",
      published: isoTime(p.date),
      tags: p.tags,
      lastmod: p.date,
      jsonld: [
        {
          "@type": "BlogPosting",
          headline: p.title,
          description: p.summary,
          datePublished: isoTime(p.date),
          dateModified: isoTime(p.date),
          inLanguage: "zh-Hant",
          keywords: p.tags.join(", "),
          url,
          mainEntityOfPage: url,
          image: `${ORIGIN}/og-image.png`,
          author: person,
          publisher: { "@id": person["@id"] },
        },
        crumbs(["首頁", "/"], ["Blog", "/blog"], [p.title, `/blog/${p.slug}`]),
      ],
    });
  }
  return list;
}

// Feed items for /rss.xml, newest first.
export function feed() {
  return posts.map((p) => ({ slug: p.slug, title: p.title, date: p.date, summary: p.summary, tags: p.tags }));
}
