import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seriesMeta } from "../episodes-data";

export default defineTool({
  name: "get_episode",
  title: "Get episode details",
  description:
    "Get full details for a single Chrono Chills episode by episode id (e.g. 'ep-12') or by episode number.",
  inputSchema: {
    id: z.string().optional().describe("Episode id such as 'ep-0' or 'ep-42'."),
    number: z.number().int().optional().describe("Episode number, e.g. 12."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id, number }) => {
    if (!id && number === undefined) {
      return {
        content: [{ type: "text", text: "Provide either an episode id or a number." }],
        isError: true,
      };
    }
    const ep = seriesMeta.episodes.find(
      (e) => (id ? e.id === id : true) && (number !== undefined ? e.number === number : true),
    );
    if (!ep) {
      return {
        content: [{ type: "text", text: "Episode not found." }],
        isError: true,
      };
    }
    const row = {
      id: ep.id,
      number: ep.number,
      title: ep.title,
      subtitle: ep.subtitle,
      duration: ep.duration,
      isLocked: !!ep.isLocked,
      isNew: !!ep.isNew,
      url: `https://chronochills.com/watch/${ep.id}`,
      series: seriesMeta.title,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(row, null, 2) }],
      structuredContent: row,
    };
  },
});
