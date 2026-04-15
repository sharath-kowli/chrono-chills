import { usePageView } from "@/hooks/usePageView";

/** Renders nothing — just fires page_view on route changes. */
export function PageViewTracker() {
  usePageView();
  return null;
}
