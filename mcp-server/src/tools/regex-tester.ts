import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerRegexTester(server: McpServer) {
  server.tool(
    "test_regex",
    "Test a regex pattern against text and return all matches with indices",
    {
      pattern: z.string().describe("Regular expression pattern (without slashes)"),
      text: z.string().describe("Text to test the pattern against"),
      flags: z
        .string()
        .optional()
        .default("g")
        .describe("Regex flags: g (global), i (case-insensitive), m (multiline), s (dotAll). Default: g"),
    },
    async ({ pattern, text, flags }) => {
      try {
        const re = new RegExp(pattern, flags);
        const matches: Array<{
          index: number;
          match: string;
          groups?: Record<string, string>;
          captures?: (string | undefined)[];
        }> = [];

        if (flags.includes("g")) {
          let m: RegExpExecArray | null;
          let safety = 0;
          const rex = new RegExp(pattern, flags);
          while ((m = rex.exec(text)) !== null && safety < 500) {
            matches.push({
              index: m.index,
              match: m[0],
              groups: m.groups ? { ...m.groups } : undefined,
              captures: m.slice(1).length > 0 ? m.slice(1) : undefined,
            });
            if (m[0].length === 0) rex.lastIndex++;
            safety++;
          }
        } else {
          const m = re.exec(text);
          if (m) {
            matches.push({
              index: m.index,
              match: m[0],
              groups: m.groups ? { ...m.groups } : undefined,
              captures: m.slice(1).length > 0 ? m.slice(1) : undefined,
            });
          }
        }

        const result = {
          pattern: `/${pattern}/${flags}`,
          total_matches: matches.length,
          matches,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid regex"}` }],
          isError: true,
        };
      }
    }
  );
}
