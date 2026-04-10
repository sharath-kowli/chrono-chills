import { Header } from "@/components/Header";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isPremiumUnlocked } from "@/lib/unlock";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect } from "react";

const PaymentSuccess = () => {
  const { subscribed, checkSubscription, loading } = useSubscription();

  // Re-check subscription on mount (user just came back from Stripe)
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Fire payment_success event for GTM
  useEffect(() => {
    if (!loading && hasAccess) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "payment_success",
        payment_method: isPremiumUnlocked() ? "redeem_code" : "stripe",
      });
    }
  }, [loading, hasAccess]);

  // Allow access if either localStorage unlock (redeem code) or Stripe subscription
  const hasAccess = isPremiumUnlocked() || subscribed;

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
        <p className="text-muted-foreground max-w-md mb-8">
          Premium content is now unlocked. Enjoy all episodes of STILL HERE.
        </p>
        <Button asChild size="lg">
          <Link to="/">Start Watching</Link>
        </Button>
      </main>
    </div>
  );
};

export default PaymentSuccess;
