## Add Episode 39 — "Voice of the Legion"

**Stream ID:** `43724ba340810142b35b8397c853fee6`
**Title:** Voice of the Legion
**Subtitle:** Terrifying visions blur with reality.

### Steps

1. **Generate thumbnail** from the Cloudflare Stream video using their thumbnail API (matches existing pattern — 5–15s offset to avoid black frames):
   - Fetch `https://customer-j73z07fxnistfhwm.cloudflarestream.com/43724ba340810142b35b8397c853fee6/thumbnails/thumbnail.jpg?time=8s&height=1280` and save to `src/assets/episode-39.jpg`.

2. **Update `src/data/episodes.ts`:**
   - Import `episode39Thumb from '@/assets/episode-39.jpg'`.
   - Remove `isNew: true` from episode 38.
   - Append episode 39 entry (number 39, locked premium, marked `isNew: true`, duration `0:30` as placeholder consistent with recent episodes — adjust later if needed).

3. **Update `public/sitemap.xml`:** add `<url>` entry for `/watch/ep-39` (priority 0.8, monthly), and fix the unclosed final `<url>` tag if present.

### Note
Duration will default to `0:30` (matching ep-29 through ep-37 placeholders). Let me know if you have the actual runtime and I'll set it precisely.
