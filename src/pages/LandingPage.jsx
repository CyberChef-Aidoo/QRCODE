import { useEffect, useState } from "react";
import AccountingQuiz from "../components/AccountingQuiz.jsx";
import ChannelLink from "../components/ChannelLink.jsx";
import Layout from "../components/Layout.jsx";
import { channelLinkState } from "../lib/urls.js";
import {
  logoSrc,
  organisationLabel,
  pageCopy,
  siteConfig,
} from "../site.config.js";

function OrganisationLogo({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return null;
  }

  return (
    <img
      className="logo"
      src={src}
      alt=""
      width="1024"
      height="1024"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

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
      <OrganisationLogo src={logoSrc()} />
      <header className="hero">
        <h1>{pageCopy.heroHeading}</h1>
        <p className="lead">{pageCopy.heroText}</p>
      </header>
      <section className="panel" aria-labelledby="channels-title">
        <h2 id="channels-title">{pageCopy.channelsHeading}</h2>
        <div className="actions">
          <ChannelLink
            id="youtube"
            label={pageCopy.youtubeLabel}
            benefit={pageCopy.youtubeBenefit}
            tone="youtube"
            state={youtube}
          />
          <ChannelLink
            id="whatsapp"
            label={pageCopy.whatsappLabel}
            benefit={pageCopy.whatsappBenefit}
            tone="whatsapp"
            state={whatsapp}
          />
        </div>
      </section>
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
    </Layout>
  );
}
