import { defineMcp } from "@lovable.dev/mcp-js";
import listEpisodesTool from "./tools/list-episodes";
import getEpisodeTool from "./tools/get-episode";
import getSeriesInfoTool from "./tools/get-series-info";

export default defineMcp({
  name: "chrono-chills-mcp",
  title: "Chrono Chills MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Chrono Chills horror short-form streaming app. Use `get_series_info` for series-level metadata, `list_episodes` to browse the STILL HERE episode catalog (with optional free/premium filters), and `get_episode` to look up a single episode by id or number. All data is public — no authentication required.",
  tools: [listEpisodesTool, getEpisodeTool, getSeriesInfoTool],
});
