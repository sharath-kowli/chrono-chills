// Cloudflare Stream URL helpers.
//
// The watch page plays the HLS manifest in a real <video> element rather than the
// Cloudflare iframe embed. iOS only grants playback permission to a gesture that
// happened in the *same document* as the media element, and user activation is not
// propagated into cross-origin child frames — so a tap on our page can never start
// playback inside iframe.videodelivery.net, no matter how the call is made.
const DEFAULT_BASE = "https://videodelivery.net";

const base = (import.meta.env.VITE_CLOUDFLARE_STREAM_BASE || DEFAULT_BASE).replace(/\/+$/, "");

/** HLS manifest for a Stream video — native on Safari/iOS, via hls.js elsewhere. */
export const hlsUrl = (streamId: string) => `${base}/${streamId}/manifest/video.m3u8`;

/** Cloudflare-generated still, used as a fallback when an episode has no bundled thumbnail. */
export const streamThumbnailUrl = (streamId: string, time = "0s") =>
  `${base}/${streamId}/thumbnails/thumbnail.jpg?time=${time}`;

/** Safari — and therefore every browser on iOS — decodes HLS without a JS library. */
export const supportsNativeHls = (video: HTMLVideoElement) =>
  video.canPlayType("application/vnd.apple.mpegurl") !== "";
