import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "test_regex",
    "Test a regular expression pattern against text and return all matches with details",
    {
      pattern: z.string().describe("Regular expression pattern (without delimiters)"),
      text: z.string().describe("Text to test the pattern against"),
      flags: z.string().optional().default("g").describe("Regex flags (g, i, m, s, u — default: g)"),
    },
    async ({ pattern, text, flags }) => {
      try {
        const re = new RegExp(pattern, flags ?? "g");
        const matches: Array<{
          index: number;
          match: string;
          groups: Record<string, string | undefined>;
          captures: (string | undefined)[];
        }> = [];

        if ((flags ?? "g").includes("g")) {
          let m: RegExpExecArray | null;
          let safety = 0;
          while ((m = re.exec(text)) !== null && safety < 1000) {
            matches.push({
              index: m.index,
              match: m[0],
              groups: m.groups ? { ...m.groups } : {},
              captures: Array.from(m).slice(1),
            });
            if (m[0].length === 0) re.lastIndex++;
            safety++;
          }
        } else {
          const m = re.exec(text);
          if (m) {
            matches.push({
              index: m.index,
              match: m[0],
              groups: m.groups ? { ...m.groups } : {},
              captures: Array.from(m).slice(1),
            });
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              pattern,
              flags: flags ?? "g",
              match_count: matches.length,
              matches,
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid regex"}` }],
          isError: true,
        };
      }
    }
  );
}
