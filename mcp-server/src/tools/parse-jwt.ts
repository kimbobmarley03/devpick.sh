import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function register(server: McpServer) {
  server.tool(
    "parse_jwt",
    "Decode and inspect a JWT token (header, payload, expiry — does NOT verify signature)",
    {
      token: z.string().describe("JWT token string"),
    },
    async ({ token }) => {
      try {
        const parts = token.trim().split(".");
        if (parts.length !== 3) {
          return {
            content: [{ type: "text", text: "Error: Invalid JWT — expected 3 parts separated by dots" }],
            isError: true,
          };
        }

        const header = JSON.parse(decodeBase64Url(parts[0])) as Record<string, unknown>;
        const payload = JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
        const signature = parts[2];

        const now = Math.floor(Date.now() / 1000);
        let isExpired: boolean | null = null;
        let expiresAt: string | null = null;
        let issuedAt: string | null = null;

        if (typeof payload.exp === "number") {
          isExpired = now > payload.exp;
          expiresAt = new Date(payload.exp * 1000).toISOString();
        }
        if (typeof payload.iat === "number") {
          issuedAt = new Date(payload.iat * 1000).toISOString();
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              header,
              payload,
              signature,
              meta: {
                is_expired: isExpired,
                expires_at: expiresAt,
                issued_at: issuedAt,
                algorithm: header.alg ?? null,
                type: header.typ ?? null,
              },
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JWT"}` }],
          isError: true,
        };
      }
    }
  );
}
