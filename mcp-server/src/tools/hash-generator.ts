import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createHash } from "crypto";

export function registerHashGenerator(server: McpServer) {
  server.tool(
    "generate_hash",
    "Generate MD5, SHA-1, SHA-256, or SHA-512 hash of text",
    {
      text: z.string().describe("Text to hash"),
      algorithm: z
        .enum(["md5", "sha1", "sha256", "sha512"])
        .optional()
        .default("sha256")
        .describe("Hash algorithm: md5, sha1, sha256 (default), sha512"),
    },
    async ({ text, algorithm }) => {
      try {
        const hash = createHash(algorithm).update(text, "utf-8").digest("hex");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { algorithm, hash, input_length: text.length },
                null,
                2
              ),
            },
          ],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Hashing failed"}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "generate_all_hashes",
    "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously",
    {
      text: z.string().describe("Text to hash"),
    },
    async ({ text }) => {
      try {
        const result = {
          MD5: createHash("md5").update(text, "utf-8").digest("hex"),
          "SHA-1": createHash("sha1").update(text, "utf-8").digest("hex"),
          "SHA-256": createHash("sha256").update(text, "utf-8").digest("hex"),
          "SHA-512": createHash("sha512").update(text, "utf-8").digest("hex"),
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Hashing failed"}` }],
          isError: true,
        };
      }
    }
  );
}
