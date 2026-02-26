import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function expandHex(raw: string): string | null {
  let h = raw.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = expandHex(hex);
  if (!h) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default: h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function parseRgb(input: string): { r: number; g: number; b: number } | null {
  const m = input.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!m) return null;
  const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
}

function parseHsl(input: string): { h: number; s: number; l: number } | null {
  const m = input.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (!m) return null;
  return { h: parseInt(m[1]), s: parseInt(m[2]), l: parseInt(m[3]) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m2 = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return {
    r: Math.round((r + m2) * 255),
    g: Math.round((g + m2) * 255),
    b: Math.round((b + m2) * 255),
  };
}

export function registerColorConverter(server: McpServer) {
  server.tool(
    "convert_color",
    "Convert colors between HEX, RGB, and HSL formats",
    {
      color: z
        .string()
        .describe(
          "Color in any format: HEX (#ff5733 or #f53), RGB (255, 87, 51), or HSL (11, 100%, 60%)"
        ),
    },
    async ({ color }) => {
      const input = color.trim();
      let rgb: { r: number; g: number; b: number } | null = null;

      // Detect format
      if (input.startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(input)) {
        rgb = hexToRgb(input);
      } else if (/^hsl/i.test(input) || (input.includes("%") && /\d+/.test(input))) {
        const hsl = parseHsl(input);
        if (hsl) rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      } else {
        rgb = parseRgb(input);
      }

      if (!rgb) {
        return {
          content: [{ type: "text", text: "Error: Could not parse color. Use HEX (#ff5733), RGB (255, 87, 51), or HSL (11, 100%, 60%)" }],
          isError: true,
        };
      }

      const { r, g, b } = rgb;
      const hsl = rgbToHsl(r, g, b);
      const h = expandHex(`${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);

      const result = {
        hex: `#${h}`,
        hex_upper: `#${h?.toUpperCase()}`,
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgb_values: { r, g, b },
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsl_values: hsl,
        css_rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
