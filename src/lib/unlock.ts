// Premium access is determined server-side via the `entitlements` table and
// Stripe subscription state (see `useSubscription`). The previous
// localStorage flag was removed because it could be set by any user from
// browser DevTools, bypassing the paywall.
//
// These no-op helpers are kept only to avoid breaking any stray imports.
// Do NOT use them as an access-control signal.

export function isPremiumUnlocked(): boolean {
  return false;
}

export function unlockPremium(): void {
  // no-op: client cannot grant itself premium access.
}

export function lockPremium(): void {
  // no-op
}
