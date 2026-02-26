import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "encode_url",
    "URL-encode (percent-encode) a string for use in URLs",
    {
      input: z.string().describe("String to URL-encode"),
      full: z.boolean().optional().default(false).describe("If true, encode the full URL (use encodeURI); otherwise encode a component (encodeURIComponent)"),
    },
    async ({ input, full }) => {
      try {
        const output = full ? encodeURI(input) : encodeURIComponent(input);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
