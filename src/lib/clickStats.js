import { CLICK_EVENTS } from "./analytics.js";

export const CLICK_GOALS = [
  { id: "youtube", goal: CLICK_EVENTS.youtube, title: "YouTube" },
  { id: "whatsapp", goal: CLICK_EVENTS.whatsapp, title: "WhatsApp" },
];

export const DATE_RANGES = [
  { id: "day", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

function textSetting(env, name) {
  const value = env?.[name];
  return typeof value === "string" ? value.trim() : "";
}

/** Domain and read-only stats key. The key is absent until .env is filled in. */
export function statsConfig(env = import.meta.env ?? {}) {
  const domain = textSetting(env, "VITE_PLAUSIBLE_DOMAIN");
  const apiKey = textSetting(env, "VITE_PLAUSIBLE_API_KEY");
  const api = textSetting(env, "VITE_PLAUSIBLE_API");

  return {
    domain,
    apiKey,
    apiBase: api.startsWith("https://") ? api.replace(/\/$/, "") : "https://plausible.io",
    ready: Boolean(domain && apiKey),
  };
}

/** A click-goal query. Visitors are estimated people, not subscriptions. */
export function clickStatsQuery(siteId, goal, dateRange) {
  return {
    site_id: siteId,
    metrics: ["visitors", "events"],
    date_range: dateRange,
    filters: [["is", "event:goal", [goal]]],
  };
}

export function readClickCount(payload) {
  const metrics = payload?.results?.[0]?.metrics;
  const users = Number(metrics?.[0]);
  const clicks = Number(metrics?.[1]);

  return {
    users: Number.isFinite(users) ? users : 0,
    clicks: Number.isFinite(clicks) ? clicks : 0,
  };
}

export async function fetchClickStats({
  domain,
  apiKey,
  apiBase,
  dateRange,
  signal,
  fetchImpl = fetch,
}) {
  const counts = {};

  for (const item of CLICK_GOALS) {
    const response = await fetchImpl(`${apiBase}/api/v2/query`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clickStatsQuery(domain, item.goal, dateRange)),
    });

    if (!response.ok) {
      throw new Error("The click counts could not be loaded.");
    }

    counts[item.id] = readClickCount(await response.json());
  }

  return counts;
}
