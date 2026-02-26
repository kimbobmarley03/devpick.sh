import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const NAMED_ENCODE: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  "¢": "&cent;", "£": "&pound;", "¥": "&yen;", "€": "&euro;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;",
  "°": "&deg;", "±": "&plusmn;", "×": "&times;", "÷": "&divide;",
  "½": "&frac12;", "¼": "&frac14;", "¾": "&frac34;",
  "…": "&hellip;", "—": "&mdash;", "–": "&ndash;", "\u00a0": "&nbsp;",
  "«": "&laquo;", "»": "&raquo;",
  "←": "&larr;", "→": "&rarr;", "↑": "&uarr;", "↓": "&darr;", "↔": "&harr;",
  "∞": "&infin;", "√": "&radic;", "≠": "&ne;", "≤": "&le;", "≥": "&ge;",
  "α": "&alpha;", "β": "&beta;", "γ": "&gamma;", "δ": "&delta;",
  "ε": "&epsilon;", "π": "&pi;", "σ": "&sigma;", "Ω": "&Omega;",
};

const NAMED_DECODE: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENCODE).map(([k, v]) => [v, k])
);

function encodeEntities(input: string): string {
  return Array.from(input)
    .map((ch) => {
      if (NAMED_ENCODE[ch]) return NAMED_ENCODE[ch];
      const code = ch.codePointAt(0)!;
      if (code > 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
        return `&#${code};`;
      }
      return ch;
    })
    .join("");
}

function decodeEntities(input: string): string {
  let result = input.replace(/&[a-zA-Z]+;/g, (match) => NAMED_DECODE[match] ?? match);
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
  return result;
}

export function registerHtmlEntities(server: McpServer) {
  server.tool(
    "encode_html_entities",
    "Encode special characters to HTML entities (&amp;, &lt;, &gt;, etc.)",
    {
      text: z.string().describe("Text to encode as HTML entities"),
    },
    async ({ text }) => {
      return { content: [{ type: "text", text: encodeEntities(text) }] };
    }
  );

  server.tool(
    "decode_html_entities",
    "Decode HTML entities back to plain text (&amp; → &, &lt; → <, etc.)",
    {
      text: z.string().describe("HTML-encoded text to decode"),
    },
    async ({ text }) => {
      return { content: [{ type: "text", text: decodeEntities(text) }] };
    }
  );
}
