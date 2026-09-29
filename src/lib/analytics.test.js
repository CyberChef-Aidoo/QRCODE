import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isTaggedVisit,
  readAttribution,
  resetLandingTracking,
  trackChannelClick,
  trackTaggedLanding,
} from "./analytics.js";

function recorder() {
  const events = [];
  return {
    events,
    transport(name, attribution) {
      events.push({ name, attribution });
    },
  };
}

describe("QR campaign attribution", () => {
  it("keeps UTM campaign fields and ignores other details", () => {
    const attribution = readAttribution(
      "?utm_source=qr&utm_medium=offline&utm_campaign=poster&utm_content=gate&email=student@school.com&name=Ama",
    );

    assert.deepEqual(attribution, {
      source: "qr",
      medium: "offline",
      campaign: "poster",
      content: "gate",
    });
    assert.equal(isTaggedVisit(attribution), true);
  });

  it("drops values that could carry an email address", () => {
    const attribution = readAttribution(
      "?utm_campaign=poster&utm_source=student@school.com",
    );

    assert.deepEqual(attribution, { campaign: "poster" });
  });

  it("does not treat an ordinary visit as a QR landing", () => {
    assert.equal(isTaggedVisit(readAttribution("")), false);
    assert.equal(isTaggedVisit(readAttribution("?ref=class")), false);
  });
});

describe("analytics events", () => {
  it("records one tagged landing view when the page effect runs again", () => {
    resetLandingTracking();
    const { events, transport } = recorder();
    const search = "?utm_source=qr&utm_medium=offline&utm_campaign=poster";

    assert.equal(trackTaggedLanding(search, transport), true);
    assert.equal(trackTaggedLanding(search, transport), false);

    assert.deepEqual(events, [
      {
        name: "qr_landing_view",
        attribution: { source: "qr", medium: "offline", campaign: "poster" },
      },
    ]);
  });

  it("does not record an untagged landing", () => {
    resetLandingTracking();
    const { events, transport } = recorder();

    assert.equal(trackTaggedLanding("", transport), false);
    assert.deepEqual(events, []);
  });

  it("adds the same campaign to each channel click", () => {
    const { events, transport } = recorder();
    const search = "?utm_source=qr&utm_campaign=poster";

    assert.equal(trackChannelClick("youtube", search, transport), true);
    assert.equal(trackChannelClick("whatsapp", search, transport), true);

    assert.deepEqual(events, [
      {
        name: "youtube_channel_click",
        attribution: { source: "qr", campaign: "poster" },
      },
      {
        name: "whatsapp_channel_click",
        attribution: { source: "qr", campaign: "poster" },
      },
    ]);
  });

  it("does not record a click as a subscription", () => {
    const { events, transport } = recorder();
    trackChannelClick("youtube", "?utm_campaign=poster", transport);
    trackChannelClick("whatsapp", "?utm_campaign=poster", transport);
    trackChannelClick("subscribe", "?utm_campaign=poster", transport);

    assert.deepEqual(
      events.map((event) => event.name),
      ["youtube_channel_click", "whatsapp_channel_click"],
    );
  });
});
