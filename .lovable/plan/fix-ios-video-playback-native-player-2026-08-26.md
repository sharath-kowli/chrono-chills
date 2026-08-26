# Fix iOS video playback — replace the Cloudflare iframe with a native player

The 2026-08-22 attempt (poster + `autoplay=false` + `play()` as the first statement in
the tap handler) was correct about *when* to call `play()` and still failed on iOS,
because the problem is *where* the tap lands.

## Root cause

The `<video>` element lived inside `iframe.videodelivery.net` — a cross-origin child
frame. HTML's activation-notification algorithm propagates user activation to a
document's **ancestor** frames and to **same-origin descendants** only. A cross-origin
child frame is deliberately excluded, and WebKit enforces it.

So a tap on chronochills.com never grants user activation to the Cloudflare frame. The
Stream SDK's `player.play()` is a `postMessage` into that frame; it arrives in a message
handler with no activation, and iOS rejects the underlying `video.play()` with
`NotAllowedError`. No amount of poster/gesture restructuring on our side could fix it,
because our side was never the side that needed the gesture. `controls=false` plus
`pointer-events: none` on the iframe removed the one thing that would have worked —
tapping Cloudflare's own play button, inside the frame.

Chrome and Android are laxer about autoplay, which is why only iOS was black.

## Changes

1. **`src/lib/stream.ts`** (new) — Cloudflare Stream URL helpers. Delivery origin is
   overridable via `VITE_CLOUDFLARE_STREAM_BASE` for a `customer-<code>` subdomain.

2. **`src/hooks/useHlsSource.ts`** (new) — points a `<video>` at the HLS manifest.
   Safari/iOS decodes HLS natively and never downloads hls.js; everything else lazy-loads
   hls.js (its own ~186 KB gzip chunk) and feeds the element through MSE. Fatal
   network/media errors self-recover; anything else surfaces as `status: "error"`.
   Returns `attachedStreamId` so an episode swap is distinguishable from the previous
   `"ready"`.

3. **`src/pages/Watch.tsx`** — the iframe, the Stream SDK `<script>`, and the two hidden
   prefetch iframes are gone. In their place a single `<video playsInline>` in our own
   document, so the poster tap and `video.play()` share a document and iOS allows it.

## Why the element is reused rather than keyed per episode

WebKit records "the user started this one" per media element. Mounting a fresh `<video>`
per episode would demand a new tap every time; swapping the source on one long-lived
element keeps it unlocked, so swiping to the next episode now autoplays on iOS — which
the iframe could never do. `hasUserStartedPlayback` (module scope, survives navigation)
gates that so a cold load still shows the poster.

## Secondary fixes this enables

- `currentTime` is synchronous now, so `±10s` double-tap skip and the 10s progress save
  read the real position instead of the SDK's cached value.
- `video.paused` is the source of truth for play/pause, replacing the optimistic local
  state that raced with the SDK's async getter.
- Resume-from-progress runs on both `loadedmetadata` and the progress query resolving,
  whichever is later, so it no longer depends on winning a race.
- Playback events are JSX props, so the listener set no longer tears down and re-attaches
  whenever `session` / `goToNextEpisode` change identity.
- Adjacent-episode prefetch is a manifest `fetch()` instead of two hidden iframes.
- Added a buffering spinner; the poster shows a spinner until the source is attached.

## Notes

- Videos are public Stream UIDs, no signed tokens, so the manifest needs no auth.
- `playsInline` keeps playback in the page instead of iOS's fullscreen takeover.
- Untouched: routing, paywall, auth gating, bookmarks, GTM events, SEO/JSON-LD.
