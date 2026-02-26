import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function formatXml(xml: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  let result = "";
  let level = 0;

  // Tokenize XML
  const regex = /<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/([a-zA-Z][a-zA-Z0-9:.-]*)>|<([a-zA-Z][a-zA-Z0-9:.-]*)([^>]*?)(\/?)>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(xml)) !== null) {
    const raw = match[0];

    // Processing instruction, comment, CDATA
    if (raw.startsWith("<?") || raw.startsWith("<!--") || raw.startsWith("<![CDATA[")) {
      result += indent.repeat(level) + raw.trim() + "\n";
      continue;
    }

    // Closing tag
    if (match[1]) {
      level = Math.max(0, level - 1);
      result += indent.repeat(level) + raw.trim() + "\n";
      continue;
    }

    // Opening or self-closing tag
    if (match[2]) {
      const isSelfClosing = match[4] === "/";
      result += indent.repeat(level) + raw.trim() + "\n";
      if (!isSelfClosing) level++;
      continue;
    }

    // Text content
    if (match[5] !== undefined) {
      const text = match[5].trim();
      if (text) {
        result += indent.repeat(level) + text + "\n";
      }
    }
  }

  return result.trimEnd();
}

function minifyXml(xml: string): string {
  return xml
    .replace(/<!--[\s\S]*?-->/g, "") // remove comments
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function registerXmlFormatter(server: McpServer) {
  server.tool(
    "format_xml",
    "Format (prettify) or minify XML documents",
    {
      xml: z.string().describe("XML string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("Minify instead of prettify"),
    },
    async ({ xml, indent, minify }) => {
      try {
        const result = minify ? minifyXml(xml) : formatXml(xml, indent);
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
