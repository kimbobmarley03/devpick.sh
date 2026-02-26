import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function describeField(value: string, type: "minute" | "hour" | "day" | "month" | "weekday"): string {
  if (value === "*") return `every ${type}`;
  if (value.startsWith("*/")) {
    const n = value.slice(2);
    return `every ${n} ${type}${parseInt(n) !== 1 ? "s" : ""}`;
  }
  if (value.includes(",")) {
    const parts = value.split(",");
    if (type === "weekday") return parts.map((p) => DAYS[parseInt(p)] ?? p).join(", ");
    if (type === "month") return parts.map((p) => MONTHS[parseInt(p) - 1] ?? p).join(", ");
    return parts.join(", ");
  }
  if (value.includes("-")) {
    const [a, b] = value.split("-");
    if (type === "weekday") return `${DAYS[parseInt(a)] ?? a} through ${DAYS[parseInt(b)] ?? b}`;
    if (type === "month") return `${MONTHS[parseInt(a) - 1] ?? a} through ${MONTHS[parseInt(b) - 1] ?? b}`;
    return `${a} through ${b}`;
  }
  if (type === "weekday") return DAYS[parseInt(value)] ?? value;
  if (type === "month") return MONTHS[parseInt(value) - 1] ?? value;
  if (type === "hour") {
    const h = parseInt(value);
    if (h === 0) return "midnight (12 AM)";
    if (h === 12) return "noon (12 PM)";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  }
  return value;
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression — need exactly 5 fields";
  const [min, hour, dom, month, dow] = parts;
  if (expr === "* * * * *") return "Every minute";
  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*")
    return `Every ${min.slice(2)} minutes`;
  if (hour.startsWith("*/") && min === "0" && dom === "*" && month === "*" && dow === "*")
    return `Every ${hour.slice(2)} hours, on the hour`;
  const pieces: string[] = [];
  if (min !== "*" && hour !== "*") {
    pieces.push(`At ${describeField(hour, "hour")}:${min.padStart(2, "0")}`);
  } else if (min !== "*") {
    pieces.push(`At minute ${describeField(min, "minute")}`);
  } else if (hour !== "*") {
    pieces.push(`Every minute, during hour ${describeField(hour, "hour")}`);
  }
  if (dom !== "*") pieces.push(`on day ${describeField(dom, "day")} of the month`);
  if (month !== "*") pieces.push(`in ${describeField(month, "month")}`);
  if (dow !== "*") pieces.push(`on ${describeField(dow, "weekday")}`);
  return pieces.length > 0 ? pieces.join(", ") : "Every minute";
}

function getNextRun(expr: string): string {
  try {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return "N/A";
    const [minF, hourF, , , ] = parts;
    const now = new Date();
    const next = new Date(now);
    next.setSeconds(0, 0);
    next.setMinutes(next.getMinutes() + 1);
    // Simple approximation — only for simple cases
    if (minF === "*" && hourF === "*") {
      return next.toISOString();
    }
    if (hourF === "*" && minF.match(/^\d+$/)) {
      const targetMin = parseInt(minF);
      if (next.getMinutes() > targetMin) next.setHours(next.getHours() + 1);
      next.setMinutes(targetMin);
      return next.toISOString();
    }
    return "See description for schedule";
  } catch {
    return "N/A";
  }
}

export function register(server: McpServer) {
  server.tool(
    "parse_cron",
    "Parse and describe a cron expression in human-readable language",
    {
      expression: z.string().describe("Cron expression with 5 fields (minute hour day month weekday)"),
    },
    async ({ expression }) => {
      try {
        const parts = expression.trim().split(/\s+/);
        if (parts.length !== 5) {
          return {
            content: [{ type: "text", text: "Error: Cron expression must have exactly 5 fields" }],
            isError: true,
          };
        }
        const [minute, hour, day_of_month, month, day_of_week] = parts;
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              expression,
              description: describeCron(expression),
              fields: {
                minute: { value: minute, meaning: describeField(minute, "minute") },
                hour: { value: hour, meaning: describeField(hour, "hour") },
                day_of_month: { value: day_of_month, meaning: describeField(day_of_month, "day") },
                month: { value: month, meaning: describeField(month, "month") },
                day_of_week: { value: day_of_week, meaning: describeField(day_of_week, "weekday") },
              },
              next_approximate_run: getNextRun(expression),
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid cron"}` }],
          isError: true,
        };
      }
    }
  );
}
