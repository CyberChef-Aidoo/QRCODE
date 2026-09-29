import { CLICK_EVENTS, LANDING_EVENT } from "../src/lib/analytics.js";
import {
  parseReportQuery,
  previousBounds,
  toPlausibleRange,
} from "../src/lib/reportRange.js";

const GOALS = [CLICK_EVENTS.youtube, CLICK_EVENTS.whatsapp, LANDING_EVENT];

function textSetting(env, name) {
  const value = env?.[name];
  return typeof value === "string" ? value.trim() : "";
}

export function plausibleSettings(env = process.env) {
  const domain = textSetting(env, "PLAUSIBLE_DOMAIN");
  const apiKey = textSetting(env, "PLAUSIBLE_API_KEY");
  const api = textSetting(env, "PLAUSIBLE_API");
  return {
    domain,
    apiKey,
    apiBase: api.startsWith("https://") ? api.replace(/\/$/, "") : "https://plausible.io",
    missing: [!domain && "PLAUSIBLE_DOMAIN", !apiKey && "PLAUSIBLE_API_KEY"].filter(Boolean),
  };
}

export function goalFilters(goals, campaign) {
  const filters = [["is", "event:goal", goals]];
  if (campaign) {
    filters.push(["is", "event:props:campaign", [campaign]]);
  }
  return filters;
}

function countPair(metrics) {
  const users = Number(metrics?.[0]);
  const clicks = Number(metrics?.[1]);
  return {
    users: Number.isFinite(users) ? users : 0,
    clicks: Number.isFinite(clicks) ? clicks : 0,
  };
}

export function indexGoalRows(payload) {
  const map = new Map();
  for (const row of payload?.results ?? []) {
    map.set(row.dimensions?.[0], countPair(row.metrics));
  }
  return map;
}

export function readTrend(payload) {
  const rows = new Map();
  const blank = (date) => ({
    date,
    youtubeUsers: 0,
    youtubeClicks: 0,
    whatsappUsers: 0,
    whatsappClicks: 0,
  });

  for (const row of payload?.results ?? []) {
    const date = String(row.dimensions?.[0] ?? "").slice(0, 10);
    const goal = row.dimensions?.[1];
    if (!date) {
      continue;
    }
    const entry = rows.get(date) ?? blank(date);
    const pair = countPair(row.metrics);
    if (goal === CLICK_EVENTS.youtube) {
      entry.youtubeUsers = pair.users;
      entry.youtubeClicks = pair.clicks;
    }
    if (goal === CLICK_EVENTS.whatsapp) {
      entry.whatsappUsers = pair.users;
      entry.whatsappClicks = pair.clicks;
    }
    rows.set(date, entry);
  }

  for (const label of payload?.meta?.time_labels ?? []) {
    const date = String(label).slice(0, 10);
    if (date && !rows.has(date)) {
      rows.set(date, blank(date));
    }
  }

  return [...rows.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function shareOfTaggedVisits(users, landingUsers, campaign) {
  if (!campaign || landingUsers == null || landingUsers <= 0 || users == null) {
    return null;
  }
  return users / landingUsers;
}

function channelFrom(current, previous, landingUsers, campaign, goal) {
  const pair = current.get(goal) ?? { users: 0, clicks: 0 };
  return {
    users: pair.users,
    clicks: pair.clicks,
    previous: previous ? (previous.get(goal) ?? { users: 0, clicks: 0 }) : null,
    rate: shareOfTaggedVisits(pair.users, landingUsers, campaign),
  };
}

async function runQuery(fetchImpl, settings, body) {
  const response = await fetchImpl(`${settings.apiBase}/api/v2/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Plausible query failed");
  }
  return response.json();
}

export async function buildAudienceReport({
  env = process.env,
  searchParams,
  now = new Date(),
  fetchImpl = fetch,
}) {
  const settings = plausibleSettings(env);
  if (settings.missing.length > 0) {
    return {
      status: "unconfigured",
      missing: settings.missing,
      channels: null,
      trend: null,
    };
  }

  const query = parseReportQuery(searchParams, now);
  const currentRange = toPlausibleRange(query);
  const earlierRange = toPlausibleRange(previousBounds(query));
  const aggregate = (dateRange, goals) => ({
    site_id: settings.domain,
    metrics: ["visitors", "events"],
    date_range: dateRange,
    dimensions: ["event:goal"],
    filters: goalFilters(goals, query.campaign),
    pagination: { limit: 10000, offset: 0 },
  });

  const [currentResult, previousResult, trendResult, campaignResult] = await Promise.allSettled([
    runQuery(fetchImpl, settings, aggregate(currentRange, GOALS)),
    runQuery(fetchImpl, settings, aggregate(earlierRange, [CLICK_EVENTS.youtube, CLICK_EVENTS.whatsapp])),
    runQuery(fetchImpl, settings, {
      site_id: settings.domain,
      metrics: ["visitors", "events"],
      date_range: currentRange,
      dimensions: ["time:day", "event:goal"],
      filters: goalFilters([CLICK_EVENTS.youtube, CLICK_EVENTS.whatsapp], query.campaign),
      include: { time_labels: true },
      pagination: { limit: 10000, offset: 0 },
    }),
    runQuery(fetchImpl, settings, {
      site_id: settings.domain,
      metrics: ["visitors"],
      date_range: currentRange,
      dimensions: ["event:props:campaign"],
      filters: [["is", "event:goal", GOALS]],
      pagination: { limit: 10000, offset: 0 },
    }),
  ]);

  if (currentResult.status !== "fulfilled") {
    return { status: "error", missing: [], channels: null, trend: null };
  }

  const current = indexGoalRows(currentResult.value);
  const previous = previousResult.status === "fulfilled" ? indexGoalRows(previousResult.value) : null;
  const landing = current.get(LANDING_EVENT) ?? { users: 0, clicks: 0 };
  const channels = {
    youtube: channelFrom(current, previous, landing.users, query.campaign, CLICK_EVENTS.youtube),
    whatsapp: channelFrom(current, previous, landing.users, query.campaign, CLICK_EVENTS.whatsapp),
  };
  const trend = trendResult.status === "fulfilled" ? readTrend(trendResult.value) : null;
  const idle =
    channels.youtube.users === 0 &&
    channels.youtube.clicks === 0 &&
    channels.whatsapp.users === 0 &&
    channels.whatsapp.clicks === 0;

  let campaigns = null;
  if (campaignResult.status === "fulfilled") {
    campaigns = (campaignResult.value.results ?? [])
      .map((row) => row.dimensions?.[0])
      .filter((value) => typeof value === "string" && value.trim())
      .sort();
  }

  return {
    status: idle ? "empty" : "ready",
    missing: [],
    updatedAt: now.toISOString(),
    timeZone: query.timeZone,
    range: { preset: query.preset, from: query.from, to: query.to },
    campaign: query.campaign,
    campaignsAvailable: campaignResult.status === "fulfilled",
    campaigns,
    landingUsers: query.campaign ? landing.users : null,
    channels,
    trend,
  };
}
