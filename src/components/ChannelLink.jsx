import { channelLinkState } from "../lib/urls.js";
import { pageCopy, siteConfig } from "../site.config.js";

function PlayIcon() {
  return (
    <svg className="channel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M8 5.1v13.8L19.2 12 8 5.1z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="channel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M5 4h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H9.2L5 20.2V6a2 2 0 0 1 2-2z"
      />
    </svg>
  );
}

function unavailableMessage(state) {
  if (state.status === "empty") {
    return "This link has not been added yet.";
  }

  return "This link is not ready yet. It needs a full https:// address.";
}

function ChannelLink({ id, label, caption, tone, state, icon }) {
  const captionId = `${id}-caption`;
  const Icon = icon;

  if (state.status !== "ready") {
    return (
      <div className="channel-action">
        <button
          type="button"
          className={`channel-link channel-link--${tone}`}
          disabled
          aria-describedby={captionId}
        >
          <Icon />
          <span>{label}</span>
        </button>
        <p id={captionId} className="channel-caption">
          {unavailableMessage(state)}
        </p>
      </div>
    );
  }

  return (
    <div className="channel-action">
      <a
        className={`channel-link channel-link--${tone}`}
        href={state.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={captionId}
      >
        <Icon />
        <span>{label}</span>
      </a>
      <p id={captionId} className="channel-caption">
        {caption}
      </p>
    </div>
  );
}

export default function ChannelStack({ idPrefix }) {
  const youtube = channelLinkState(siteConfig.youtubeChannelUrl);
  const whatsapp = channelLinkState(siteConfig.whatsappChannelUrl);

  return (
    <div className="channel-stack">
      <ChannelLink
        id={`${idPrefix}-youtube`}
        label={pageCopy.youtubeLabel}
        caption={pageCopy.youtubeCaption}
        tone="youtube"
        state={youtube}
        icon={PlayIcon}
      />
      <ChannelLink
        id={`${idPrefix}-whatsapp`}
        label={pageCopy.whatsappLabel}
        caption={pageCopy.whatsappCaption}
        tone="whatsapp"
        state={whatsapp}
        icon={ChatIcon}
      />
      <p className="confirm-line">{pageCopy.confirmLine}</p>
    </div>
  );
}
