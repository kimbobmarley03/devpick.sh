import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const INLINE_ELEMENTS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn",
  "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp",
  "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr",
]);

function formatHtml(html: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  let result = "";
  let level = 0;

  // Tokenize HTML
  const tokens: Array<{ type: "open" | "close" | "self" | "text" | "doctype" | "comment"; tag?: string; raw: string }> = [];
  const regex = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/([a-zA-Z][a-zA-Z0-9-]*)>|<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*)?)(\/)?>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[0];
    if (raw.startsWith("<!--")) {
      tokens.push({ type: "comment", raw });
    } else if (raw.startsWith("<!DOCTYPE") || raw.startsWith("<!doctype")) {
      tokens.push({ type: "doctype", raw });
    } else if (match[1]) {
      tokens.push({ type: "close", tag: match[1].toLowerCase(), raw });
    } else if (match[2]) {
      const tag = match[2].toLowerCase();
      const isSelfClosing = !!match[4] || VOID_ELEMENTS.has(tag);
      tokens.push({ type: isSelfClosing ? "self" : "open", tag, raw });
    } else if (match[5] !== undefined) {
      const text = match[5].trim();
      if (text) tokens.push({ type: "text", raw: match[5] });
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const pad = indent.repeat(level);

    switch (token.type) {
      case "doctype":
      case "comment":
        result += pad + token.raw.trim() + "\n";
        break;

      case "open": {
        const tag = token.tag!;
        result += pad + token.raw.trim() + "\n";
        if (!INLINE_ELEMENTS.has(tag)) {
          level++;
        }
        break;
      }

      case "self":
        result += pad + token.raw.trim() + "\n";
        break;

      case "close": {
        const tag = token.tag!;
        if (!INLINE_ELEMENTS.has(tag)) {
          level = Math.max(0, level - 1);
        }
        result += indent.repeat(level) + token.raw.trim() + "\n";
        break;
      }

      case "text": {
        const text = token.raw.trim();
        if (text) {
          result += pad + text + "\n";
        }
        break;
      }
    }
  }

  return result.trimEnd();
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--(?![\s\S]*?\[if )[\s\S]*?-->/g, "") // remove comments
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function registerHtmlFormatter(server: McpServer) {
  server.tool(
    "format_html",
    "Format (prettify) or minify HTML markup",
    {
      html: z.string().describe("HTML string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("Minify instead of prettify"),
    },
    async ({ html, indent, minify }) => {
      try {
        const result = minify ? minifyHtml(html) : formatHtml(html, indent);
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Formatting failed"}` }],
          isError: true,
        };
      }
    }
  );
}
