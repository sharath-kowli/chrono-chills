import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Listens for the OAuth deep-link callback (chronochills://login-callback)
 * fired by the system browser after Google sign-in on native (Capacitor) builds.
 *
 * Extracts access_token/refresh_token from the URL, hands them to Supabase to
 * establish the session, then closes the in-app browser tab.
 */
export function useNativeOAuthDeepLink() {
  const navigate = useNavigate();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        const { Browser } = await import("@capacitor/browser");

        const handle = await App.addListener("appUrlOpen", async (event) => {
          try {
            const url = event.url;
            if (!url || !url.startsWith("chronochills://login-callback")) return;

            // Tokens may arrive in the hash fragment (#access_token=...) or
            // query string (?access_token=...) depending on flow.
            const afterScheme = url.split("chronochills://login-callback")[1] ?? "";
            const raw = afterScheme.replace(/^[#?]/, "");
            const params = new URLSearchParams(raw);

            const access_token = params.get("access_token");
            const refresh_token = params.get("refresh_token");
            const code = params.get("code");

            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            } else if (code) {
              // PKCE flow: exchange code for session.
              await supabase.auth.exchangeCodeForSession(code);
            }

            try {
              await Browser.close();
            } catch {
              // browser might already be dismissed
            }

            navigate("/", { replace: true });
          } catch (err) {
            console.error("OAuth deep-link handling failed", err);
          }
        });

        if (cancelled) {
          handle.remove();
          return;
        }
        cleanup = () => handle.remove();
      } catch {
        // not native / plugin unavailable
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [navigate]);
}
