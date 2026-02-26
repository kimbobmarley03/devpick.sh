import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";

export function registerUuidGenerator(server: McpServer) {
  server.tool(
    "generate_uuid",
    "Generate one or more random UUID v4 identifiers",
    {
      count: z
        .number()
        .optional()
        .default(1)
        .describe("Number of UUIDs to generate (1-100, default 1)"),
      uppercase: z
        .boolean()
        .optional()
        .default(false)
        .describe("Return uppercase UUIDs"),
    },
    async ({ count, uppercase }) => {
      const n = Math.min(Math.max(count, 1), 100);
      const uuids = Array.from({ length: n }, () => {
        const id = randomUUID();
        return uppercase ? id.toUpperCase() : id;
      });
      return {
        content: [
          {
            type: "text",
            text: uuids.length === 1 ? uuids[0] : uuids.join("\n"),
          },
        ],
      };
    }
  );
}
