import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function escapeJson(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/[\x00-\x1f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function unescapeJson(s: string): string {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return s
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(s: string): string {
  return s.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}

export function registerEscapeUnescape(server: McpServer) {
  server.tool(
    "escape_string",
    "Escape special characters in strings for JSON, HTML, XML, URL, or Regex contexts",
    {
      text: z.string().describe("Text to escape"),
      format: z
        .enum(["json", "html", "xml", "url", "regex"])
        .describe("Escape format: json, html, xml, url, or regex"),
    },
    async ({ text, format }) => {
      let result: string;
      switch (format) {
        case "json": result = escapeJson(text); break;
        case "html": result = escapeHtml(text); break;
        case "xml": result = escapeXml(text); break;
        case "url": result = encodeURIComponent(text); break;
        case "regex": result = escapeRegex(text); break;
        default: result = text;
      }
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "unescape_string",
    "Unescape special characters in strings from JSON, HTML, XML, URL, or Regex contexts",
    {
      text: z.string().describe("Text to unescape"),
      format: z
        .enum(["json", "html", "xml", "url", "regex"])
        .describe("Unescape format: json, html, xml, url, or regex"),
    },
    async ({ text, format }) => {
      let result: string;
      try {
        switch (format) {
          case "json": result = unescapeJson(text); break;
          case "html": result = unescapeHtml(text); break;
          case "xml": result = unescapeXml(text); break;
          case "url": result = decodeURIComponent(text); break;
          case "regex": result = unescapeRegex(text); break;
          default: result = text;
        }
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Unescaping failed"}` }],
          isError: true,
        };
      }
    }
  );
}
