import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  console.log(`[REDEEM-CODE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user?.email) {
      log("auth failed", userError?.message);
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const rawCode = typeof body?.code === "string" ? body.code : "";
    const code = rawCode.trim().toUpperCase();
    if (!code || code.length < 3 || code.length > 64) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: codeRow, error: codeErr } = await admin
      .from("redemption_codes")
      .select("id, plan, is_active, max_uses, uses_count")
      .eq("code", code)
      .maybeSingle();

    if (codeErr) {
      log("db error", codeErr.message);
      return new Response(JSON.stringify({ error: "Unable to redeem code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!codeRow || !codeRow.is_active) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (codeRow.max_uses !== null && codeRow.uses_count >= codeRow.max_uses) {
      return new Response(JSON.stringify({ error: "This code is no longer available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Grant entitlement (idempotent on user_id+plan via simple existence check).
    const { data: existing } = await admin
      .from("entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan", codeRow.plan)
      .eq("status", "active")
      .maybeSingle();

    if (!existing) {
      const { error: insertErr } = await admin.from("entitlements").insert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: `redeem_${codeRow.id}`,
        plan: codeRow.plan,
        status: "active",
      });
      if (insertErr) {
        log("entitlement insert error", insertErr.message);
        return new Response(JSON.stringify({ error: "Unable to redeem code" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    await admin
      .from("redemption_codes")
      .update({ uses_count: codeRow.uses_count + 1, updated_at: new Date().toISOString() })
      .eq("id", codeRow.id);

    log("redeemed", { userId: user.id, plan: codeRow.plan });
    return new Response(JSON.stringify({ success: true, plan: codeRow.plan }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log("unhandled error", (err as Error).message);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
