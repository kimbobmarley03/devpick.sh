import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register(server: McpServer) {
  server.tool(
    "number_base_convert",
    "Convert a number between bases (binary, octal, decimal, hex, or any base 2-36)",
    {
      value: z.string().describe("Number to convert (as string, e.g. '255', 'FF', '11111111')"),
      from_base: z.number().min(2).max(36).describe("Source base (e.g. 10 for decimal, 16 for hex, 2 for binary)"),
      to_base: z.number().min(2).max(36).describe("Target base"),
    },
    async ({ value, from_base, to_base }) => {
      try {
        const decimal = parseInt(value.trim(), from_base);
        if (isNaN(decimal)) {
          return {
            content: [{ type: "text", text: `Error: "${value}" is not a valid base-${from_base} number` }],
            isError: true,
          };
        }
        const result = decimal.toString(to_base).toUpperCase();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              input: value,
              from_base,
              to_base,
              result,
              decimal,
              binary: decimal.toString(2),
              octal: decimal.toString(8),
              hex: decimal.toString(16).toUpperCase(),
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Conversion failed"}` }],
          isError: true,
        };
      }
    }
  );
}
