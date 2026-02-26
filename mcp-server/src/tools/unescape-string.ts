import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "unescape_string",
    "Unescape escape sequences in a string (\\n, \\t, \\\\, \\\", etc.)",
    {
      input: z.string().describe("String with escape sequences to unescape"),
      mode: z.enum(["json", "unicode"]).optional().default("json").describe("Unescape mode: json or unicode"),
    },
    async ({ input, mode }) => {
      try {
        let output: string;
        if (mode === "unicode") {
          output = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, code: string) =>
            String.fromCharCode(parseInt(code, 16))
          );
        } else {
          // JSON unescape — wrap in quotes and parse
          output = JSON.parse(`"${input.replace(/"/g, '\\"')}"`);
        }
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to unescape"}` }],
          isError: true,
        };
      }
    }
  );
}
