import { marked } from "marked";

// Every .md file in content/blog/ becomes a post; the filename is the slug.
const files = import.meta.glob("../../content/blog/*.md", { query: "?raw", import: "default", eager: true });

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

export const posts = Object.entries(files)
  .map(([path, raw]) => {
    const { meta, body } = parseFrontmatter(raw);
    return {
      slug: path.split("/").pop().replace(/\.md$/, ""),
      title: meta.title || "(untitled)",
      date: meta.date || "",
      summary: meta.summary || "",
      tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      body,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

// Standalone pages (about, privacy) are Markdown too: content/pages/<slug>.md
const pageFiles = import.meta.glob("../../content/pages/*.md", { query: "?raw", import: "default", eager: true });

export const pages = Object.entries(pageFiles).map(([path, raw]) => {
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug: path.split("/").pop().replace(/\.md$/, ""),
    title: meta.title || "(untitled)",
    summary: meta.summary || "",
    updated: meta.updated || "",
    body,
  };
});

export function getPage(slug) {
  return pages.find((p) => p.slug === slug) || null;
}

export function getPost(slug) {
  return posts.find((p) => p.slug === slug) || null;
}

// A post body is Markdown with one extra block: a line of its own reading
//   ::embed[https://url]  or  ::embed[https://url | title | description]
// Returns an ordered list of { type: "html", html } and { type: "embed", ... }.
// Content comes from this repo (not user input), so injecting the rendered
// HTML is safe; embeds are rendered as real components instead.
export function toBlocks(body) {
  const blocks = [];
  let md = [];
  let inFence = false;

  const flush = () => {
    const text = md.join("\n").trim();
    if (text) blocks.push({ type: "html", html: marked.parse(text) });
    md = [];
  };

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const m = !inFence && line.match(/^::embed\[(.+)\]\s*$/);
    if (m) {
      flush();
      const [url, title, desc] = m[1].split("|").map((s) => s.trim());
      blocks.push({ type: "embed", url, title, desc });
    } else {
      md.push(line);
    }
  }
  flush();
  return blocks;
}

export function formatDate(iso) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
}

// Rough reading time: Chinese reads ~400 characters a minute; Latin words count as one.
export function readingMinutes(body) {
  const text = body.replace(/```[\s\S]*?```/g, " ").replace(/::embed\[[^\]]*\]/g, " ");
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (text.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

// Posts that share the most tags with this one (ties broken by newest), padded with
// the latest posts so every article links to a few others.
export function relatedPosts(slug, n = 3) {
  const post = getPost(slug);
  if (!post) return [];
  const others = posts.filter((p) => p.slug !== slug);
  const scored = others
    .map((p) => ({ p, s: p.tags.filter((t) => post.tags.includes(t) && t !== "開發筆記").length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (a.p.date < b.p.date ? 1 : -1))
    .map((x) => x.p);
  for (const p of others) if (!scored.includes(p)) scored.push(p);
  return scored.slice(0, n);
}
