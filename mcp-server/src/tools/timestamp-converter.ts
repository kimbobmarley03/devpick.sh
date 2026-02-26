import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTimestampConverter(server: McpServer) {
  server.tool(
    "convert_timestamp",
    "Convert between Unix timestamps (seconds/milliseconds) and human-readable dates",
    {
      input: z.string().describe("Unix timestamp (e.g. 1700000000) or date string (e.g. 2024-01-15T10:30:00Z)"),
      output_format: z
        .enum(["auto", "unix_seconds", "unix_ms", "iso", "utc", "local"])
        .optional()
        .default("auto")
        .describe("Output format: auto (shows all), unix_seconds, unix_ms, iso, utc, local"),
    },
    async ({ input, output_format }) => {
      const trimmed = input.trim();
      const num = Number(trimmed);
      let date: Date;

      if (!isNaN(num) && trimmed !== "") {
        // It's a number — treat as timestamp
        const ms = trimmed.length >= 13 ? num : num * 1000;
        date = new Date(ms);
      } else {
        // Try parsing as date string
        date = new Date(trimmed);
      }

      if (isNaN(date.getTime())) {
        return {
          content: [{ type: "text", text: "Error: Could not parse date. Use Unix timestamp or ISO date string." }],
          isError: true,
        };
      }

      const unix_s = Math.floor(date.getTime() / 1000);
      const unix_ms = date.getTime();

      if (output_format === "auto") {
        const result = {
          unix_seconds: unix_s,
          unix_milliseconds: unix_ms,
          iso_8601: date.toISOString(),
          utc: date.toUTCString(),
          relative: (() => {
            const diff = Date.now() - date.getTime();
            const abs = Math.abs(diff);
            const future = diff < 0;
            if (abs < 60000) return `${future ? "in " : ""}${Math.round(abs / 1000)}s${!future ? " ago" : ""}`;
            if (abs < 3600000) return `${future ? "in " : ""}${Math.round(abs / 60000)}m${!future ? " ago" : ""}`;
            if (abs < 86400000) return `${future ? "in " : ""}${Math.round(abs / 3600000)}h${!future ? " ago" : ""}`;
            return `${future ? "in " : ""}${Math.round(abs / 86400000)}d${!future ? " ago" : ""}`;
          })(),
        };
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      const outputs: Record<string, unknown> = {
        unix_seconds: unix_s,
        unix_ms,
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
      };

      return {
        content: [
          {
            type: "text",
            text: output_format in outputs ? String(outputs[output_format]) : JSON.stringify(outputs, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "current_timestamp",
    "Get the current date and time in all common formats",
    {},
    async () => {
      const now = new Date();
      const result = {
        unix_seconds: Math.floor(now.getTime() / 1000),
        unix_milliseconds: now.getTime(),
        iso_8601: now.toISOString(),
        utc: now.toUTCString(),
        date: now.toISOString().split("T")[0],
        time: now.toISOString().split("T")[1].split(".")[0],
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
