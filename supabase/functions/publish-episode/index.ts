// Publishes (creates or updates) an episode so it appears in the app immediately.
// Auth: header `x-api-key` must equal the EPISODE_UPLOAD_KEY secret.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const SERIES = {
  "sergeant-napalm-season-1": "sn-ep-",
  "still-here-season-1": "ep-",
} as const;

const Body = z.object({
  series_id: z.enum(["sergeant-napalm-season-1", "still-here-season-1"]).default("sergeant-napalm-season-1"),
  number: z.number().int().min(0).max(9999),
  // Accept a bare 32-char ID or any Cloudflare Stream URL containing it
  stream: z.string().min(32).max(500),
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).optional(),
  duration: z.string().max(10).optional(),
  thumbnail_url: z.string().url().max(1000).optional(),
  is_new: z.boolean().optional(),
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const expected = Deno.env.get("EPISODE_UPLOAD_KEY");
  const given = req.headers.get("x-api-key") ?? "";
  if (!expected || !safeEqual(given, expected)) return json({ error: "Unauthorized" }, 401);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ error: "Body must be JSON" }, 400); }
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const b = parsed.data;

  const match = b.stream.match(/[a-f0-9]{32}/i);
  if (!match) return json({ error: { stream: ["No 32-character Cloudflare video ID found"] } }, 400);
  const streamId = match[0].toLowerCase();

  const id = `${SERIES[b.series_id]}${b.number}`;
  const row = {
    id,
    series_id: b.series_id,
    number: b.number,
    title: b.title ?? `Episode ${b.number}`,
    subtitle: b.subtitle ?? "",
    duration: b.duration ?? "",
    stream_id: streamId,
    thumbnail_url: b.thumbnail_url ?? `https://videodelivery.net/${streamId}/thumbnails/thumbnail.jpg?time=10s&height=1280`,
    is_new: b.is_new ?? true,
  };

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.from("episodes").upsert(row, { onConflict: "id" }).select().single();
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, episode: data, url: `https://chronochills.com/watch/${id}` });
});
