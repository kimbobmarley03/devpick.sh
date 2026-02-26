import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHash } from "crypto";

export function register(server: McpServer) {
  server.tool(
    "generate_hash",
    "Generate cryptographic hash of input text (MD5, SHA-1, SHA-256, SHA-512)",
    {
      input: z.string().describe("Text to hash"),
      algorithm: z.enum(["md5", "sha1", "sha256", "sha512"]).optional().default("sha256").describe("Hash algorithm"),
      encoding: z.enum(["hex", "base64"]).optional().default("hex").describe("Output encoding"),
    },
    async ({ input, algorithm, encoding }) => {
      try {
        const hash = createHash(algorithm ?? "sha256")
          .update(input, "utf-8")
          .digest(encoding ?? "hex");
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              algorithm: algorithm ?? "sha256",
              encoding: encoding ?? "hex",
              hash,
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
