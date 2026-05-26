import { Header } from "@/components/Header";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect } from "react";
import { pushEvent } from "@/lib/gtm";

const PaymentSuccess = () => {
  const { subscribed, lifetime, checkSubscription, loading } = useSubscription();
  const [searchParams] = useSearchParams();

  // Detect plan from URL param (set by create-checkout success_url)
  const planParam = searchParams.get("plan") as "weekly" | "lifetime" | null;
  const isLifetime = lifetime || planParam === "lifetime";

  // Access is granted only by server-verified entitlement / subscription.
  const hasAccess = subscribed;

  // Re-check subscription on mount (user just came back from Stripe or redeem)
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Fire payment_success event for GTM
  useEffect(() => {
    if (!loading && hasAccess) {
      pushEvent("checkout_completed", {
        payment_method: planParam ? "stripe" : "redeem_code",
        plan: isLifetime ? "lifetime" : "weekly",
      });
    }
  }, [loading, hasAccess, isLifetime, planParam]);

  if (!loading && !hasAccess) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="animate-pulse text-primary">Verifying payment...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <CheckCircle className="h-16 w-16 text-primary mb-6" />
        <h1 className="font-display text-4xl tracking-wide text-foreground mb-3">You're In</h1>

        {/* Plan badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          {isLifetime ? (
            <>
              <Crown className="h-4 w-4" />
              Lifetime Access
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Weekly Premium
            </>
          )}
        </div>

        <p className="text-muted-foreground max-w-md mb-8">
          {isLifetime
            ? "You now have lifetime access to all STILL HERE episodes. Enjoy!"
            : "Premium content is now unlocked. Your subscription renews weekly — cancel anytime."}
        </p>
        <Button asChild size="lg">
          <Link to="/">Start Watching</Link>
        </Button>
      </main>
    </div>
  );
};

export default PaymentSuccess;
