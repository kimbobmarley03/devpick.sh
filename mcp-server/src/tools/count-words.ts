import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "count_words",
    "Count words, characters, lines, sentences, and paragraphs in text",
    {
      text: z.string().describe("Text to analyze"),
    },
    async ({ text }) => {
      const characters = text.length;
      const characters_no_spaces = text.replace(/\s/g, "").length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split(/\r?\n/).length;
      const lines_non_empty = text.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
      const sentences = text.trim()
        ? (text.match(/[^.!?]*[.!?]+/g) ?? []).length || (text.trim().length > 0 ? 1 : 0)
        : 0;
      const paragraphs = text.trim()
        ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
        : 0;

      // Estimated reading time at 200 wpm
      const reading_time_seconds = Math.ceil((words / 200) * 60);
      const reading_time =
        reading_time_seconds < 60
          ? `${reading_time_seconds}s`
          : `${Math.ceil(reading_time_seconds / 60)}m`;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            words,
            characters,
            characters_no_spaces,
            lines,
            lines_non_empty,
            sentences,
            paragraphs,
            estimated_reading_time: reading_time,
          }, null, 2),
        }],
      };
    }
  );
}
