import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isCredentialsUnlocked } from "@/lib/unlock";

interface SubscriptionState {
  subscribed: boolean;
  lifetime: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState>({
  subscribed: false,
  lifetime: false,
  subscriptionEnd: null,
  loading: true,
  checkSubscription: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  const [lifetime, setLifetime] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      // Credentials-based unlock bypasses Supabase auth entirely.
      if (isCredentialsUnlocked()) {
        setSubscribed(true);
        setLifetime(true);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setLifetime(false);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Edge function failed, falling back to entitlements table:", error);
        // Fallback: query entitlements directly so paying users aren't locked out
        const { data: entitlements } = await supabase
          .from("entitlements")
          .select("plan, status")
          .eq("user_id", session.user.id)
          .eq("status", "active");

        if (entitlements && entitlements.length > 0) {
          const hasLifetime = entitlements.some(e => e.plan === "lifetime");
          const hasWeekly = entitlements.some(e => e.plan === "weekly");
          setSubscribed(hasLifetime || hasWeekly);
          setLifetime(hasLifetime);
          setSubscriptionEnd(null);
        }
        setLoading(false);
        return;
      }

      setSubscribed(data.subscribed ?? false);
      setLifetime(data.lifetime ?? false);
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.error("Subscription check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check on mount, auth changes, and credentials-unlock events
  useEffect(() => {
    checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    const onUnlock = () => checkSubscription();
    window.addEventListener("cc-credentials-unlock", onUnlock);
    window.addEventListener("storage", onUnlock);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cc-credentials-unlock", onUnlock);
      window.removeEventListener("storage", onUnlock);
    };
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{ subscribed, lifetime, subscriptionEnd, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
