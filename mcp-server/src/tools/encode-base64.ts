import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "encode_base64",
    "Encode text or data to Base64",
    {
      input: z.string().describe("Text to encode to Base64"),
    },
    async ({ input }) => {
      try {
        const encoded = Buffer.from(input, "utf-8").toString("base64");
        return { content: [{ type: "text", text: encoded }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
