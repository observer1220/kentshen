import { useEffect } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";
import { getWork, toBlocks, formatDate } from "../blog/posts";
import Embed from "./Embed";

// One product's write-up (content/works/<id>.md) with its live link, thumbnail and
// the other works, so the site has real on-page content rather than only outbound links.
export default function WorksPage({ slug }) {
  const { data } = useLocale();
  const w = data.ui.works;
  const work = getWork(slug);
  const product = data.products.find((p) => p.id === slug);

  useEffect(() => {
    if (!work) return;
    const prev = document.title;
    document.title = `${work.title} — Kent Shen's Workspace`;
    return () => {
      document.title = prev;
    };
  }, [work]);

  if (!work || !product) {
    return (
      <section className="page">
        <Link to="/#works" className="backlink">
          {w.back}
        </Link>
        <h1 className="page-heading">{data.ui.notFound.heading}</h1>
      </section>
    );
  }

  const url = product.links[0].url;
  const others = data.products.filter((p) => p.id !== slug);

  return (
    <article className="page blog-page post work">
      <Link to="/#works" className="backlink">
        {w.back}
      </Link>
      <header className="post-head">
        <p className="post-meta mute">
          <span>{product.kind}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={product.date.replace(".", "-")}>{product.date}</time>
          <span aria-hidden="true"> · </span>
          <span>{formatDate(work.updated)}</span>
        </p>
        <h1 className="post-title">{work.title}</h1>
      </header>

      <p className="work-lead">{work.summary}</p>
      <a className="work-visit" href={url} target="_blank" rel="noopener">
        {w.visit} ↗
      </a>
      {product.thumbnail && (
        <a href={url} target="_blank" rel="noopener" className="work-shot">
          <img src={product.thumbnail} alt={`${work.title}: ${product.tagline}`} loading="lazy" />
        </a>
      )}

      <div className="prose">
        {toBlocks(work.body).map((blk, i) =>
          blk.type === "embed" ? (
            <Embed key={i} url={blk.url} title={blk.title} desc={blk.desc} />
          ) : (
            <div key={i} dangerouslySetInnerHTML={{ __html: blk.html }} />
          )
        )}
      </div>

      <aside className="related" aria-labelledby="more-works-h">
        <h2 id="more-works-h">{w.more}</h2>
        <ul className="postlist">
          {others.map((p) => (
            <li key={p.id}>
              <Link to={`/works/${p.id}`} className="postrow">
                <time className="mute" dateTime={p.date.replace(".", "-")}>
                  {p.date.slice(0, 4)}
                </time>
                <span className="postrow-main">
                  <span className="postrow-title">{p.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
