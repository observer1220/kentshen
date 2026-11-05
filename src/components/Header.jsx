import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";

export default function Header() {
  const { data } = useLocale();
  const nav = data.ui.nav;

  return (
    <header className="bar">
      <Link className="brand" to="/">
        Kent Shen
      </Link>
      <nav className="nav">
        <Link to="/#works">{nav.works}</Link>
        <Link to="/blog">{nav.blog}</Link>
        <Link to="/contact">{nav.contact}</Link>
      </nav>
    </header>
  );
}
