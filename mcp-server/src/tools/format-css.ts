import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function formatCSS(css: string, indentSize = 2): string {
  const pad = " ".repeat(indentSize);
  // Remove existing formatting
  const cleaned = css
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m) // preserve comments
    .replace(/\s*{\s*/g, " {\n")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/\s*;\s*/g, ";\n")
    .replace(/\s*:\s*/g, ": ")
    .replace(/\n\s*\n/g, "\n");

  // Indent declarations inside braces
  const lines = cleaned.split("\n");
  let level = 0;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "}") {
      level = Math.max(0, level - 1);
      result.push(pad.repeat(level) + trimmed);
    } else if (trimmed.endsWith("{")) {
      result.push(pad.repeat(level) + trimmed);
      level++;
    } else {
      result.push(pad.repeat(level) + trimmed);
    }
  }

  return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ",")
    .trim();
}

export function register(server: McpServer) {
  server.tool(
    "format_css",
    "Format and prettify CSS stylesheets with proper indentation",
    {
      css: z.string().describe("CSS string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("If true, minify instead of format"),
    },
    async ({ css, indent, minify }) => {
      try {
        const output = minify ? minifyCSS(css) : formatCSS(css, indent);
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
