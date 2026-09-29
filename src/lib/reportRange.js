const CAMPAIGN = /^[A-Za-z0-9][A-Za-z0-9 ._~-]{0,79}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PRESETS = new Set(["day", "7d", "30d", "custom"]);
const MAX_DAYS = 120;

export function isTimeZone(timeZone) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function formatDateInZone(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function addCalendarDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function daysInclusive(from, to) {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86400000) + 1;
}

function zoneParts(instant, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const bag = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      bag[part.type] = part.value;
    }
  }
  if (bag.hour === "24") {
    bag.hour = "00";
  }
  return bag;
}

function offsetMinutes(instant, timeZone) {
  const parts = zoneParts(instant, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Local start or end of a calendar date, with that timezone's offset. */
export function zonedDateTime(isoDate, timeZone, endOfDay) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const hour = endOfDay ? 23 : 0;
  const minute = endOfDay ? 59 : 0;
  const second = endOfDay ? 59 : 0;
  let utc = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = offsetMinutes(new Date(utc), timeZone);
    const next = Date.UTC(year, month - 1, day, hour, minute, second) - offset * 60000;
    if (next === utc) {
      break;
    }
    utc = next;
  }

  const offset = offsetMinutes(new Date(utc), timeZone);
  const sign = offset >= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  const clock = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  return `${isoDate}T${clock}${sign}${hours}:${minutes}`;
}

export function toPlausibleRange(bounds) {
  return [
    zonedDateTime(bounds.from, bounds.timeZone, false),
    zonedDateTime(bounds.to, bounds.timeZone, true),
  ];
}

export function rangeForPreset(preset, timeZone, now) {
  const to = formatDateInZone(now, timeZone);
  const length = preset === "day" ? 1 : preset === "7d" ? 7 : 30;
  return {
    preset,
    from: addCalendarDays(to, -(length - 1)),
    to,
    timeZone,
  };
}

export function previousBounds(bounds) {
  const length = daysInclusive(bounds.from, bounds.to);
  const to = addCalendarDays(bounds.from, -1);
  return {
    preset: "custom",
    from: addCalendarDays(to, -(length - 1)),
    to,
    timeZone: bounds.timeZone,
  };
}

export function parseReportQuery(params, now = new Date()) {
  const preset = params.get("preset") || "7d";
  const timeZone = params.get("timezone") || "Africa/Accra";
  const campaign = (params.get("campaign") || "").trim();

  if (!PRESETS.has(preset)) {
    throw new Error("Choose a date preset or a custom range.");
  }
  if (!isTimeZone(timeZone)) {
    throw new Error("Choose a valid reporting timezone.");
  }
  if (campaign && (campaign.includes("@") || !CAMPAIGN.test(campaign))) {
    throw new Error("That campaign filter cannot be used.");
  }

  if (preset === "custom") {
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    if (!ISO_DATE.test(from) || !ISO_DATE.test(to) || from > to) {
      throw new Error("Choose a start date and an end date.");
    }
    if (daysInclusive(from, to) > MAX_DAYS) {
      throw new Error("Choose a range of 120 days or fewer.");
    }
    return { preset, from, to, timeZone, campaign };
  }

  return { ...rangeForPreset(preset, timeZone, now), campaign };
}
