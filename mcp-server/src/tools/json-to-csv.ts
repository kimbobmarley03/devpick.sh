import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function escapeCSV(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function jsonToCSV(json: string, delimiter = ","): string {
  const parsed = JSON.parse(json);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return "";

  // Collect all unique keys
  const allKeys = Array.from(
    new Set(arr.flatMap((row: Record<string, unknown>) => Object.keys(row)))
  ) as string[];

  const rows: string[] = [];
  rows.push(allKeys.map((k) => escapeCSV(k)).join(delimiter));

  for (const row of arr as Record<string, unknown>[]) {
    rows.push(allKeys.map((k) => escapeCSV(row[k])).join(delimiter));
  }

  return rows.join("\n");
}

export function register(server: McpServer) {
  server.tool(
    "json_to_csv",
    "Convert a JSON array to CSV format",
    {
      json: z.string().describe("JSON array (or object) to convert"),
      delimiter: z.string().optional().default(",").describe("Column delimiter (default: comma)"),
    },
    async ({ json, delimiter }) => {
      try {
        const output = jsonToCSV(json, delimiter);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
