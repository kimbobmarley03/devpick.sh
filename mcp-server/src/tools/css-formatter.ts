import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function formatCss(css: string, indentSize: number): string {
  const indent = " ".repeat(indentSize);
  let result = "";
  let level = 0;
  let i = 0;
  const len = css.length;

  const peek = () => css[i] ?? "";
  const next = () => css[i++];

  while (i < len) {
    const ch = css[i];

    // Comments
    if (ch === "/" && css[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < len && !(css[i] === "*" && css[i + 1] === "/")) i++;
      i += 2;
      result += indent.repeat(level) + css.slice(start, i).trim() + "\n";
      continue;
    }

    // Opening brace
    if (ch === "{") {
      result = result.trimEnd() + " {\n";
      level++;
      i++;
      continue;
    }

    // Closing brace
    if (ch === "}") {
      level = Math.max(0, level - 1);
      result += indent.repeat(level) + "}\n\n";
      i++;
      continue;
    }

    // Semicolon (end of property)
    if (ch === ";") {
      result = result.trimEnd() + ";\n";
      i++;
      continue;
    }

    // Whitespace between rules (outside braces)
    if (/\s/.test(ch)) {
      if (level === 0) {
        // Skip extra whitespace at top level
        while (i < len && /\s/.test(css[i])) i++;
      } else {
        // Inside rule: trim and start fresh line with indent
        while (i < len && /\s/.test(css[i])) i++;
        if (i < len && css[i] !== "}" && css[i] !== ";") {
          result += indent.repeat(level);
        }
      }
      continue;
    }

    // Normal character
    if (level > 0 && (result.endsWith("\n") || result === "")) {
      result += indent.repeat(level);
    }
    result += next();
  }

  // Clean up multiple blank lines
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export function registerCssFormatter(server: McpServer) {
  server.tool(
    "format_css",
    "Format (prettify) or minify CSS stylesheets",
    {
      css: z.string().describe("CSS string to format"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
      minify: z.boolean().optional().default(false).describe("Minify instead of prettify"),
    },
    async ({ css, indent, minify }) => {
      try {
        const result = minify ? minifyCss(css) : formatCss(css, indent);
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
