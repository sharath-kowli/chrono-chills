import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { pushEvent } from "@/lib/gtm";

/**
 * Fires a `page_view` dataLayer event on every route change.
 * Must be rendered inside <BrowserRouter>.
 */
export function usePageView() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate fire on same path
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    pushEvent("page_view", {
      page_path: location.pathname,
      page_url: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}
