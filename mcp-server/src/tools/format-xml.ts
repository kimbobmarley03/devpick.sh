import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function formatXML(xml: string, indentSize = 2): string {
  const pad = " ".repeat(indentSize);
  let level = 0;
  const lines: string[] = [];

  // Tokenize XML
  const tokens = xml.match(/<\?[^?]*\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/[^>]+>|<[^>]+\/>|<[^>]+>|[^<]+/g) ?? [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("</")) {
      // Closing tag
      level = Math.max(0, level - 1);
      lines.push(pad.repeat(level) + trimmed);
    } else if (
      trimmed.startsWith("<?") ||
      trimmed.startsWith("<!--") ||
      trimmed.startsWith("<!")
    ) {
      // Declaration / comment
      lines.push(pad.repeat(level) + trimmed);
    } else if (trimmed.startsWith("<") && trimmed.endsWith("/>")) {
      // Self-closing tag
      lines.push(pad.repeat(level) + trimmed);
    } else if (trimmed.startsWith("<")) {
      // Opening tag
      lines.push(pad.repeat(level) + trimmed);
      level++;
    } else {
      // Text node
      lines.push(pad.repeat(level) + trimmed);
    }
  }

  return lines.join("\n");
}

function minifyXML(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

export function register(server: McpServer) {
  server.tool(
    "format_xml",
    "Format and prettify XML data with proper indentation",
    {
      xml: z.string().describe("XML string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("If true, minify instead of format"),
    },
    async ({ xml, indent, minify }) => {
      try {
        const output = minify ? minifyXML(xml) : formatXML(xml, indent);
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
