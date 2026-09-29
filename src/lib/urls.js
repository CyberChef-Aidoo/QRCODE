function cleanInput(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  const hasMatchingQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  return hasMatchingQuotes ? trimmed.slice(1, -1).trim() : trimmed;
}

function readHttpsUrl(value) {
  const trimmed = cleanInput(value);
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "https" };
  }

  if (!/[a-z0-9]/i.test(url.hostname)) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true, url };
}

/** Whether a channel button should open its link. */
export function channelLinkState(value) {
  const parsed = readHttpsUrl(value);
  if (!parsed.ok) {
    return {
      status: parsed.reason === "empty" ? "empty" : "invalid",
      reason: parsed.reason,
    };
  }

  return {
    status: "ready",
    href: parsed.url.href,
    hostname: parsed.url.hostname.replace(/^www\./i, ""),
  };
}
