import { useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";
import { posts, formatDate } from "../blog/posts";
import SocialLinks from "./Social";

// Kaohsiung and Taipei share a time zone, so Intl only knows "Asia/Taipei".
const clockFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Taipei",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function Clock() {
  const [now, setNow] = useState(() => clockFmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(clockFmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <strong>{now}</strong>;
}

const pad = (n) => String(n).padStart(2, "0");

function Hero() {
  const { data } = useLocale();
  const f = data.ui.hero.facts;

  return (
    <section className="hero">
      <h1 className="wordmark">
        Kent <mark>Shen</mark>
        <b>.</b>
      </h1>
      <ul className="facts mono">
        <li>
          <span className="mute">{f.works}</span>
          <strong>{pad(data.products.length)}</strong>
        </li>
        <li>
          <span className="mute">{f.deploy}</span>
          <strong>Cloudflare Workers</strong>
        </li>
        <li>
          <span className="mute">{f.time}</span>
          <Clock />
        </li>
      </ul>
      <SocialLinks />
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
          {pad(items.length)} / {pad(data.products.length)}
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
                {p.thumbnail && (
                  <figure>
                    <img src={p.thumbnail} alt={`${p.title}: ${p.tagline}`} loading="lazy" />
                  </figure>
                )}
                <div className="body">
                  <div className="top">
                    <span className="no mono">{pad(no)}</span>
                    <span className="meta mono">
                      {p.kind} · {p.date.slice(0, 4)}
                    </span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.tagline}</p>
                  <span className="go">{data.ui.linkLabels.visit}</span>
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
  const latest = posts[0];

  return (
    <section className="pair">
      <div className="col">
        <span className="mono mute">{h.blog.title}</span>
        <h2>
          <Link to="/blog">{h.blog.title}</Link>
        </h2>
        {latest ? (
          <Link className="entry" to={`/blog/${latest.slug}`}>
            <time className="mono mute" dateTime={latest.date}>
              {formatDate(latest.date)}
            </time>
            <div>
              <h3>{latest.title}</h3>
              {latest.summary && <p>{latest.summary}</p>}
            </div>
          </Link>
        ) : (
          <p className="lead">{h.blog.desc}</p>
        )}
        <Link className="more" to="/blog">
          {h.blog.all}
        </Link>
      </div>

      <div className="col contact-col">
        <span className="mono mute">{h.contact.title}</span>
        <h2>
          <Link to="/contact">{h.contact.title}</Link>
        </h2>
        <p className="lead">{h.contact.desc}</p>
        <SocialLinks />
        <Link className="more" to="/contact">
          {h.contact.cta}
        </Link>
      </div>
    </section>
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
