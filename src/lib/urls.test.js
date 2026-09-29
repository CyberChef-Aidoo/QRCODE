import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { channelLinkState } from "./urls.js";

describe("channelLinkState", () => {
  it("keeps a button off when the link is empty", () => {
    assert.equal(channelLinkState("").status, "empty");
    assert.equal(channelLinkState("   ").status, "empty");
    assert.equal(channelLinkState(undefined).status, "empty");
  });

  it("keeps a button off unless the link is https", () => {
    assert.equal(
      channelLinkState("http://www.youtube.com/@school").status,
      "invalid",
    );
    assert.equal(channelLinkState("not a link").status, "invalid");

    const ready = channelLinkState("https://www.youtube.com/@school");
    assert.equal(ready.status, "ready");
    assert.equal(ready.href, "https://www.youtube.com/@school");
    assert.equal(ready.hostname, "youtube.com");
  });
});
