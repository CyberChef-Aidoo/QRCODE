import { useEffect, useId } from "react";
import { channelLinkState } from "../lib/urls.js";
import { pageCopy, siteConfig } from "../site.config.js";
import { ChatIcon, PlayIcon } from "./icons.jsx";

function unavailableMessage(state) {
  if (state.status === "empty") {
    return "This link has not been added yet.";
  }

  return "This link is not ready yet. It needs a full https:// address.";
}

function PlatformCard({ title, benefit, label, tone, state, icon: Icon }) {
  const statusId = useId();
  const ready = state.status === "ready";
  const className = `cta cta--${tone}`;

  return (
    <article className={`card platform-card platform-card--${tone}`}>
      <div className="platform-card__heading">
        <span className="platform-card__icon">
          <Icon />
        </span>
        <h2>{title}</h2>
      </div>
      <p>{benefit}</p>
      {ready ? (
        <a
          className={className}
          href={state.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby="channel-note"
        >
          {label}
        </a>
      ) : (
        <>
          <button type="button" className={className} disabled aria-describedby={statusId}>
            {label}
          </button>
          <p id={statusId} className="platform-card__status">
            {unavailableMessage(state)}
          </p>
        </>
      )}
    </article>
  );
}

export default function PlatformCards() {
  const youtube = channelLinkState(siteConfig.youtubeChannelUrl);
  const whatsapp = channelLinkState(siteConfig.whatsappChannelUrl);
  const showNote = youtube.status === "ready" || whatsapp.status === "ready";

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
    <div className="platforms">
      <PlatformCard
        title={pageCopy.youtubeTitle}
        benefit={pageCopy.youtubeCaption}
        label={pageCopy.youtubeLabel}
        tone="youtube"
        state={youtube}
        icon={PlayIcon}
      />
      <PlatformCard
        title={pageCopy.whatsappTitle}
        benefit={pageCopy.whatsappCaption}
        label={pageCopy.whatsappLabel}
        tone="whatsapp"
        state={whatsapp}
        icon={ChatIcon}
      />
      {showNote ? (
        <p id="channel-note" className="shared-note">
          {pageCopy.sharedNote}
        </p>
      ) : null}
    </div>
  );
}
