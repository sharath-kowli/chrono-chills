## Mobile app improvements

Six changes scoped to the Capacitor (Android/iOS) native app. Items 4–6 (tap-to-pause, swipe navigation, auto-advance) will also benefit the mobile web experience since they're implemented in shared React code.

---

### 1. Fix sign-in 404 on native app

**Cause:** The Capacitor app currently bundles `dist/` and runs from `capacitor://localhost` (or `http://localhost`). When Google OAuth redirects back to `window.location.origin`, that origin doesn't exist on the public web → 404 inside the in-app browser.

**Fix:** Point Capacitor at the live site so the app runs against `https://chronochills.com`. This makes `window.location.origin` resolvable and OAuth works exactly like the web build.

```ts
// capacitor.config.ts
server: {
  url: 'https://chronochills.com',
  cleartext: false,
  androidScheme: 'https',
}
```

Trade-off: the app requires network on launch (which it already does for streaming video).

---

### 2. Hardware back button → home, not exit

Install `@capacitor/app` and add a global listener: if router can go back, pop; if at `/auth` or any non-root route, navigate to `/`; only exit when already at `/`.

New file: `src/hooks/useAndroidBackButton.ts`, wired into `App.tsx`.

---

### 3. Edge-to-edge / display-cutout adaptive layout (Android)

- `android/app/src/main/res/values/styles.xml` — add:
  - `<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>`
  - translucent status bar
- Install `@capacitor/status-bar`, set overlay + transparent on app start.
- Add `viewport-fit=cover` to `index.html` meta viewport.
- Use `env(safe-area-inset-*)` in player overlays so the back arrow / episode info don't sit under the notch.

---

### 4. Tap-to-pause / tap-to-resume

Cloudflare's iframe currently captures all taps. Switch to a clean custom overlay:

- Iframe src adds `&controls=false&muted=false`.
- A full-size transparent `<button>` overlay sits above the iframe (`pointer-events-auto`); top/bottom UI overlays stay above that with their own `pointer-events-auto` regions.
- Single tap toggles `player.play()` / `player.pause()` via the Stream SDK already loaded.
- A center play-icon pulse appears briefly when paused.

---

### 5. Instagram Reels-style vertical swipe between episodes

Rework `Watch.tsx` into a vertical snap pager:

- Touch handlers (`touchstart` / `touchmove` / `touchend`) on the player container detect a vertical swipe (>60px, faster than 0.2 px/ms).
- Swipe up → next episode (paywall if locked); swipe down → previous episode.
- If already at episode 0 and user swipes down, animate a ~40px rubber-band drag with snap-back and a brief "First episode" toast/badge.
- Last episode: existing behavior unchanged (paywall or no-op).
- Transition: short `translateY` slide animation (≈250ms) before route change so it feels continuous like Reels.
- Desktop/non-touch behavior unchanged — Prev/Next buttons stay.

---

### 6. Auto-advance on episode end

The `ended` handler already navigates to the next episode. Update it to use the same slide-up transition from item 5 so it feels like a Reels scroll, instead of an abrupt route change. Existing fullscreen-exit logic preserved.

---

### Technical summary

**Files changed:**
- `capacitor.config.ts` — server.url to chronochills.com
- `android/app/src/main/res/values/styles.xml` — cutout + translucent status bar
- `index.html` — `viewport-fit=cover`
- `src/App.tsx` — mount back-button hook, init status bar
- `src/pages/Watch.tsx` — swipe pager, tap overlay, transition animation, safe-area padding
- `src/pages/Auth.tsx` — ensure back navigates to `/`
- `src/index.css` — safe-area utility, rubber-band keyframe

**New files:**
- `src/hooks/useAndroidBackButton.ts`
- `src/hooks/useSwipeNavigation.ts` (touch gesture logic, reused)

**Packages added:** `@capacitor/app`, `@capacitor/status-bar`

**After merge, you will need to run locally:**
```bash
npm install
npx cap sync android
npx cap run android   # or open in Android Studio and rebuild
```

No database, RLS, or edge-function changes.
