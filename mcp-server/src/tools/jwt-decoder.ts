import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function decodeBase64Url(str: string): string {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function registerJwtDecoder(server: McpServer) {
  server.tool(
    "parse_jwt",
    "Decode a JWT token and extract header, payload, and expiry status",
    {
      token: z.string().describe("JWT token to decode (format: header.payload.signature)"),
    },
    async ({ token }) => {
      try {
        const parts = token.trim().split(".");
        if (parts.length !== 3) {
          return {
            content: [{ type: "text", text: "Error: Invalid JWT format — expected 3 parts separated by dots" }],
            isError: true,
          };
        }

        const header = JSON.parse(decodeBase64Url(parts[0]));
        const payload = JSON.parse(decodeBase64Url(parts[1]));
        const signature = parts[2];

        const now = Math.floor(Date.now() / 1000);
        let expiryStatus = "no expiration claim (exp)";
        if (payload.exp) {
          const expiresAt = new Date(payload.exp * 1000).toISOString();
          expiryStatus = now > payload.exp
            ? `EXPIRED at ${expiresAt}`
            : `valid until ${expiresAt}`;
        }

        // Format iat/exp as ISO strings for readability
        const formattedPayload = { ...payload };
        if (formattedPayload.iat) {
          formattedPayload.iat_iso = new Date(formattedPayload.iat * 1000).toISOString();
        }
        if (formattedPayload.exp) {
          formattedPayload.exp_iso = new Date(formattedPayload.exp * 1000).toISOString();
        }

        const result = {
          header,
          payload: formattedPayload,
          signature: signature.slice(0, 20) + "...",
          expiry_status: expiryStatus,
        };

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JWT"}` }],
          isError: true,
        };
      }
    }
  );
}
