/**
 * Cookieless visit and click counts via Plausible.
 * A channel click is not a subscription or a follow.
 * Nothing here sends a name, an email, or a device fingerprint.
 */

const LANDING_EVENT = "qr_landing_view";
const CLICK_EVENTS = {
  youtube: "youtube_channel_click",
  whatsapp: "whatsapp_channel_click",
};

const UTM_FIELDS = [
  ["utm_source", "source"],
  ["utm_medium", "medium"],
  ["utm_campaign", "campaign"],
  ["utm_content", "content"],
  ["utm_term", "term"],
];

const SAFE_VALUE = /^[A-Za-z0-9][A-Za-z0-9 ._~-]{0,79}$/;

let landingTracked = false;
let scriptInstalled = false;

function envValue(name) {
  const env = import.meta.env ?? {};
  const value = env[name];
  return typeof value === "string" ? value.trim() : "";
}

/** Campaign fields from a query string. Other parameters are ignored. */
export function readAttribution(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const attribution = {};

  for (const [queryKey, propName] of UTM_FIELDS) {
    const value = params.get(queryKey)?.trim() ?? "";
    if (!value.includes("@") && SAFE_VALUE.test(value)) {
      attribution[propName] = value;
    }
  }

  return attribution;
}

export function isTaggedVisit(attribution) {
  return Object.keys(attribution).length > 0;
}

function deliver(name, attribution) {
  if (!envValue("VITE_PLAUSIBLE_DOMAIN")) {
    return;
  }
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }

  if (isTaggedVisit(attribution)) {
    window.plausible(name, { props: attribution });
    return;
  }

  window.plausible(name);
}

/**
 * Sends qr_landing_view once per page load, and only when the address
 * has UTM campaign parameters. Re-renders do not send it again.
 */
export function trackTaggedLanding(search, transport = deliver) {
  const attribution = readAttribution(search);
  if (!isTaggedVisit(attribution) || landingTracked) {
    return false;
  }

  landingTracked = true;
  transport(LANDING_EVENT, attribution);
  return true;
}

/** Sends a channel click without waiting, and without changing the link. */
export function trackChannelClick(channel, search, transport = deliver) {
  const name = CLICK_EVENTS[channel];
  if (!name) {
    return false;
  }

  transport(name, readAttribution(search));
  return true;
}

export function resetLandingTracking() {
  landingTracked = false;
}

/** Loads the Plausible script when a site domain is configured. */
export function installAnalytics() {
  const domain = envValue("VITE_PLAUSIBLE_DOMAIN");
  if (!domain || scriptInstalled || typeof document === "undefined") {
    return;
  }

  scriptInstalled = true;
  window.plausible =
    window.plausible ||
    function plausibleQueue() {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };

  const configuredSource = envValue("VITE_PLAUSIBLE_SRC");
  const source = configuredSource.startsWith("https://")
    ? configuredSource
    : "https://plausible.io/js/script.js";

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = domain;
  script.dataset.analytics = "plausible";
  script.src = source;
  document.head.appendChild(script);
}
