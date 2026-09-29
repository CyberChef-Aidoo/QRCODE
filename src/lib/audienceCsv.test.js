import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAudienceCsv } from "./audienceCsv.js";

const report = {
  timeZone: "Africa/Accra",
  campaign: "poster",
  range: { from: "2026-09-23", to: "2026-09-29" },
  channels: {
    youtube: { users: 4, clicks: 9, previous: { users: 1, clicks: 2 }, rate: 0.5 },
    whatsapp: { users: 3, clicks: 3, previous: { users: 0, clicks: 1 }, rate: null },
  },
  trend: [
    {
      date: "2026-09-28",
      youtubeUsers: 1,
      youtubeClicks: 1,
      whatsappUsers: 0,
      whatsappClicks: 1,
    },
  ],
};

describe("audience csv", () => {
  it("exports the filtered report without a combined unique-visitor total", () => {
    const csv = buildAudienceCsv(report);

    assert.match(csv, /not subscriptions/);
    assert.match(csv, /poster/);
    assert.match(csv, /period,2026-09-23 to 2026-09-29,Africa\/Accra,poster,4,9,3,3,0\.5,/);
    assert.equal(csv.includes("total_clicked_users"), false);
    assert.equal(csv.includes("subscription"), true);
  });
});
