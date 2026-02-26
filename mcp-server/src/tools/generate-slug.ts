import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const TRANSLITERATE: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ð: "d", ñ: "n",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
  ù: "u", ú: "u", û: "u", ü: "u",
  ý: "y", þ: "th", ß: "ss",
};

function transliterate(str: string): string {
  return str.split("").map((c) => TRANSLITERATE[c] ?? c).join("");
}

function generateSlug(
  text: string,
  separator = "-",
  maxLength?: number,
  lowercase = true
): string {
  let slug = transliterate(text);
  if (lowercase) slug = slug.toLowerCase();
  // Remove non-alphanumeric chars (except spaces and the separator)
  slug = slug.replace(/[^a-zA-Z0-9\s-]/g, "");
  // Replace whitespace and multiple separators
  slug = slug.replace(/[\s-]+/g, separator);
  // Strip leading/trailing separators
  const sep = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  slug = slug.replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "");
  // Max length
  if (maxLength && slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(new RegExp(`${sep}+$`, "g"), "");
  }
  return slug;
}

export function register(server: McpServer) {
  server.tool(
    "generate_slug",
    "Generate a URL-safe slug from text",
    {
      text: z.string().describe("Text to convert to a slug"),
      separator: z.string().optional().default("-").describe("Word separator (default: hyphen)"),
      max_length: z.number().optional().describe("Maximum slug length"),
      lowercase: z.boolean().optional().default(true).describe("Convert to lowercase"),
    },
    async ({ text, separator, max_length, lowercase }) => {
      const slug = generateSlug(text, separator ?? "-", max_length, lowercase ?? true);
      return { content: [{ type: "text", text: slug }] };
    }
  );
}
