import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAudienceReport, readTrend } from "./audienceReport.js";

describe("audience report", () => {
  it("uses the period unique count instead of adding daily uniques", () => {
    const trend = readTrend({
      results: [
        { dimensions: ["2026-09-28", "youtube_channel_click"], metrics: [1, 2] },
        { dimensions: ["2026-09-29", "youtube_channel_click"], metrics: [2, 4] },
      ],
      meta: { time_labels: ["2026-09-28", "2026-09-29"] },
    });
    const dailyUsers = trend.reduce((sum, day) => sum + day.youtubeUsers, 0);
    assert.equal(dailyUsers, 3);

    const queries = [];
    const reportPromise = buildAudienceReport({
      env: {
        PLAUSIBLE_DOMAIN: "duahbed.example",
        PLAUSIBLE_API_KEY: "server-key",
      },
      searchParams: new URLSearchParams("preset=day&timezone=Africa/Accra&campaign=poster"),
      now: new Date("2026-09-29T15:00:00Z"),
      fetchImpl: async (_url, init) => {
        assert.equal(init.headers.Authorization, "Bearer server-key");
        const body = JSON.parse(init.body);
        queries.push(body);
        if (body.dimensions[0] === "time:day") {
          return {
            ok: true,
            json: async () => ({
              results: [
                { dimensions: ["2026-09-29", "youtube_channel_click"], metrics: [1, 4] },
                { dimensions: ["2026-09-29", "whatsapp_channel_click"], metrics: [1, 1] },
              ],
              meta: { time_labels: ["2026-09-29"] },
            }),
          };
        }
        if (body.dimensions[0] === "event:props:campaign") {
          return {
            ok: true,
            json: async () => ({ results: [{ dimensions: ["poster"], metrics: [4] }] }),
          };
        }
        const previous = String(body.date_range[0]).startsWith("2026-09-28");
        return {
          ok: true,
          json: async () => ({
            results: previous
              ? [
                  { dimensions: ["youtube_channel_click"], metrics: [1, 1] },
                  { dimensions: ["whatsapp_channel_click"], metrics: [0, 0] },
                ]
              : [
                  { dimensions: ["youtube_channel_click"], metrics: [4, 9] },
                  { dimensions: ["whatsapp_channel_click"], metrics: [2, 2] },
                  { dimensions: ["qr_landing_view"], metrics: [8, 10] },
                ],
          }),
        };
      },
    });

    return reportPromise.then((report) => {
      assert.equal(report.channels.youtube.users, 4);
      assert.notEqual(report.channels.youtube.users, trend[0].youtubeUsers + trend[1].youtubeUsers);
      assert.equal(report.channels.youtube.rate, 0.5);
      assert.equal(report.channels.youtube.previous.users, 1);
      assert.equal(JSON.stringify(report).includes("server-key"), false);
      assert.equal(JSON.stringify(report).includes("totalUsers"), false);
      assert.equal(queries.some((query) => query.filters.some((filter) => filter[2]?.includes("poster"))), true);
    });
  });

  it("does not turn a failed query into zero clicks", async () => {
    const report = await buildAudienceReport({
      env: { PLAUSIBLE_DOMAIN: "duahbed.example", PLAUSIBLE_API_KEY: "server-key" },
      searchParams: new URLSearchParams("preset=day&timezone=UTC"),
      now: new Date("2026-09-29T15:00:00Z"),
      fetchImpl: async () => ({ ok: false, status: 500, json: async () => ({}) }),
    });

    assert.equal(report.status, "error");
    assert.equal(report.channels, null);
  });
});
