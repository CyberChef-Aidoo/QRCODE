import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLICK_EVENTS } from "./analytics.js";
import {
  clickStatsQuery,
  readClickCount,
  statsConfig,
} from "./clickStats.js";

describe("click stats", () => {
  it("asks for clicked users and clicks, not subscriptions", () => {
    const query = clickStatsQuery("duahbed.example", CLICK_EVENTS.youtube, "7d");

    assert.deepEqual(query, {
      site_id: "duahbed.example",
      metrics: ["visitors", "events"],
      date_range: "7d",
      filters: [["is", "event:goal", ["youtube_channel_click"]]],
    });
    assert.equal(JSON.stringify(query).includes("subscri"), false);
  });

  it("reads the unique-visitor count separately from total clicks", () => {
    assert.deepEqual(
      readClickCount({ results: [{ metrics: [4, 11], dimensions: [] }] }),
      { users: 4, clicks: 11 },
    );
    assert.deepEqual(readClickCount({}), { users: 0, clicks: 0 });
  });

  it("stays off until both the domain and a stats key are set", () => {
    assert.equal(statsConfig({}).ready, false);
    assert.equal(
      statsConfig({
        VITE_PLAUSIBLE_DOMAIN: "duahbed.example",
        VITE_PLAUSIBLE_API_KEY: "read-only",
      }).ready,
      true,
    );
  });
});
