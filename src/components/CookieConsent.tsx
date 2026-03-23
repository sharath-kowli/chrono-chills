import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
    // Disable GTM by removing dataLayer
    window.dataLayer = [];
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border/50 bg-background/95 backdrop-blur-md p-4 sm:p-6">
      <div className="container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-4xl">
        <p className="text-xs text-muted-foreground leading-relaxed">
          We use cookies and analytics to improve your experience. By continuing, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={decline} className="text-xs">
            Decline
          </Button>
          <Button size="sm" onClick={accept} className="text-xs">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
