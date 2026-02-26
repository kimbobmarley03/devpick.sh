import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function toWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function convert(text: string, caseType: string): string {
  if (!text) return "";
  const words = toWords(text);
  switch (caseType) {
    case "uppercase":
    case "upper":
      return text.toUpperCase();
    case "lowercase":
    case "lower":
      return text.toLowerCase();
    case "titlecase":
    case "title":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "camelcase":
    case "camel":
      return words
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    case "snakecase":
    case "snake":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebabcase":
    case "kebab":
      return words.map((w) => w.toLowerCase()).join("-");
    case "pascalcase":
    case "pascal":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "constantcase":
    case "constant":
    case "screaming_snake":
      return words.map((w) => w.toUpperCase()).join("_");
    default:
      return text;
  }
}

export function registerCaseConverter(server: McpServer) {
  server.tool(
    "convert_case",
    "Convert text between different cases: camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, Title Case, etc.",
    {
      text: z.string().describe("Text to convert"),
      to: z
        .enum([
          "upper",
          "lower",
          "title",
          "camel",
          "snake",
          "kebab",
          "pascal",
          "constant",
        ])
        .describe(
          "Target case: upper, lower, title, camel, snake, kebab, pascal, constant"
        ),
    },
    async ({ text, to }) => {
      const result = convert(text, to);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "convert_case_all",
    "Convert text to all common cases at once",
    {
      text: z.string().describe("Text to convert to all cases"),
    },
    async ({ text }) => {
      const cases = ["upper", "lower", "title", "camel", "snake", "kebab", "pascal", "constant"];
      const result: Record<string, string> = {};
      for (const c of cases) {
        result[c] = convert(text, c);
      }
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
