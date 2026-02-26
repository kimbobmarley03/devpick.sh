import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const INLINE_ELEMENTS = new Set([
  "a", "abbr", "acronym", "b", "bdo", "big", "br", "button", "cite",
  "code", "dfn", "em", "i", "img", "input", "kbd", "label", "map",
  "object", "output", "q", "samp", "select", "small", "span", "strong",
  "sub", "sup", "textarea", "time", "tt", "var",
]);

const RAW_ELEMENTS = new Set(["script", "style", "pre", "textarea"]);

function formatHTML(html: string, indentSize = 2): string {
  const pad = " ".repeat(indentSize);
  let level = 0;
  const lines: string[] = [];

  const tokens = html.match(/<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[a-zA-Z][^>]*\/?>|[^<]+/g) ?? [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (!trimmed.startsWith("<")) {
      // Text content
      lines.push(pad.repeat(level) + trimmed);
      continue;
    }

    if (trimmed.startsWith("<!--") || trimmed.startsWith("<!")) {
      lines.push(pad.repeat(level) + trimmed);
      continue;
    }

    // Closing tag
    const closeMatch = trimmed.match(/^<\/([a-zA-Z][a-zA-Z0-9]*)/);
    if (closeMatch) {
      const tagName = closeMatch[1].toLowerCase();
      if (!INLINE_ELEMENTS.has(tagName)) {
        level = Math.max(0, level - 1);
      }
      lines.push(pad.repeat(level) + trimmed);
      continue;
    }

    // Self-closing or void
    const openMatch = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
    if (openMatch) {
      const tagName = openMatch[1].toLowerCase();
      const isSelfClosing = trimmed.endsWith("/>") || VOID_ELEMENTS.has(tagName);
      const isInline = INLINE_ELEMENTS.has(tagName);

      lines.push(pad.repeat(level) + trimmed);

      if (!isSelfClosing && !isInline) {
        level++;
      }
    } else {
      lines.push(pad.repeat(level) + trimmed);
    }
  }

  return lines.join("\n");
}

function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

export function register(server: McpServer) {
  server.tool(
    "format_html",
    "Format and prettify HTML markup with proper indentation",
    {
      html: z.string().describe("HTML string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("If true, minify instead of format"),
    },
    async ({ html, indent, minify }) => {
      try {
        const output = minify ? minifyHTML(html) : formatHTML(html, indent);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
