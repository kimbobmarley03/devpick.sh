import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "decode_url",
    "Decode a URL-encoded (percent-encoded) string",
    {
      input: z.string().describe("URL-encoded string to decode"),
      full: z.boolean().optional().default(false).describe("If true, decode a full URL (use decodeURI); otherwise decode a component (decodeURIComponent)"),
    },
    async ({ input, full }) => {
      try {
        const output = full ? decodeURI(input) : decodeURIComponent(input);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid URL encoding"}` }],
          isError: true,
        };
      }
    }
  );
}
