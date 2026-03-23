import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
    // Disable GTM by clearing dataLayer
    (window as any).dataLayer = [];
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60] rounded-lg border border-border/50 bg-background/95 backdrop-blur-md p-4 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      <button
        onClick={decline}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <p className="text-xs text-muted-foreground leading-relaxed pr-4 mb-3">
        We use cookies and analytics to improve your experience. See our{" "}
        <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={decline} className="text-xs h-7 flex-1">
          Decline
        </Button>
        <Button size="sm" onClick={accept} className="text-xs h-7 flex-1">
          Accept
        </Button>
      </div>
    </div>
  );
}
