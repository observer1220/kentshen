import { useEffect } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";
import { getPage, toBlocks, formatDate } from "../blog/posts";
import Embed from "./Embed";

// A standalone page written in Markdown (content/pages/<slug>.md): About, Privacy.
// Same look as a blog post, without the date line and tags.
export default function MarkdownPage({ slug }) {
  const { data } = useLocale();
  const page = getPage(slug);

  useEffect(() => {
    if (!page) return;
    const prev = document.title;
    document.title = `${page.title} — Kent Shen's Workspace`;
    return () => {
      document.title = prev;
    };
  }, [page]);

  if (!page) return null;

  return (
    <article className="page blog-page post">
      <Link to="/" className="backlink">
        {data.ui.blog.back}
      </Link>
      <header className="post-head">
        {page.updated && (
          <time className="mute" dateTime={page.updated}>
            {formatDate(page.updated)}
          </time>
        )}
        <h1 className="post-title">{page.title}</h1>
      </header>
      <div className="prose">
        {toBlocks(page.body).map((blk, i) =>
          blk.type === "embed" ? (
            <Embed key={i} url={blk.url} title={blk.title} desc={blk.desc} />
          ) : (
            <div key={i} dangerouslySetInnerHTML={{ __html: blk.html }} />
          )
        )}
      </div>
    </article>
  );
}
