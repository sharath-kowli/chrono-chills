import { useEffect } from "react";

/**
 * Configures the native status bar to overlay the webview (edge-to-edge / cutout).
 * No-op on web.
 */
export function useNativeStatusBar() {
  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // plugin not installed on this platform
      }
    })();
  }, []);
}
