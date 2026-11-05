import { social } from "../config/social";

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor">
        @
      </text>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="17.4" cy="6.6" r="1.4" fill="currentColor" />
    </svg>
  );
}

// variant "row": compact buttons. variant "cards": big contact cards with the handle.
export default function SocialLinks({ variant = "row" }) {
  const items = [
    { key: "threads", name: "Threads", handle: social.threads, url: `https://www.threads.com/@${social.threads}`, Icon: ThreadsIcon },
    { key: "instagram", name: "Instagram", handle: social.instagram, url: social.instagram ? `https://www.instagram.com/${social.instagram}/` : "https://www.instagram.com/", Icon: InstagramIcon },
  ];

  if (variant === "cards") {
    return (
      <div className="social-cards">
        {items.map(({ key, name, handle, url, Icon }) => (
          <a key={key} className={`social-card ${key}`} href={url} target="_blank" rel="noopener">
            <span className="arrow" aria-hidden="true">↗</span>
            <Icon />
            <b>{name}</b>
            {handle ? <span>@{handle}</span> : <span>instagram.com</span>}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="social-row">
      {items.map(({ key, name, url, Icon }) => (
        <a key={key} className={`social-btn ${key}`} href={url} target="_blank" rel="noopener">
          <Icon />
          {name}
        </a>
      ))}
    </div>
  );
}
