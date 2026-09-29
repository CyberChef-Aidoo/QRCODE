import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseReportQuery,
  previousBounds,
  toPlausibleRange,
  zonedDateTime,
} from "./reportRange.js";

describe("reporting timezone", () => {
  it("bounds a custom day with the selected timezone offset", () => {
    assert.equal(zonedDateTime("2026-01-14", "America/New_York", false), "2026-01-14T00:00:00-05:00");
    assert.equal(zonedDateTime("2026-01-14", "America/New_York", true), "2026-01-14T23:59:59-05:00");
    assert.equal(zonedDateTime("2026-09-29", "Africa/Accra", false), "2026-09-29T00:00:00+00:00");
  });

  it("builds preset ranges in the reporting timezone", () => {
    const params = new URLSearchParams("preset=7d&timezone=Africa/Accra");
    const query = parseReportQuery(params, new Date("2026-09-29T15:00:00Z"));

    assert.equal(query.from, "2026-09-23");
    assert.equal(query.to, "2026-09-29");
    assert.deepEqual(toPlausibleRange(query), [
      "2026-09-23T00:00:00+00:00",
      "2026-09-29T23:59:59+00:00",
    ]);
    assert.deepEqual(previousBounds(query), {
      preset: "custom",
      from: "2026-09-16",
      to: "2026-09-22",
      timeZone: "Africa/Accra",
    });
  });

  it("rejects an email stuffed into the campaign filter", () => {
    const params = new URLSearchParams("campaign=student@school.test");
    assert.throws(() => parseReportQuery(params), /campaign/);
  });
});
