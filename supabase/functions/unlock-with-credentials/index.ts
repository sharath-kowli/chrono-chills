import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  console.log(`[UNLOCK-CREDENTIALS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

// Constant-time string compare
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const expectedUser = Deno.env.get("PREMIUM_UNLOCK_USERNAME");
    const expectedPass = Deno.env.get("PREMIUM_UNLOCK_PASSWORD");

    if (!expectedUser || !expectedPass) {
      log("missing server config");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Auth is OPTIONAL for this endpoint. If the caller is signed in we will
    // additionally grant them a lifetime entitlement (so the unlock survives
    // device changes). If not, validating the shared credentials alone is
    // enough — the client stores a local unlock flag.
    let user: { id: string; email: string | null } | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await admin.auth.getUser(token);
      if (userData.user?.id) {
        user = { id: userData.user.id, email: userData.user.email ?? null };
      }
    }

    const body = await req.json().catch(() => ({}));
    const rawUser = typeof body?.username === "string" ? body.username : "";
    const rawPass = typeof body?.password === "string" ? body.password : "";
    const username = rawUser.trim();
    const password = rawPass;

    if (!username || !password || username.length > 128 || password.length > 256) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMatch = safeEqual(username, expectedUser);
    const passMatch = safeEqual(password, expectedPass);
    if (!userMatch || !passMatch) {
      log("invalid credentials", { userId: user?.id ?? "anon" });
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If signed in, also grant lifetime entitlement (idempotent).
    if (user) {
      const { data: existing } = await admin
        .from("entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("plan", "lifetime")
        .eq("status", "active")
        .maybeSingle();

      if (!existing) {
        const { error: insertErr } = await admin.from("entitlements").insert({
          user_id: user.id,
          email: user.email,
          stripe_customer_id: "unlock_credentials",
          plan: "lifetime",
          status: "active",
        });
        if (insertErr) {
          log("entitlement insert error", insertErr.message);
          return new Response(JSON.stringify({ error: "Unable to unlock access" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    log("unlocked", { userId: user?.id ?? "anon" });
    return new Response(JSON.stringify({ success: true, plan: "lifetime" }), {
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
