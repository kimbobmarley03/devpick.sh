import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "crypto";

export function register(server: McpServer) {
  server.tool(
    "generate_uuid",
    "Generate one or more random UUID v4 identifiers",
    {
      count: z.number().min(1).max(100).optional().default(1).describe("Number of UUIDs to generate (1-100)"),
      uppercase: z.boolean().optional().default(false).describe("If true, return uppercase UUIDs"),
    },
    async ({ count, uppercase }) => {
      const n = Math.min(Math.max(count ?? 1, 1), 100);
      const uuids = Array.from({ length: n }, () => {
        const id = randomUUID();
        return uppercase ? id.toUpperCase() : id;
      });
      return { content: [{ type: "text", text: uuids.join("\n") }] };
    }
  );
}
