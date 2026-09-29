function ExternalIcon() {
  return (
    <svg
      className="external-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M14 5h5v5h-2V8.4l-7.3 7.3-1.4-1.4L15.6 7H14V5zM6 7h5v2H8v9h9v-3h2v5H6V7z"
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

export default function ChannelLink({ id, label, benefit, tone, state }) {
  const benefitId = `${id}-benefit`;
  const descriptionId = `${id}-status`;

  return (
    <div className="channel-action">
      <p id={benefitId} className="channel-benefit">
        {benefit}
      </p>
      {state.status !== "ready" ? (
        <button
          type="button"
          className={`channel-link channel-link--${tone}`}
          disabled
          aria-describedby={descriptionId}
        >
          <span className="channel-link__label">{label}</span>
        </button>
      ) : (
        <a
          className={`channel-link channel-link--${tone}`}
          href={state.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={descriptionId}
        >
          <span className="channel-link__label">{label}</span>
          <ExternalIcon />
        </a>
      )}
      <p id={descriptionId} className="channel-status">
        {state.status === "ready"
          ? `Opens ${state.hostname} in a new tab.`
          : unavailableMessage(state)}
      </p>
    </div>
  );
}
