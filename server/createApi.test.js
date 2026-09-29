import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import { createAdminMiddleware } from "./createApi.js";

function request({ method, url, cookie, body, address = "127.0.0.1" }) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { host: "localhost", cookie };
  req.socket = { remoteAddress: address };
  req.destroy = () => {};
  process.nextTick(() => {
    if (body) {
      req.emit("data", Buffer.from(body));
    }
    req.emit("end");
  });
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

describe("admin audience api", () => {
  it("requires a session and keeps the stats key off the response", async () => {
    const middleware = createAdminMiddleware({
      env: {
        ADMIN_PASSWORD: "staff-secret",
        PLAUSIBLE_DOMAIN: "duahbed.example",
        PLAUSIBLE_API_KEY: "server-key",
      },
      now: () => new Date("2026-09-29T15:00:00Z"),
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ results: [] }),
      }),
    });

    const denied = await call(middleware, request({ method: "GET", url: "/api/audience?preset=day" }));
    assert.equal(denied.statusCode, 401);

    const rejected = await call(
      middleware,
      request({
        method: "POST",
        url: "/api/admin/login",
        body: JSON.stringify({ password: "nope" }),
      }),
    );
    assert.equal(rejected.statusCode, 401);

    const signedIn = await call(
      middleware,
      request({
        method: "POST",
        url: "/api/admin/login",
        body: JSON.stringify({ password: "staff-secret" }),
      }),
    );
    assert.equal(signedIn.statusCode, 200);
    assert.match(signedIn.headers["Set-Cookie"], /HttpOnly/);
    const token = /audience_session=([^;]+)/.exec(signedIn.headers["Set-Cookie"])[1];

    const report = await call(
      middleware,
      request({
        method: "GET",
        url: "/api/audience?preset=day&timezone=Africa/Accra",
        cookie: `audience_session=${token}`,
      }),
    );
    assert.equal(report.statusCode, 200);
    assert.equal(report.body.includes("server-key"), false);
    assert.equal(report.body.includes("staff-secret"), false);
    assert.equal(JSON.parse(report.body).status, "empty");
  });
});
