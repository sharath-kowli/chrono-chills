import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { series } from "@/data/episodes";

export default defineTool({
  name: "get_series_info",
  title: "Get series info",
  description:
    "Return metadata about the Chrono Chills horror series STILL HERE: title, tagline, total episode count, free vs premium counts, and pricing.",
  inputSchema: {} as Record<string, z.ZodTypeAny>,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const total = series.episodes.length;
    const free = series.episodes.filter((e) => !e.isLocked).length;
    const info = {
      id: series.id,
      title: series.title,
      tagline: series.tagline,
      totalEpisodes: total,
      freeEpisodes: free,
      premiumEpisodes: total - free,
      pricing: "$1.99/week for premium episodes, or redeem a legacy code.",
      homepage: "https://chronochills.com",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
