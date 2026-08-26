import { describe, it, expect } from "vitest";
import { hlsUrl, streamThumbnailUrl, supportsNativeHls } from "./stream";

const STREAM_ID = "72ffbb035554bbd5347daa43ec85db20";

describe("stream URL helpers", () => {
  it("builds the Cloudflare HLS manifest URL", () => {
    expect(hlsUrl(STREAM_ID)).toBe(`https://videodelivery.net/${STREAM_ID}/manifest/video.m3u8`);
  });

  it("builds a thumbnail URL with a default offset", () => {
    expect(streamThumbnailUrl(STREAM_ID)).toBe(
      `https://videodelivery.net/${STREAM_ID}/thumbnails/thumbnail.jpg?time=0s`
    );
    expect(streamThumbnailUrl(STREAM_ID, "3s")).toContain("time=3s");
  });

  it("detects native HLS support from canPlayType", () => {
    const safari = { canPlayType: () => "maybe" } as unknown as HTMLVideoElement;
    const chrome = { canPlayType: () => "" } as unknown as HTMLVideoElement;
    expect(supportsNativeHls(safari)).toBe(true);
    expect(supportsNativeHls(chrome)).toBe(false);
  });
});
