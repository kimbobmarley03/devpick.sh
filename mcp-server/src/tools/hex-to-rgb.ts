import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function expandHex(raw: string): string | null {
  let h = raw.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toLowerCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function register(server: McpServer) {
  server.tool(
    "hex_to_rgb",
    "Convert a hex color code to RGB (and HSL) values",
    {
      hex: z.string().describe("Hex color code (e.g. '#FF5733' or 'FF5733' or '#F53')"),
    },
    async ({ hex }) => {
      const h = expandHex(hex);
      if (!h) {
        return {
          content: [{ type: "text", text: `Error: Invalid hex color: ${hex}` }],
          isError: true,
        };
      }
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const hsl = rgbToHsl(r, g, b);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            hex: `#${h}`,
            rgb: { r, g, b },
            rgb_string: `rgb(${r}, ${g}, ${b})`,
            hsl: { h: hsl.h, s: `${hsl.s}%`, l: `${hsl.l}%` },
            hsl_string: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          }, null, 2),
        }],
      };
    }
  );
}
