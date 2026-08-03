import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { pushEvent } from "@/lib/gtm";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

// Public web URL used by the native app to perform OAuth via the managed broker.
const WEB_AUTH_URL = "https://chrono-chills.lovable.app/auth?native=1";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [nativeHandoff, setNativeHandoff] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNativeHandoffFlow = searchParams.get("native") === "1";
  // Where to send the user after sign-in (e.g. back to an OAuth consent URL).
  const rawNext = searchParams.get("next");
  const nextPath =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
  // `handoff=1` is appended to the redirect_uri so we know the user has
  // just completed a fresh Google sign-in (vs. landing on the page with a
  // pre-existing/stale browser session).
  const isPostOAuthReturn = searchParams.get("handoff") === "1";

  useEffect(() => {
    let cancelled = false;

    const handleSession = (session: any) => {
      if (!session) return;
      if (isNativeHandoffFlow) {
        // Only treat this as a successful native handoff if the user just
        // completed OAuth (handoff=1). Otherwise the session is stale from a
        // previous browser visit and we must force a fresh sign-in.
        if (isPostOAuthReturn) {
          setNativeHandoff({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        }
      } else if (nextPath) {
        // Return the user to where they came from (e.g. an OAuth consent URL).
        window.location.replace(nextPath);
      } else {
        navigate("/");
      }
    };

    (async () => {
      if (isNativeHandoffFlow && !isPostOAuthReturn) {
        // Native flow entry point: always start clean so the user can
        // re-authenticate (e.g. after signing out in the app). Clear any
        // lingering browser session, then immediately launch Google OAuth.
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
        if (cancelled) return;
        try {
          await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin + "/auth?native=1&handoff=1",
            extraParams: { prompt: "select_account" },
          });
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: err?.message || "Could not start Google sign-in.",
          });
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) handleSession(session);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        pushEvent("sign_in", { method: "google", user_id: session.user.id });
      }
      handleSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate, isNativeHandoffFlow, isPostOAuthReturn, nextPath, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Detect Capacitor native runtime (iOS / Android wrapper).
      let isNative = false;
      try {
        const { Capacitor } = await import("@capacitor/core");
        isNative = Capacitor.isNativePlatform();
      } catch {
        isNative = false;
      }

      if (isNative) {
        // Native: open the published web auth page (?native=1) inside the
        // system browser. That page will clear any stale session and force a
        // fresh Google sign-in, then show a "Return to app" button that fires
        // the chronochills:// deep link with the session tokens.
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: WEB_AUTH_URL, windowName: "_self" });
        return;
      }

      // Web: use the Lovable Cloud managed OAuth broker.
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during sign in.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToApp = () => {
    if (!nativeHandoff) return;
    const { access_token, refresh_token } = nativeHandoff;
    const deepLink = `chronochills://login-callback#access_token=${encodeURIComponent(
      access_token,
    )}&refresh_token=${encodeURIComponent(refresh_token)}`;
    window.location.href = deepLink;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO
        title="Sign In to Chrono Chills"
        description="Sign in to Chrono Chills to track your progress, bookmark episodes, and unlock premium chapters of STILL HERE."
        path="/auth"
      />
      <div className="w-full max-w-md space-y-8">
        {isNativeHandoffFlow && !nativeHandoff ? (
          <>
            <div className="text-center">
              <h1
                className="glitch font-display text-4xl tracking-widest text-foreground mb-2"
                data-text="SIGNING IN"
              >
                SIGNING IN
              </h1>
              <p className="text-muted-foreground">
                Redirecting you to Google to sign in…
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
              <span className="animate-pulse text-primary">Please wait…</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1
                className="glitch font-display text-4xl tracking-widest text-foreground mb-2"
                data-text={nativeHandoff ? "SUCCESS" : "WELCOME"}
              >
                {nativeHandoff ? "SUCCESS" : "WELCOME"}
              </h1>
              <p className="text-muted-foreground">
                {nativeHandoff
                  ? "You're signed in. Tap below to return to the app."
                  : "Sign in or create an account to continue"}
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm border p-8 rounded-xl shadow-lg flex flex-col gap-4">
              {nativeHandoff ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleReturnToApp}
                >
                  Sign-in successful — Return to app
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 border-primary/20 hover:border-primary/50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Connecting...</span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true" focusable="false">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
              )}

              {!nativeHandoff && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                  If you don't have an account, one will be created automatically.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
