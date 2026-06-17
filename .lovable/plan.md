## Add Username + Password Premium Unlock

A new way to unlock premium, sitting next to the existing "Redeem code" link in the Paywall modal. Existing redemption code flow is left fully intact.

### Credentials
- Username: `GooglePlayAdmin`
- Password: `2026Merirosvo1108$`

Both stored as **backend secrets** (`PREMIUM_UNLOCK_USERNAME`, `PREMIUM_UNLOCK_PASSWORD`), never shipped to the client. Comparison happens inside a new edge function.

### What changes

**1. New secrets (2)**
- `PREMIUM_UNLOCK_USERNAME` = `GooglePlayAdmin`
- `PREMIUM_UNLOCK_PASSWORD` = `2026Merirosvo1108$`

**2. New edge function: `unlock-with-credentials`**
- Requires the user to be signed in (same as redeem-code).
- Reads `{ username, password }` from request body, trims, validates length.
- Compares against the two secrets using constant-time-style equality.
- On match: inserts a lifetime entitlement for `auth.uid()` into the existing `entitlements` table (idempotent — skips if an active lifetime entitlement already exists), using `stripe_customer_id = "unlock_credentials"` as the marker.
- Returns `{ success: true, plan: "lifetime" }` or `{ error: "Invalid credentials" }` (400).
- Mirrors `redeem-code`'s CORS, auth, and error patterns. Does **not** touch the `redemption_codes` table.

**3. PaywallModal UI (`src/components/PaywallModal.tsx`)**
Below the existing "Have a code? Redeem here" button, add a second collapsible link: **"Have login credentials? Sign in here"**.
- When clicked, reveals two inputs (Username, Password) and an "Unlock" button.
- Submitting calls `supabase.functions.invoke('unlock-with-credentials', { body: { username, password } })`.
- On success: calls `checkSubscription()`, closes modal, navigates to `/payment-success` (same as redeem flow).
- On failure: shows inline error "Invalid credentials".
- If user not signed in: redirects to `/auth` (same pattern as redeem).
- Independent state (`showCredentialsInput`, `credUsername`, `credPassword`, `credError`, `credLoading`) — does not touch redeem-code state.

**4. No database schema change.** Reuses existing `entitlements` table and existing `useSubscription` hook, so premium unlock takes effect immediately across the app (Episodes 13–25, etc.) exactly like Stripe and redemption codes do today.

### Out of scope (unchanged)
- `redemption_codes` table, `redeem-code` edge function, MERIROSVO codes — completely untouched.
- Stripe checkout, Google sign-in, episode lock threshold (≥13).
- No new admin UI; credentials are managed via secrets only.

### Files touched
- New: `supabase/functions/unlock-with-credentials/index.ts`
- Edited: `src/components/PaywallModal.tsx` (add second collapsible section + handler)
- Secrets added (via secret prompt): `PREMIUM_UNLOCK_USERNAME`, `PREMIUM_UNLOCK_PASSWORD`
