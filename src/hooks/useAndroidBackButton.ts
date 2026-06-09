import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Android hardware back button handling for Capacitor native app.
 * - On the home route ("/"), exit the app.
 * - Anywhere else, navigate to "/" (instead of exiting).
 */
export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("backButton", ({ canGoBack }) => {
          if (location.pathname === "/") {
            App.exitApp();
            return;
          }
          if (canGoBack && window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/", { replace: true });
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
  }, [navigate, location.pathname]);
}
