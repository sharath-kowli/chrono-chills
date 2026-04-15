/**
 * Centralized GTM / dataLayer helper.
 * Every push automatically attaches country_code + country_name
 * (resolved once per session via useGeoTracking).
 */

const COUNTRY_CODE_KEY = "cc_country_code";
const COUNTRY_NAME_KEY = "cc_country_name";
const GEO_FETCHED_KEY = "cc_geo_fetched";

/** Fetch + cache country data once per session. Call early (e.g. App mount). */
export async function initGeoData(): Promise<void> {
  if (sessionStorage.getItem(GEO_FETCHED_KEY)) return;

  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("ipapi failed");
    const data = await res.json();
    sessionStorage.setItem(COUNTRY_CODE_KEY, data.country_code || "unknown");
    sessionStorage.setItem(COUNTRY_NAME_KEY, data.country_name || "unknown");
  } catch {
    sessionStorage.setItem(COUNTRY_CODE_KEY, "unknown");
    sessionStorage.setItem(COUNTRY_NAME_KEY, "unknown");
  }
  sessionStorage.setItem(GEO_FETCHED_KEY, "1");
}

export function getCountryCode(): string {
  return sessionStorage.getItem(COUNTRY_CODE_KEY) || "unknown";
}

export function getCountryName(): string {
  return sessionStorage.getItem(COUNTRY_NAME_KEY) || "unknown";
}

/**
 * Push an event to the GTM dataLayer.
 * Automatically attaches country_code and country_name.
 * Respects cookie consent — skips push if user declined.
 */
export function pushEvent(
  event: string,
  data: Record<string, unknown> = {}
): void {
  const consent = localStorage.getItem("cookie-consent");
  if (consent === "declined") return;

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event,
    country_code: getCountryCode(),
    country_name: getCountryName(),
    ...data,
  });
}
