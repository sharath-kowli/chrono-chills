import { supabase } from "@/integrations/supabase/client";
import { allSeries, type Episode } from "@/data/episodes";
import { streamThumbnailUrl } from "@/lib/stream";

/**
 * Merges episodes published through the upload endpoint (episodes table) into the
 * in-memory series catalog before the app renders. Bundled episodes win on id clash.
 */
export async function loadPublishedEpisodes(timeoutMs = 3000) {
  try {
    const query = supabase.from("episodes" as any).select("*").order("number");
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), timeoutMs));
    const res: any = await Promise.race([query, timeout]);
    if (!res || res.error || !res.data) return;
    for (const row of res.data as any[]) {
      const s = allSeries.find((x) => x.id === row.series_id);
      if (!s || s.episodes.some((e) => e.id === row.id)) continue;
      const ep: Episode = {
        id: row.id,
        number: row.number,
        title: row.title,
        subtitle: row.subtitle ?? "",
        duration: row.duration ?? "",
        streamId: row.stream_id,
        thumbnail: row.thumbnail_url || streamThumbnailUrl(row.stream_id, "10s"),
        isNew: row.is_new,
      };
      s.episodes.push(ep);
    }
    for (const s of allSeries) s.episodes.sort((a, b) => a.number - b.number);
  } catch {
    // Never block the app on this
  }
}
