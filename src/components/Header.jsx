import { useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";

function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage may be blocked; the choice just won't persist */
    }
    setTheme(next);
  }

  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

export default function Header() {
  const { data } = useLocale();
  const nav = data.ui.nav;

  return (
    <header className="bar">
      <nav className="nav">
        <Link className="brand" to="/">
          Kent Shen
        </Link>
        <span className="sep">·</span>
        <Link to="/#works">{nav.works}</Link>
        <span className="sep">·</span>
        <Link to="/blog">{nav.blog}</Link>
        <span className="sep">·</span>
        <Link to="/contact">{nav.contact}</Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
