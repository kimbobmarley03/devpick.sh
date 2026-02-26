import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerJsonFormatter(server: McpServer) {
  server.tool(
    "format_json",
    "Format, prettify, or minify JSON data",
    {
      json: z.string().describe("Raw JSON string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("Minify instead of prettify"),
    },
    async ({ json, indent, minify }) => {
      try {
        const parsed = JSON.parse(json);
        const result = minify
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indent);
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
