import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: "\u00A0", copy: "©", reg: "®", trade: "™",
  mdash: "—", ndash: "–", laquo: "«", raquo: "»",
  hellip: "…", euro: "€", pound: "£", yen: "¥",
  cent: "¢", deg: "°", plusmn: "±", times: "×",
  divide: "÷", frac12: "½", frac14: "¼", frac34: "¾",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ",
  pi: "π", sigma: "σ", omega: "ω",
};

export function register(server: McpServer) {
  server.tool(
    "decode_html_entities",
    "Decode HTML entities back to their original characters",
    {
      input: z.string().describe("HTML with entities to decode"),
    },
    async ({ input }) => {
      const output = input.replace(/&([#a-zA-Z0-9]+);/g, (_, entity: string) => {
        if (entity.startsWith("#x") || entity.startsWith("#X")) {
          return String.fromCharCode(parseInt(entity.slice(2), 16));
        }
        if (entity.startsWith("#")) {
          return String.fromCharCode(parseInt(entity.slice(1), 10));
        }
        return NAMED_ENTITIES[entity] ?? `&${entity};`;
      });
      return { content: [{ type: "text", text: output }] };
    }
  );
}
