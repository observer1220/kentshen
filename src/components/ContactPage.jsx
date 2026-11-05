import { useLocale } from "../i18n/LocaleContext";
import { Link } from "../router";
import SocialLinks from "./Social";

export default function ContactPage() {
  const { data } = useLocale();
  const c = data.ui.contact;

  return (
    <section className="page contact-page">
      <Link to="/" className="backlink">
        {c.backLabel}
      </Link>

      <h2 className="page-heading">{c.heading}</h2>
      <p className="contact-lead">{c.lead}</p>
      <SocialLinks variant="cards" />
    </section>
  );
}
