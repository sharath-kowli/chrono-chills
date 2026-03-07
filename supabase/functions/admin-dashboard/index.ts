import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify the requesting user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a client with the user's token to get their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to check admin status (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch watch history
    const { data: watchHistory, error: whError } = await adminClient
      .from("watch_history")
      .select("*")
      .order("updated_at", { ascending: false });

    if (whError) throw whError;

    // Fetch all user emails from auth.users
    const { data: { users: allUsers }, error: usersError } = await adminClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    const userMap: Record<string, string> = {};
    for (const u of allUsers) {
      userMap[u.id] = u.email || "unknown";
    }

    // Episode name mapping
    const episodeNames: Record<string, string> = {
      "ep-1": "Ep 1: It's in the Eyes",
      "ep-2": "Ep 2: The Hallway",
      "ep-3": "Ep 3: The Hand",
      "ep-4": "Ep 4: Behind the Door",
      "ep-5": "Ep 5: Episode 5",
      "ep-6": "Ep 6: Episode 6",
      "ep-7": "Ep 7: Episode 7",
      "ep-8": "Ep 8: Episode 8",
      "ep-9": "Ep 9: Episode 9",
      "ep-10": "Ep 10: Episode 10",
    };

    const youtubeIds: Record<string, string> = {
      "ep-1": "Hk0QL6w7WdU",
      "ep-2": "OnG0wHQ3KsM",
      "ep-3": "UEL9Y3wCH50",
      "ep-4": "rkrPt5vUSvk",
      "ep-5": "WoZyTFyUHas",
      "ep-6": "K-fELkj0EPY",
      "ep-7": "1HCv_TVLm4k",
      "ep-8": "Q3x1NUEIf-I",
      "ep-9": "svMRhBFejI8",
      "ep-10": "tfzYnnhmDoQ",
    };

    // Enrich data
    const enriched = (watchHistory || []).map((wh: any) => ({
      ...wh,
      user_email: userMap[wh.user_id] || "unknown",
      episode_name: episodeNames[wh.episode_id] || wh.episode_id,
      youtube_url: youtubeIds[wh.episode_id]
        ? `https://youtube.com/watch?v=${youtubeIds[wh.episode_id]}`
        : null,
    }));

    // Also fetch bookmarks
    const { data: bookmarks } = await adminClient
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    const enrichedBookmarks = (bookmarks || []).map((b: any) => ({
      ...b,
      user_email: userMap[b.user_id] || "unknown",
      episode_name: episodeNames[b.episode_id] || b.episode_id,
    }));

    return new Response(
      JSON.stringify({ watchHistory: enriched, bookmarks: enrichedBookmarks }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
