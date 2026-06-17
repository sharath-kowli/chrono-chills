// End-to-end regression tests for the redeem-code edge function.
// Verifies the original premium-unlock path still works after the
// unlock-with-credentials feature was added.
//
// Coverage (all hit the deployed function):
//   1. CORS preflight succeeds.
//   2. Missing Authorization header → 401.
//   3. Garbage Authorization token → 401.
//   4. Authenticated request with empty body → 400 ("Invalid code").
//   5. Authenticated request with a non-existent code → 400 ("Invalid code")
//      AND no entitlement is created for that user.
//
// Authenticated tests are auto-skipped (not failed) if the project requires
// email confirmation on signup — same approach as the unlock-with-credentials
// test file. The happy-path (consuming a real code) is intentionally NOT run
// here because it would mutate production-like data; the existing rows
// MERIROSVO1 / MERIROSVO2026 are checked separately via a DB read.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/redeem-code`;

assert(SUPABASE_URL, "VITE_SUPABASE_URL must be set");
assert(SUPABASE_ANON_KEY, "VITE_SUPABASE_PUBLISHABLE_KEY must be set");

async function call(opts: { token?: string; body?: unknown; method?: string }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(FN_URL, {
    method: opts.method ?? "POST",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { _raw: text }; }
  return { status: res.status, json };
}

async function createTestUser(): Promise<
  { token: string; userId: string; client: any } | null
> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `test-redeem-${crypto.randomUUID()}@example.com`;
  const password = `Test-${crypto.randomUUID()}!Aa1`;
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    console.warn(`[skip] signUp failed: ${error.message}`);
    return null;
  }
  const token = data.session?.access_token;
  const userId = data.user?.id;
  if (!token || !userId) {
    console.warn("[skip] signUp returned no session (email confirmations likely enabled). Authenticated tests will be skipped.");
    return null;
  }
  return { token, userId, client };
}

async function countLifetimeEntitlements(client: any, userId: string): Promise<number> {
  const { data, error } = await client
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("plan", "lifetime")
    .eq("status", "active");
  if (error) throw new Error(`entitlements query failed: ${error.message}`);
  return data?.length ?? 0;
}

let cachedUser: Awaited<ReturnType<typeof createTestUser>> = null;
let probed = false;
async function getOrCreateAnyUser() {
  if (!probed) {
    probed = true;
    cachedUser = await createTestUser();
  }
  return cachedUser;
}
const authedSkip = await (async () => {
  const u = await getOrCreateAnyUser();
  return !u;
})();

Deno.test("CORS preflight returns 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("rejects request with no Authorization header", async () => {
  const { status, json } = await call({ body: { code: "ANY" } });
  assertEquals(status, 401);
  assertEquals(json.error, "Authentication required");
});

Deno.test("rejects request with invalid Authorization token", async () => {
  const { status, json } = await call({
    token: "not-a-real-jwt",
    body: { code: "ANY" },
  });
  assertEquals(status, 401);
  assertEquals(json.error, "Authentication required");
});

Deno.test({
  name: "authenticated: empty body is rejected as invalid code",
  ignore: authedSkip,
  fn: async () => {
    const user = (await createTestUser())!;
    const { status, json } = await call({ token: user.token, body: {} });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid code");
  },
});

Deno.test({
  name: "authenticated: non-existent code is rejected and grants NO entitlement",
  ignore: authedSkip,
  fn: async () => {
    const user = (await createTestUser())!;
    assertEquals(await countLifetimeEntitlements(user.client, user.userId), 0);

    const bogus = `NOPE-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
    const { status, json } = await call({ token: user.token, body: { code: bogus } });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid code");

    assertEquals(
      await countLifetimeEntitlements(user.client, user.userId),
      0,
      "invalid code must NOT create an entitlement"
    );
  },
});

Deno.test({
  name: "authenticated: too-short code is rejected as invalid",
  ignore: authedSkip,
  fn: async () => {
    const user = (await createTestUser())!;
    const { status, json } = await call({ token: user.token, body: { code: "AB" } });
    assertEquals(status, 400);
    assertEquals(json.error, "Invalid code");
  },
});
