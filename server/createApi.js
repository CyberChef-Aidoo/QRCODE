import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { buildAudienceCsv } from "../src/lib/audienceCsv.js";
import { buildAudienceReport } from "./audienceReport.js";

const COOKIE = "audience_session";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const FAILURE_LIMIT = 8;

function send(res, status, body, extraHeaders = {}) {
  const csv = typeof body === "string";
  res.writeHead(status, {
    "Content-Type": csv ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  res.end(csv ? body : JSON.stringify(body));
}

function passwordsMatch(input, expected) {
  if (!expected) {
    return false;
  }
  const left = createHash("sha256").update(String(input)).digest();
  const right = createHash("sha256").update(String(expected)).digest();
  return timingSafeEqual(left, right);
}

function cookieToken(header) {
  const parts = String(header ?? "").split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return "";
}

function readSession(sessions, token, now) {
  const row = token ? sessions.get(token) : undefined;
  if (!row) {
    return false;
  }
  if (now.getTime() - row.createdAt > MAX_AGE_MS) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function clientAddress(req) {
  return req.socket?.remoteAddress || "unknown";
}

function tooManyFailures(failures, address, now) {
  const row = failures.get(address);
  if (!row || now.getTime() - row.startedAt > FAILURE_WINDOW_MS) {
    return false;
  }
  return row.count >= FAILURE_LIMIT;
}

function recordFailure(failures, address, now) {
  const row = failures.get(address);
  if (!row || now.getTime() - row.startedAt > FAILURE_WINDOW_MS) {
    failures.set(address, { count: 1, startedAt: now.getTime() });
    return;
  }
  row.count += 1;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2048) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

function sessionCookie(token, req, clearing = false) {
  const secure =
    req.socket?.encrypted || String(req.headers?.["x-forwarded-proto"] || "").includes("https")
      ? "; Secure"
      : "";
  const value = clearing ? "" : token;
  const age = clearing ? 0 : Math.floor(MAX_AGE_MS / 1000);
  return `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${secure}`;
}

export function createAdminMiddleware(options = {}) {
  const sessions = options.sessions ?? new Map();
  const failures = options.failures ?? new Map();

  return function adminMiddleware(req, res, next) {
    const host = req.headers?.host || "localhost";
    let url;
    try {
      url = new URL(req.url || "/", `http://${host}`);
    } catch {
      next();
      return;
    }

    if (url.pathname !== "/api/audience" && !url.pathname.startsWith("/api/admin")) {
      next();
      return;
    }

    const env = options.env ?? process.env;
    const fetchImpl = options.fetchImpl ?? fetch;
    const now = (options.now ?? (() => new Date()))();

    route({ req, res, url, env, fetchImpl, now, sessions, failures }).catch(() => {
      if (!res.headersSent) {
        send(res, 500, { error: "The request could not be completed." });
      }
    });
  };
}

async function route({ req, res, url, env, fetchImpl, now, sessions, failures }) {
  const password = typeof env.ADMIN_PASSWORD === "string" ? env.ADMIN_PASSWORD : "";
  const authenticated = readSession(sessions, cookieToken(req.headers?.cookie), now);

  if (url.pathname === "/api/admin/session" && req.method === "GET") {
    send(res, 200, {
      authenticated,
      signInConfigured: password.length > 0,
    });
    return;
  }

  if (url.pathname === "/api/admin/login" && req.method === "POST") {
    const address = clientAddress(req);
    if (tooManyFailures(failures, address, now)) {
      send(res, 429, { error: "Try again later." });
      return;
    }
    const body = await readJson(req);
    if (!passwordsMatch(body.password, password)) {
      recordFailure(failures, address, now);
      send(res, 401, { error: "The password was not accepted." });
      return;
    }
    failures.delete(address);
    const token = randomBytes(32).toString("hex");
    sessions.set(token, { createdAt: now.getTime() });
    send(res, 200, { authenticated: true }, { "Set-Cookie": sessionCookie(token, req) });
    return;
  }

  if (url.pathname === "/api/admin/logout" && req.method === "POST") {
    const token = cookieToken(req.headers?.cookie);
    sessions.delete(token);
    send(res, 200, { authenticated: false }, { "Set-Cookie": sessionCookie("", req, true) });
    return;
  }

  if (url.pathname !== "/api/audience") {
    send(res, 404, { error: "Not found." });
    return;
  }

  if (!authenticated) {
    send(res, 401, { error: "Sign in is required." });
    return;
  }

  let report;
  try {
    report = await buildAudienceReport({
      env,
      searchParams: url.searchParams,
      now,
      fetchImpl,
    });
  } catch (error) {
    send(res, 400, { error: error.message || "The report could not be requested." });
    return;
  }

  if (report.status === "unconfigured") {
    send(res, 200, report);
    return;
  }
  if (report.status === "error") {
    send(res, 502, { status: "error" });
    return;
  }

  if (url.searchParams.get("format") === "csv") {
    send(res, 200, buildAudienceCsv(report), {
      "Content-Disposition": "attachment; filename=\"audience.csv\"",
    });
    return;
  }

  send(res, 200, report);
}
