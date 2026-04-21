import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const LIFETIME_PRICE_ID = "price_1TOkeGHee1RUt7XKc9HfvKo6";
const WEEKLY_PRICE_ID = "price_1TKLJEHee1RUt7XKKBCj6dy5";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logStep("ERROR", { message: "STRIPE_WEBHOOK_SECRET not set" });
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err: any) {
    logStep("Signature verification failed", { error: err.message });
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const email = session.customer_email || session.customer_details?.email || "";
        
        // Find user by email
        const { data: userList } = await supabase.auth.admin.listUsers();
        const user = userList?.users?.find((u: any) => u.email === email);
        const userId = user?.id;

        if (!userId) {
          logStep("No matching user found", { email });
          break;
        }

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          logStep("Recording weekly subscription entitlement", { userId, subscriptionId });
          
          const { error } = await supabase.from("entitlements").upsert({
            user_id: userId,
            email,
            stripe_customer_id: customerId,
            plan: "weekly",
            stripe_subscription_id: subscriptionId,
            stripe_session_id: session.id,
            status: "active",
          }, { onConflict: "user_id,plan" });

          if (error) logStep("Upsert error (weekly)", { error: error.message });
        } else if (session.mode === "payment") {
          // Verify it's the lifetime price
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
          const isLifetime = lineItems.data.some((item: any) => item.price?.id === LIFETIME_PRICE_ID);

          if (isLifetime) {
            logStep("Recording lifetime entitlement", { userId });
            const { error } = await supabase.from("entitlements").upsert({
              user_id: userId,
              email,
              stripe_customer_id: customerId,
              plan: "lifetime",
              stripe_session_id: session.id,
              status: "active",
            }, { onConflict: "user_id,plan" });

            if (error) logStep("Upsert error (lifetime)", { error: error.message });
          }
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status === "active" ? "active" : 
                       subscription.status === "canceled" ? "canceled" : "expired";

        logStep("Updating subscription status", { customerId, status });

        // Look up entitlement by stripe_customer_id + plan
        const { error } = await supabase.from("entitlements")
          .update({ status })
          .eq("stripe_customer_id", customerId)
          .eq("plan", "weekly");

        if (error) logStep("Update error", { error: error.message });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err: any) {
    logStep("Processing error", { error: err.message });
    return new Response("Processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
