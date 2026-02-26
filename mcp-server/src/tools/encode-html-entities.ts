import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

export function register(server: McpServer) {
  server.tool(
    "encode_html_entities",
    "Encode special characters to HTML entities (&amp;, &lt;, &gt;, etc.)",
    {
      input: z.string().describe("Text to encode HTML entities in"),
    },
    async ({ input }) => {
      const output = input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] ?? char);
      return { content: [{ type: "text", text: output }] };
    }
  );
}
