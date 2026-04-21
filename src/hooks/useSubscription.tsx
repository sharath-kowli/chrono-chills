import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Error checking subscription:", error);
        setLoading(false);
        return;
      }

      setSubscribed(data.subscribed ?? false);
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.error("Subscription check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check on mount and auth changes
  useEffect(() => {
    checkSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  // Periodic refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{ subscribed, subscriptionEnd, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
