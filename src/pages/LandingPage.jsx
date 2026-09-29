import { useEffect } from "react";
import AccountingQuiz from "../components/AccountingQuiz.jsx";
import ChannelStack from "../components/ChannelLink.jsx";
import Layout from "../components/Layout.jsx";
import { channelLinkState } from "../lib/urls.js";
import { organisationLabel, pageCopy, siteConfig } from "../site.config.js";

function ResourceLink({ state, title, text, missingText }) {
  return (
    <li className="resource-card">
      <h3>{title}</h3>
      <p>{state.status === "ready" ? text : missingText || text}</p>
      {state.status === "ready" ? (
        <a href={state.href} target="_blank" rel="noopener noreferrer">
          Open {state.hostname}
          <span className="visually-hidden"> in a new tab</span>
        </a>
      ) : null}
    </li>
  );
}

export default function LandingPage() {
  const name = organisationLabel();
  const youtube = channelLinkState(siteConfig.youtubeChannelUrl);
  const whatsapp = channelLinkState(siteConfig.whatsappChannelUrl);

  useEffect(() => {
    document.title = `${name} — ${pageCopy.heroHeading}`;
  }, [name]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    if (youtube.status !== "ready") {
      console.warn(
        "YouTube button is off. Add an https link to youtubeChannelUrl in src/site.config.js.",
      );
    }

    if (whatsapp.status !== "ready") {
      console.warn(
        "WhatsApp button is off. Add an https link to whatsappChannelUrl in src/site.config.js.",
      );
    }
  }, [youtube.status, whatsapp.status]);

  return (
    <Layout organisationName={name}>
      <header className="hero">
        <h1>{pageCopy.heroHeading}</h1>
        <p className="lead">{pageCopy.heroText}</p>
      </header>
      <ChannelStack idPrefix="top" />
      <AccountingQuiz />
      <section className="panel" aria-labelledby="resources-title">
        <h2 id="resources-title">{pageCopy.resourcesHeading}</h2>
        <p className="panel-intro">{pageCopy.resourcesIntro}</p>
        <ul className="resource-list">
          <ResourceLink
            state={youtube}
            title={pageCopy.youtubeResourceTitle}
            text={pageCopy.youtubeResourceText}
          />
          <ResourceLink
            state={whatsapp}
            title={pageCopy.whatsappResourceTitle}
            text={pageCopy.whatsappResourceText}
            missingText={pageCopy.whatsappMissingText}
          />
          <li className="resource-card">
            <h3>{pageCopy.practiceResourceTitle}</h3>
            <p>{pageCopy.practiceResourceText}</p>
            <a href="#practice">Go to the question</a>
          </li>
        </ul>
      </section>
      <section className="panel" aria-labelledby="about-title">
        <h2 id="about-title">{pageCopy.aboutHeading}</h2>
        <p>{pageCopy.aboutText}</p>
      </section>
      <section className="panel" aria-label="Channel links">
        <ChannelStack idPrefix="bottom" />
      </section>
    </Layout>
  );
}
