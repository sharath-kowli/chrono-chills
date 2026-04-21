import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-6 py-12">
      <button
        onClick={() => navigate(-1)}
        className="self-start mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="max-w-md w-full space-y-8 text-center">
        <img src="/pwa-192.png" alt="Chrono Chills" className="w-20 h-20 mx-auto rounded-2xl" />
        <h1 className="text-2xl font-bold">Install Chrono Chills</h1>
        <p className="text-muted-foreground">
          Get the full-screen experience. Add Chrono Chills to your home screen for instant access.
        </p>

        {isInstalled ? (
          <div className="bg-accent/20 border border-accent rounded-xl p-6 space-y-2">
            <p className="text-lg font-semibold text-accent">✓ Already Installed</p>
            <p className="text-sm text-muted-foreground">
              Open Chrono Chills from your home screen for the best experience.
            </p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2">
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : isIOS ? (
          <div className="bg-muted/50 rounded-xl p-6 space-y-6 text-left">
            <p className="text-sm font-medium text-center text-foreground">
              To install on iPhone / iPad:
            </p>
            <div className="space-y-4">
              <Step number={1} icon={<Share className="w-5 h-5" />}>
                Tap the <strong>Share</strong> button in Safari's toolbar
              </Step>
              <Step number={2} icon={<Plus className="w-5 h-5" />}>
                Scroll down and tap <strong>Add to Home Screen</strong>
              </Step>
              <Step number={3} icon={<Download className="w-5 h-5" />}>
                Tap <strong>Add</strong> in the top-right corner
              </Step>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-6 space-y-6 text-left">
            <p className="text-sm font-medium text-center text-foreground">
              To install on Android:
            </p>
            <div className="space-y-4">
              <Step number={1} icon={<MoreVertical className="w-5 h-5" />}>
                Tap the <strong>⋮ menu</strong> in your browser
              </Step>
              <Step number={2} icon={<Download className="w-5 h-5" />}>
                Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>
              </Step>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="flex items-start gap-2 pt-1 text-sm text-muted-foreground">
        <span className="flex-shrink-0 mt-0.5">{icon}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}