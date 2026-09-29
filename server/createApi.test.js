import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { createAdminMiddleware } from "./createApi.js";

function request({ method, url }) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { host: "localhost" };
  req.socket = { remoteAddress: "127.0.0.1" };
  return req;
}

function call(middleware, req) {
  return new Promise((resolve) => {
    const res = {
      headersSent: false,
      statusCode: 0,
      headers: {},
      body: "",
      writeHead(code, headers) {
        this.headersSent = true;
        this.statusCode = code;
        this.headers = headers;
      },
      end(body) {
        this.body = body;
        resolve(res);
      },
    };
    middleware(req, res, () => resolve(res));
  });
}

describe("audience api", () => {
  it("returns the report without a login and keeps the stats key off the response", async () => {
    const middleware = createAdminMiddleware({
      env: {
        PLAUSIBLE_DOMAIN: "duahbed.example",
        PLAUSIBLE_API_KEY: "server-key",
      },
      now: () => new Date("2026-09-29T15:00:00Z"),
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ results: [] }),
      }),
    });

    const report = await call(
      middleware,
      request({ method: "GET", url: "/api/audience?preset=day&timezone=Africa/Accra" }),
    );

    assert.equal(report.statusCode, 200);
    assert.equal(JSON.parse(report.body).status, "empty");
    assert.equal(report.body.includes("server-key"), false);
    assert.equal(report.headers["Set-Cookie"], undefined);
  });
});
