# Fix iOS video playback on the watch page

On iPhone/iPad the player is a black rectangle: the Cloudflare iframe requests autoplay with audio (which iOS blocks) while `controls=false` hides Cloudflare's own play button, so there is nothing to tap. Fix is a poster + play button that starts playback from a real user gesture — same code path on every platform, no muted autoplay, no UA sniffing.

## Changes (all in `src/pages/Watch.tsx`)

1. **Iframe params** — `autoplay=true&preload=auto&controls=false` becomes `autoplay=false&preload=auto&controls=false`. Prefetch iframes for the adjacent episodes stay untouched.

2. **Poster overlay** — a new overlay above the video, below the header/info overlays, visible until playback actually starts. It shows the same imported episode thumbnail already used by the episode carousel (`episode.thumbnail`) as a full-bleed cover image with the existing dark gradient scrim, plus a centered circular play button matching the current paused-indicator styling (`bg-background/60 backdrop-blur-sm`, `Play` icon from lucide).

3. **Gesture-safe start** — in the button's `onClick`, `playerRef.current.play()` is the very first statement. No awaits, no state updates, no analytics before it. The existing `episode_started` / milestone tracking stays where it is (in effects) and any additional tracking runs after the `play()` call, fire-and-forget.

4. **Rejection handling** — `.catch()` on `play()` keeps the poster visible and swaps the caption to "Tap to play" so the user never sees a silent black screen.

5. **Hide on `play` event** — the overlay is dismissed by the player's existing `play` listener (`handlePlay`), not by the click, so it only disappears once video is genuinely running. It re-arms when the episode changes.

## Technical notes

- New state `showPoster` (default `true`), reset in the existing episode-change effect; `handlePlay` sets it `false`, and a `playBlocked` flag drives the "Tap to play" caption.
- The poster sits above the iframe but the existing tap/swipe overlay stays below it in z-order while the poster is visible, so the first tap always goes to the real play button.
- Because autoplay is off everywhere, Android/desktop now also start with the poster tap — intentional, per the single-code-path requirement.
- Untouched: homepage hero iframe (already `muted=true`), episode list/carousel, routing, and all layout outside the player area.
