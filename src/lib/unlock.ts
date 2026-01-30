const UNLOCK_KEY = 'static-premium-unlocked';

export function isPremiumUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === 'true';
}

export function unlockPremium(): void {
  localStorage.setItem(UNLOCK_KEY, 'true');
}

export function lockPremium(): void {
  localStorage.removeItem(UNLOCK_KEY);
}
