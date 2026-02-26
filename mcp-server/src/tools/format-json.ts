import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "format_json",
    "Format, prettify, or minify JSON data",
    {
      json: z.string().describe("Raw JSON string"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("If true, minify instead of prettify"),
    },
    async ({ json, indent, minify }) => {
      try {
        const parsed = JSON.parse(json);
        const output = minify
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indent);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
