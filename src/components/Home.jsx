import { useState } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";
import { posts, formatDate } from "../blog/posts";
import SocialLinks from "./Social";

function Hero() {
  const { data } = useLocale();
  const h = data.ui.hero;

  return (
    <section className="intro">
      <h1>{h.intro}</h1>
      <p>{h.bio}</p>
    </section>
  );
}

function matches(p, q) {
  return [p.title, p.kind, p.tagline, p.desc].join(" ").toLowerCase().includes(q);
}

function WorksIndex() {
  const { data } = useLocale();
  const w = data.ui.works;
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const items = data.products.map((p, i) => ({ p, no: i + 1 })).filter(({ p }) => !q || matches(p, q));

  return (
    <section id="works" aria-labelledby="works-h">
      <div className="sechead">
        <h2 id="works-h">{w.heading}</h2>
        <span className="count mono mute">
          {items.length} / {data.products.length}
        </span>
        <label className="search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={w.search}
            aria-label={w.search}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="plates">
        {items.length === 0 ? (
          <p className="empty">{w.empty}</p>
        ) : (
          items.map(({ p, no }) => {
            const url = p.links && p.links[0] && p.links[0].url;
            return (
              <a key={p.id} className="plate" href={url} target="_blank" rel="noopener">
                <time className="plate-date mute" dateTime={p.date}>
                  {p.date.slice(0, 4)}
                </time>
                {p.thumbnail ? (
                  <figure>
                    <img src={p.thumbnail} alt={`${p.title}: ${p.tagline}`} loading="lazy" />
                  </figure>
                ) : (
                  <figure aria-hidden="true" />
                )}
                <div className="body">
                  <h3>{p.title}</h3>
                  <p>{p.tagline}</p>
                  <span className="meta mute">{p.kind}</span>
                </div>
              </a>
            );
          })
        )}
      </div>
    </section>
  );
}

function BlogAndContact() {
  const { data } = useLocale();
  const h = data.ui.home;
  const latest = posts.slice(0, 5);

  return (
    <>
      <section className="block latest" aria-labelledby="blog-h">
        <h2 id="blog-h">{h.blog.latest}</h2>
        {latest.length ? (
          <div className="entries">
            {latest.map((p) => (
              <Link key={p.slug} className="entry" to={`/blog/${p.slug}`}>
                <time className="mute" dateTime={p.date}>
                  {formatDate(p.date)}
                </time>
                <span className="entry-title">{p.title}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">{h.blog.desc}</p>
        )}
        <Link className="more" to="/blog">
          {h.blog.all}
        </Link>
      </section>

      <section className="block contact-block" aria-labelledby="contact-h">
        <h2 id="contact-h">{h.contact.title}</h2>
        <p>{h.contact.desc}</p>
        <SocialLinks />
        <Link className="more" to="/contact">
          {h.contact.cta}
        </Link>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <WorksIndex />
      <BlogAndContact />
    </>
  );
}
