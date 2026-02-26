import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "rgb_to_hex",
    "Convert RGB color values to a hex color code",
    {
      r: z.number().min(0).max(255).describe("Red channel (0-255)"),
      g: z.number().min(0).max(255).describe("Green channel (0-255)"),
      b: z.number().min(0).max(255).describe("Blue channel (0-255)"),
    },
    async ({ r, g, b }) => {
      const clamp = (n: number) => Math.round(Math.min(255, Math.max(0, n)));
      const cr = clamp(r), cg = clamp(g), cb = clamp(b);
      const hex = "#" + [cr, cg, cb].map((v) => v.toString(16).padStart(2, "0")).join("");
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            r: cr, g: cg, b: cb,
            hex,
            rgb_string: `rgb(${cr}, ${cg}, ${cb})`,
          }, null, 2),
        }],
      };
    }
  );
}
