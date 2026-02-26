import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const PRESETS: Record<string, string> = {
  "every minute": "* * * * *",
  "every 5 minutes": "*/5 * * * *",
  "every 10 minutes": "*/10 * * * *",
  "every 15 minutes": "*/15 * * * *",
  "every 30 minutes": "*/30 * * * *",
  "every hour": "0 * * * *",
  "every 2 hours": "0 */2 * * *",
  "every 6 hours": "0 */6 * * *",
  "every 12 hours": "0 */12 * * *",
  "every day at midnight": "0 0 * * *",
  "daily at midnight": "0 0 * * *",
  "every night": "0 0 * * *",
  "every day at noon": "0 12 * * *",
  "every weekday": "0 9 * * 1-5",
  "every monday": "0 9 * * 1",
  "every friday": "0 9 * * 5",
  "every sunday": "0 0 * * 0",
  "every week": "0 0 * * 0",
  "every month": "0 0 1 * *",
  "first of month": "0 0 1 * *",
  "every year": "0 0 1 1 *",
  "annually": "0 0 1 1 *",
};

function buildCron(
  minute: string,
  hour: string,
  dom: string,
  month: string,
  dow: string
): string {
  return `${minute} ${hour} ${dom} ${month} ${dow}`;
}

export function register(server: McpServer) {
  server.tool(
    "generate_cron_expression",
    "Generate a cron expression from common schedule descriptions or explicit fields",
    {
      preset: z.string().optional().describe("Common schedule description (e.g. 'every 5 minutes', 'every day at midnight', 'every weekday')"),
      minute: z.string().optional().default("0").describe("Minute field (0-59, *, */n, or comma-separated)"),
      hour: z.string().optional().default("*").describe("Hour field (0-23, *, */n, or comma-separated)"),
      day_of_month: z.string().optional().default("*").describe("Day of month field (1-31, *, */n)"),
      month: z.string().optional().default("*").describe("Month field (1-12, *, */n, or JAN-DEC)"),
      day_of_week: z.string().optional().default("*").describe("Day of week field (0-7, *, 0=Sunday, MON-SUN)"),
    },
    async ({ preset, minute, hour, day_of_month, month, day_of_week }) => {
      if (preset) {
        const key = preset.toLowerCase().trim();
        const match = Object.entries(PRESETS).find(([k]) => key.includes(k) || k.includes(key));
        if (match) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ expression: match[1], description: match[0] }, null, 2),
            }],
          };
        }
      }

      const expression = buildCron(
        minute ?? "0",
        hour ?? "*",
        day_of_month ?? "*",
        month ?? "*",
        day_of_week ?? "*"
      );

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            expression,
            fields: {
              minute: minute ?? "0",
              hour: hour ?? "*",
              day_of_month: day_of_month ?? "*",
              month: month ?? "*",
              day_of_week: day_of_week ?? "*",
            },
          }, null, 2),
        }],
      };
    }
  );
}
