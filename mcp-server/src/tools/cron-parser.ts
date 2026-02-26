import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function describeField(value: string, type: "minute" | "hour" | "day" | "month" | "weekday"): string {
  if (value === "*") return `every ${type}`;
  if (value.startsWith("*/")) return `every ${value.slice(2)} ${type}(s)`;
  if (value.includes(",")) {
    const parts = value.split(",");
    if (type === "weekday") return parts.map((p) => DAYS[parseInt(p)] || p).join(", ");
    if (type === "month") return parts.map((p) => MONTHS[parseInt(p) - 1] || p).join(", ");
    return parts.join(", ");
  }
  if (value.includes("-")) {
    const [a, b] = value.split("-");
    if (type === "weekday") return `${DAYS[parseInt(a)] || a} through ${DAYS[parseInt(b)] || b}`;
    if (type === "month") return `${MONTHS[parseInt(a) - 1] || a} through ${MONTHS[parseInt(b) - 1] || b}`;
    return `${a} through ${b}`;
  }
  if (type === "weekday") return DAYS[parseInt(value)] || value;
  if (type === "month") return MONTHS[parseInt(value) - 1] || value;
  if (type === "hour") {
    const h = parseInt(value);
    if (h === 0) return "midnight";
    if (h === 12) return "noon";
    return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
  }
  return value;
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (need exactly 5 fields)";
  const [min, hour, dom, month, dow] = parts;

  if (expr === "* * * * *") return "Every minute";
  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*")
    return `Every ${min.slice(2)} minute(s)`;
  if (hour.startsWith("*/") && min === "0" && dom === "*" && month === "*" && dow === "*")
    return `Every ${hour.slice(2)} hour(s) at minute 0`;

  const pieces: string[] = [];
  if (min !== "*" && hour !== "*") {
    pieces.push(`At ${describeField(hour, "hour")}:${min.padStart(2, "0")}`);
  } else if (min !== "*") {
    pieces.push(`At minute ${describeField(min, "minute")}`);
  } else if (hour !== "*") {
    pieces.push(`Every minute of hour ${describeField(hour, "hour")}`);
  }
  if (dom !== "*") pieces.push(`on day ${describeField(dom, "day")} of the month`);
  if (month !== "*") pieces.push(`in ${describeField(month, "month")}`);
  if (dow !== "*") pieces.push(`on ${describeField(dow, "weekday")}`);

  return pieces.length > 0 ? pieces.join(", ") : "Every minute";
}

function matchesField(value: number, expr: string): boolean {
  if (expr === "*") return true;
  if (expr.startsWith("*/")) return value % parseInt(expr.slice(2)) === 0;
  if (expr.includes(",")) return expr.split(",").map(Number).includes(value);
  if (expr.includes("-")) {
    const [a, b] = expr.split("-").map(Number);
    return value >= a && value <= b;
  }
  return value === parseInt(expr);
}

function getNextRuns(expr: string, count: number): string[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;

  const results: string[] = [];
  const check = new Date();
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  let safety = 0;
  while (results.length < count && safety < 525600) {
    const min = check.getMinutes();
    const hour = check.getHours();
    const dom = check.getDate();
    const month = check.getMonth() + 1;
    const dow = check.getDay();

    if (
      matchesField(min, minExpr) &&
      matchesField(hour, hourExpr) &&
      matchesField(dom, domExpr) &&
      matchesField(month, monthExpr) &&
      matchesField(dow, dowExpr)
    ) {
      results.push(check.toISOString());
    }
    check.setMinutes(check.getMinutes() + 1);
    safety++;
  }

  return results;
}

export function registerCronParser(server: McpServer) {
  server.tool(
    "parse_cron",
    "Parse a cron expression, describe it in plain English, and show next scheduled run times",
    {
      expression: z
        .string()
        .describe("Cron expression with 5 fields: minute hour day month weekday (e.g. '*/5 * * * *')"),
      next_runs: z
        .number()
        .optional()
        .default(5)
        .describe("Number of upcoming run times to calculate (default 5)"),
    },
    async ({ expression, next_runs }) => {
      const description = describeCron(expression);
      const parts = expression.trim().split(/\s+/);
      const valid = parts.length === 5;
      const nextTimes = valid ? getNextRuns(expression, Math.min(next_runs, 20)) : [];

      const result = {
        expression,
        description,
        valid,
        fields: valid
          ? {
              minute: parts[0],
              hour: parts[1],
              day_of_month: parts[2],
              month: parts[3],
              day_of_week: parts[4],
            }
          : null,
        next_runs: nextTimes,
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
