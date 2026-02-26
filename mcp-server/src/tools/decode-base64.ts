import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "decode_base64",
    "Decode a Base64 string back to text",
    {
      input: z.string().describe("Base64 encoded string to decode"),
    },
    async ({ input }) => {
      try {
        const decoded = Buffer.from(input.trim(), "base64").toString("utf-8");
        return { content: [{ type: "text", text: decoded }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid Base64"}` }],
          isError: true,
        };
      }
    }
  );
}
