import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerBase64(server: McpServer) {
  server.tool(
    "encode_base64",
    "Encode text or binary data to Base64",
    {
      input: z.string().describe("Text to encode to Base64"),
    },
    async ({ input }) => {
      try {
        const result = Buffer.from(input, "utf-8").toString("base64");
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
    "decode_base64",
    "Decode Base64 encoded data back to text",
    {
      input: z.string().describe("Base64 string to decode"),
    },
    async ({ input }) => {
      try {
        const result = Buffer.from(input.trim(), "base64").toString("utf-8");
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
