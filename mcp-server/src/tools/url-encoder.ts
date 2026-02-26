import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerUrlEncoder(server: McpServer) {
  server.tool(
    "encode_url",
    "URL-encode a string using percent-encoding",
    {
      input: z.string().describe("String to URL-encode"),
    },
    async ({ input }) => {
      try {
        const result = encodeURIComponent(input);
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Encoding failed"}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "decode_url",
    "Decode a percent-encoded URL string",
    {
      input: z.string().describe("URL-encoded string to decode"),
    },
    async ({ input }) => {
      try {
        const result = decodeURIComponent(input);
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Decoding failed"}` }],
          isError: true,
        };
      }
    }
  );
}
