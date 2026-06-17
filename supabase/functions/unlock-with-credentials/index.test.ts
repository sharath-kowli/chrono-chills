// Integration tests for the unlock-with-credentials edge function.
// Runs against the deployed function using anonymous auth + a throwaway test user.
//
// What is verified:
//   1. CORS preflight succeeds.
//   2. Missing Authorization header is rejected (401).
//   3. Garbage Authorization token is rejected (401).
//   4. Authenticated request with empty body is rejected (400).
//   5. Authenticated request with WRONG credentials is rejected (400)
//      AND no lifetime entitlement is created for that user.
//   6. (Happy path, skipped unless PREMIUM_UNLOCK_USERNAME / _PASSWORD
//      are exposed to the test runner) authenticated request with CORRECT
//      credentials returns success and a second call is idempotent.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/unlock-with-credentials`;

assert(SUPABASE_URL, "VITE_SUPABASE_URL must be set");
assert(SUPABASE_ANON_KEY, "VITE_SUPABASE_PUBLISHABLE_KEY must be set");

async function call(opts: {
  token?: string;
  body?: unknown;
  method?: string;
}): Promise<{ status: number; json: any }> {
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

// Create a throwaway authenticated user and return its access token + uid.
async function createTestUser(): Promise<{ token: string; userId: string; email: string; client: any }> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `test-unlock-${crypto.randomUUID()}@example.com`;
  const password = `Test-${crypto.randomUUID()}!Aa1`;
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw new Error(`signUp failed: ${error.message}`);
  const token = data.session?.access_token;
  const userId = data.user?.id;
  if (!token || !userId) {
    throw new Error("signUp did not return a session (email confirmations may be on). Cannot run authenticated tests.");
  }
  return { token, userId, email, client };
}

// Count active lifetime entitlements visible to this user (RLS scopes to own rows).
async function countLifetimeEntitlements(client: any, userId: string): Promise<number> {
  const { data, error } = await client
    .from("entitlements")
    .select("id, plan, status, stripe_customer_id")
    .eq("user_id", userId)
    .eq("plan", "lifetime")
    .eq("status", "active");
  if (error) throw new Error(`entitlements query failed: ${error.message}`);
  return data?.length ?? 0;
}

Deno.test("CORS preflight returns 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});

Deno.test("rejects request with no Authorization header", async () => {
  const { status, json } = await call({ body: { username: "x", password: "y" } });
  assertEquals(status, 401);
  assertEquals(json.error, "Authentication required");
});

Deno.test("rejects request with invalid Authorization token", async () => {
  const { status, json } = await call({
    token: "not-a-real-jwt",
    body: { username: "x", password: "y" },
  });
  assertEquals(status, 401);
  assertEquals(json.error, "Authentication required");
});

Deno.test("authenticated: empty body is rejected as invalid credentials", async () => {
  const { token } = await createTestUser();
  const { status, json } = await call({ token, body: {} });
  assertEquals(status, 400);
  assertEquals(json.error, "Invalid credentials");
});

Deno.test("authenticated: WRONG credentials are rejected and grant NO entitlement", async () => {
  const { token, userId, client } = await createTestUser();

  const before = await countLifetimeEntitlements(client, userId);
  assertEquals(before, 0, "new user should have 0 lifetime entitlements");

  const { status, json } = await call({
    token,
    body: { username: "wrong-user", password: "wrong-password!" },
  });
  assertEquals(status, 400);
  assertEquals(json.error, "Invalid credentials");

  const after = await countLifetimeEntitlements(client, userId);
  assertEquals(after, 0, "wrong credentials must NOT create an entitlement");
});

Deno.test("authenticated: username right but password wrong is rejected", async () => {
  const { token, userId, client } = await createTestUser();
  const { status, json } = await call({
    token,
    body: { username: "GooglePlayAdmin", password: "definitely-wrong" },
  });
  assertEquals(status, 400);
  assertEquals(json.error, "Invalid credentials");
  assertEquals(await countLifetimeEntitlements(client, userId), 0);
});

// Happy-path test. Requires the test runner to expose the same credentials
// the edge function uses. We never hardcode them.
const happyUser = Deno.env.get("PREMIUM_UNLOCK_USERNAME");
const happyPass = Deno.env.get("PREMIUM_UNLOCK_PASSWORD");

Deno.test({
  name: "authenticated: CORRECT credentials grant a lifetime entitlement (idempotent)",
  ignore: !happyUser || !happyPass,
  fn: async () => {
    const { token, userId, client } = await createTestUser();
    assertEquals(await countLifetimeEntitlements(client, userId), 0);

    const first = await call({ token, body: { username: happyUser, password: happyPass } });
    assertEquals(first.status, 200, `first call body: ${JSON.stringify(first.json)}`);
    assertEquals(first.json.success, true);
    assertEquals(first.json.plan, "lifetime");

    const afterFirst = await countLifetimeEntitlements(client, userId);
    assertEquals(afterFirst, 1, "first successful unlock should create exactly 1 lifetime entitlement");

    // Second call must be idempotent: still success, still only one row.
    const second = await call({ token, body: { username: happyUser, password: happyPass } });
    assertEquals(second.status, 200);
    assertEquals(second.json.success, true);

    const afterSecond = await countLifetimeEntitlements(client, userId);
    assertEquals(afterSecond, 1, "second unlock must not create a duplicate entitlement");
  },
});
