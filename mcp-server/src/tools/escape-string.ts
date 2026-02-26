import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "escape_string",
    "Escape special characters in a string (newlines, tabs, quotes, backslashes)",
    {
      input: z.string().describe("String to escape"),
      mode: z.enum(["json", "js", "regex", "shell"]).optional().default("json").describe("Escape mode: json, js, regex, or shell"),
    },
    async ({ input, mode }) => {
      let output: string;
      switch (mode) {
        case "json":
        case "js":
          // JSON-style escaping
          output = JSON.stringify(input).slice(1, -1);
          break;
        case "regex":
          output = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          break;
        case "shell":
          output = "'" + input.replace(/'/g, "'\\''") + "'";
          break;
        default:
          output = JSON.stringify(input).slice(1, -1);
      }
      return { content: [{ type: "text", text: output }] };
    }
  );
}
