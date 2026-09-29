import { buildAudienceCsv } from "../src/lib/audienceCsv.js";
import { buildAudienceReport } from "./audienceReport.js";

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

export function createAdminMiddleware(options = {}) {
  return function adminMiddleware(req, res, next) {
    const host = req.headers?.host || "localhost";
    let url;
    try {
      url = new URL(req.url || "/", `http://${host}`);
    } catch {
      next();
      return;
    }

    if (url.pathname !== "/api/audience") {
      next();
      return;
    }

    const env = options.env ?? process.env;
    const fetchImpl = options.fetchImpl ?? fetch;
    const now = (options.now ?? (() => new Date()))();

    route({ req, res, url, env, fetchImpl, now }).catch(() => {
      if (!res.headersSent) {
        send(res, 500, { error: "The request could not be completed." });
      }
    });
  };
}

async function route({ res, url, env, fetchImpl, now }) {
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
