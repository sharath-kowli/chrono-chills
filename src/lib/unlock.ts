// Premium access is normally determined server-side via the `entitlements`
// table (Stripe + redeem-code paths). The username/password unlock path is
// an additional, intentional bypass that does NOT require a Supabase auth
// session — credentials are validated by the `unlock-with-credentials` edge
// function before this flag is ever set.

const KEY = "cc_credentials_unlock";

export function isCredentialsUnlocked(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setCredentialsUnlocked(): void {
  try {
    localStorage.setItem(KEY, "1");
    // Notify same-tab listeners (storage event only fires cross-tab).
    window.dispatchEvent(new Event("cc-credentials-unlock"));
  } catch {
    /* ignore */
  }
}

export function clearCredentialsUnlocked(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("cc-credentials-unlock"));
  } catch {
    /* ignore */
  }
}

// Legacy no-op exports kept for compatibility.
export function isPremiumUnlocked(): boolean {
  return isCredentialsUnlocked();
}
export function unlockPremium(): void {}
export function lockPremium(): void {}
