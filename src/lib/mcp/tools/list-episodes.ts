import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { series } from "../../data/episodes";

export default defineTool({
  name: "list_episodes",
  title: "List episodes",
  description:
    "List every episode of the Chrono Chills series STILL HERE, including number, title, subtitle, duration, and premium-lock status.",
  inputSchema: {
    premiumOnly: z
      .boolean()
      .optional()
      .describe("If true, return only premium-locked episodes."),
    freeOnly: z
      .boolean()
      .optional()
      .describe("If true, return only free (non-locked) episodes."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ premiumOnly, freeOnly }) => {
    let episodes = series.episodes;
    if (premiumOnly) episodes = episodes.filter((e) => e.isLocked);
    if (freeOnly) episodes = episodes.filter((e) => !e.isLocked);
    const rows = episodes.map((e) => ({
      id: e.id,
      number: e.number,
      title: e.title,
      subtitle: e.subtitle,
      duration: e.duration,
      isLocked: !!e.isLocked,
      isNew: !!e.isNew,
      url: `https://chronochills.com/watch/${e.id}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { series: series.title, count: rows.length, episodes: rows },
    };
  },
});
