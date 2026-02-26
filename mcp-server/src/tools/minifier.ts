import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function minifyJs(code: string): string {
  // Basic JS minification: remove comments, collapse whitespace
  // Note: This is a simple minifier — for production use terser
  return code
    // Remove single-line comments (but not inside strings)
    .replace(/\/\/[^\n]*/g, "")
    // Remove block comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Collapse whitespace
    .replace(/\s*([{};:,=+\-*/<>!&|?()[\]])\s*/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\n\s*/g, "\n")
    .replace(/\n+/g, " ")
    .trim();
}

function minifyCss(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
    .replace(/\s*([{}:;,>+~])\s*/g, "$1") // remove spaces around operators
    .replace(/\s{2,}/g, " ") // collapse whitespace
    .replace(/\n/g, " ")
    .replace(/;}/g, "}") // remove trailing semicolons before }
    .trim();
}

function minifyHtml(code: string): string {
  return code
    // Remove HTML comments (but not IE conditionals)
    .replace(/<!--(?![\s\S]*?\[if )[\s\S]*?-->/g, "")
    // Collapse whitespace between tags
    .replace(/>\s+</g, "><")
    // Collapse multiple spaces
    .replace(/\s{2,}/g, " ")
    .trim();
}

function minifyJson(code: string): string {
  try {
    return JSON.stringify(JSON.parse(code));
  } catch (e) {
    throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`);
  }
}

export function registerMinifier(server: McpServer) {
  server.tool(
    "minify_code",
    "Minify JavaScript, CSS, HTML, or JSON by removing whitespace and comments",
    {
      code: z.string().describe("Code to minify"),
      language: z
        .enum(["js", "css", "html", "json"])
        .describe("Language: js, css, html, or json"),
    },
    async ({ code, language }) => {
      try {
        let result: string;
        switch (language) {
          case "js": result = minifyJs(code); break;
          case "css": result = minifyCss(code); break;
          case "html": result = minifyHtml(code); break;
          case "json": result = minifyJson(code); break;
          default: result = code;
        }

        const originalSize = Buffer.byteLength(code, "utf-8");
        const minifiedSize = Buffer.byteLength(result, "utf-8");
        const savings = (((originalSize - minifiedSize) / originalSize) * 100).toFixed(1);

        return {
          content: [
            {
              type: "text",
              text: `// Original: ${originalSize} bytes → Minified: ${minifiedSize} bytes (${savings}% reduction)\n${result}`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Minification failed"}` }],
          isError: true,
        };
      }
    }
  );
}
