import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "cc_session_id";
const COUNTRY_KEY = "cc_country";
const TRACKED_KEY = "cc_geo_tracked";

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function fetchCountry(): Promise<string> {
  const cached = localStorage.getItem(COUNTRY_KEY);
  if (cached) return cached;

  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("ipapi failed");
    const data = await res.json();
    const country = data.country_code || "unknown";
    localStorage.setItem(COUNTRY_KEY, country);
    return country;
  } catch {
    localStorage.setItem(COUNTRY_KEY, "unknown");
    return "unknown";
  }
}

export function getSessionCountry(): string {
  return localStorage.getItem(COUNTRY_KEY) || "unknown";
}

export function getSessionId(): string {
  return getOrCreateSessionId();
}

/**
 * Tracks a page_view event once per session with geo data.
 * Call this on the main layout/page component.
 */
export function useGeoTracking(page: string) {
  useEffect(() => {
    const trackingKey = `${TRACKED_KEY}_${page}`;
    if (sessionStorage.getItem(trackingKey)) return;

    const sessionId = getOrCreateSessionId();

    (async () => {
      const country = await fetchCountry();
      await supabase.from("events").insert({
        session_id: sessionId,
        country,
        page,
        event_type: "page_view",
      });
      sessionStorage.setItem(trackingKey, "1");
    })();
  }, [page]);
}
