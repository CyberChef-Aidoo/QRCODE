import { useEffect } from "react";
import AccountingQuiz from "../components/AccountingQuiz.jsx";
import Layout from "../components/Layout.jsx";
import PlatformCards from "../components/PlatformCard.jsx";
import { trackTaggedLanding } from "../lib/analytics.js";
import { organisationLabel, pageCopy } from "../site.config.js";

export default function LandingPage() {
  const name = organisationLabel();

  useEffect(() => {
    document.title = `${name} — ${pageCopy.heroHeading}`;
  }, [name]);

  useEffect(() => {
    trackTaggedLanding(window.location.search);
  }, []);

  return (
    <Layout organisationName={name}>
      <header className="hero">
        <h1>{pageCopy.heroHeading}</h1>
        <p className="lead">{pageCopy.heroText}</p>
      </header>
      <PlatformCards />
      <AccountingQuiz />
      <section className="card" aria-labelledby="about-title">
        <h2 id="about-title">{pageCopy.aboutHeading}</h2>
        <p>{pageCopy.aboutText}</p>
      </section>
    </Layout>
  );
}
