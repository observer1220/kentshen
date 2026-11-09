import { LocaleProvider } from "./i18n/LocaleContext";
import { RouterProvider, useRouter, Link } from "./router";
import Header from "./components/Header";
import Home from "./components/Home";
import { BlogList, BlogPost } from "./components/BlogPage";
import ContactPage from "./components/ContactPage";
import MarkdownPage from "./components/MarkdownPage";
import { useLocale } from "./i18n/LocaleContext";
import InstallHint from "./components/InstallHint";

function Page() {
  const { path } = useRouter();
  if (path === "/blog") return <BlogList />;
  if (path.startsWith("/blog/")) return <BlogPost slug={decodeURIComponent(path.slice(6))} />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/about") return <MarkdownPage slug="about" />;
  if (path === "/privacy") return <MarkdownPage slug="privacy" />;
  if (path === "/") return <Home />;
  return <NotFound />;
}

function NotFound() {
  const { data } = useLocale();
  const n = data.ui.notFound;
  return (
    <section className="page">
      <h1 className="page-heading">{n.heading}</h1>
      <p className="contact-lead">{n.desc}</p>
      <p>
        <Link to="/">{n.home}</Link>
        {" · "}
        <Link to="/blog">{n.blog}</Link>
      </p>
    </section>
  );
}

function FooterLinks() {
  const { data } = useLocale();
  return (
    <span className="foot-links">
      <Link to="/about">{data.ui.aboutLink}</Link>
      <Link to="/privacy">{data.ui.privacyLink}</Link>
    </span>
  );
}

// `path` is only set by the build-time pre-renderer (src/entry-server.jsx).
export default function App({ path }) {
  return (
    <LocaleProvider>
      <RouterProvider initialPath={path}>
        <div className="wrap" id="top">
          <Header />
          <Page />
          <footer className="foot mono">
            <span>© 2026 Kent Shen</span>
            <FooterLinks />
            <InstallHint />
            <span>kentshen.com</span>
          </footer>
        </div>
      </RouterProvider>
    </LocaleProvider>
  );
}
