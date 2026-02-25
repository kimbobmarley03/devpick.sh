"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const PRESETS = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day at midnight", expr: "0 0 * * *" },
  { label: "Every day at 9 AM", expr: "0 9 * * *" },
  { label: "Every Monday at 9 AM", expr: "0 9 * * 1" },
  { label: "Every weekday at 9 AM", expr: "0 9 * * 1-5" },
  { label: "1st of every month", expr: "0 0 1 * *" },
  { label: "Every Sunday at 6 PM", expr: "0 18 * * 0" },
  { label: "Twice a day (9AM, 6PM)", expr: "0 9,18 * * *" },
  { label: "Every 15 minutes", expr: "*/15 * * * *" },
  { label: "Every year (Jan 1)", expr: "0 0 1 1 *" },
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function describeField(value: string, type: "minute" | "hour" | "day" | "month" | "weekday"): string {
  if (value === "*") return `every ${type}`;
  if (value.startsWith("*/")) return `every ${value.slice(2)} ${type}${parseInt(value.slice(2)) > 1 ? "s" : ""}`;
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
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  }
  return value;
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (need 5 fields)";

  const [min, hour, dom, month, dow] = parts;

  // Common patterns
  if (expr === "* * * * *") return "Every minute";
  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*")
    return `Every ${min.slice(2)} minutes`;
  if (hour.startsWith("*/") && min === "0" && dom === "*" && month === "*" && dow === "*")
    return `Every ${hour.slice(2)} hours`;

  const pieces: string[] = [];

  if (min !== "*" && hour !== "*") {
    pieces.push(`At ${describeField(hour, "hour")}:${min.padStart(2, "0")}`);
  } else if (min !== "*") {
    pieces.push(`At minute ${describeField(min, "minute")}`);
  } else if (hour !== "*") {
    pieces.push(`Every minute during hour ${describeField(hour, "hour")}`);
  }

  if (dom !== "*") pieces.push(`on day ${describeField(dom, "day")} of the month`);
  if (month !== "*") pieces.push(`in ${describeField(month, "month")}`);
  if (dow !== "*") pieces.push(`on ${describeField(dow, "weekday")}`);

  return pieces.length > 0 ? pieces.join(", ") : "Every minute";
}

function getNextRuns(expr: string, count: number = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const results: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const matchesField = (value: number, expr: string): boolean => {
    if (expr === "*") return true;
    if (expr.startsWith("*/")) return value % parseInt(expr.slice(2)) === 0;
    if (expr.includes(",")) return expr.split(",").map(Number).includes(value);
    if (expr.includes("-")) {
      const [a, b] = expr.split("-").map(Number);
      return value >= a && value <= b;
    }
    return value === parseInt(expr);
  };

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
      results.push(new Date(check));
    }
    check.setMinutes(check.getMinutes() + 1);
    safety++;
  }

  return results;
}

function FieldEditor({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-[#555] font-mono uppercase tracking-wider">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tool-textarea text-center font-mono"
        style={{ height: "36px", padding: "6px 8px", resize: "none", fontSize: "14px" }}
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              value === o.value
                ? "bg-[#1e2433] border-blue-500/40 text-blue-400"
                : "bg-[#141414] border-[#222] text-[#666] hover:text-[#888] hover:border-[#333]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CronTool() {
  useWebMCP({
    name: "parseCron",
    description: "Parse and explain cron expressions",
    inputSchema: {
      type: "object" as const,
      properties: {
      "expression": {
            "type": "string",
            "description": "Cron expression (e.g. */5 * * * *)"
      }
},
      required: ["expression"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Cron: " + (params.expression as string) }] };
    },
  });

  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("9");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [manualInput, setManualInput] = useState("");

  const expression = manualInput || `${minute} ${hour} ${dom} ${month} ${dow}`;
  const description = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression), [expression]);

  const applyPreset = (expr: string) => {
    setManualInput("");
    const [m, h, d, mo, dw] = expr.split(" ");
    setMinute(m);
    setHour(h);
    setDom(d);
    setMonth(mo);
    setDow(dw);
  };

  const applyManual = (val: string) => {
    setManualInput(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDom(parts[2]);
      setMonth(parts[3]);
      setDow(parts[4]);
      setManualInput("");
    }
  };

  return (
    <ToolLayout agentReady
      title="Cron Expression Generator"
      description="Build, explain, and test cron schedule expressions"
    >
      {/* Expression display */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-xl text-[#e5e5e5] tracking-widest">{expression}</div>
          <CopyButton text={expression} />
        </div>
        <div className="text-sm text-blue-400">{description}</div>
      </div>

      {/* Manual input */}
      <div className="mb-4">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => applyManual(e.target.value)}
          placeholder="Or type a cron expression directly (e.g. */5 * * * *)"
          className="tool-textarea"
          style={{ height: "40px", padding: "8px 12px", resize: "none" }}
          spellCheck={false}
        />
      </div>

      {/* Visual editor */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <FieldEditor
          label="Minute"
          value={minute}
          onChange={(v) => { setMinute(v); setManualInput(""); }}
          options={[
            { value: "*", label: "Every" },
            { value: "0", label: ":00" },
            { value: "*/5", label: "*/5" },
            { value: "*/15", label: "*/15" },
            { value: "*/30", label: "*/30" },
          ]}
        />
        <FieldEditor
          label="Hour"
          value={hour}
          onChange={(v) => { setHour(v); setManualInput(""); }}
          options={[
            { value: "*", label: "Every" },
            { value: "0", label: "0 (12AM)" },
            { value: "9", label: "9 (9AM)" },
            { value: "12", label: "12 (noon)" },
            { value: "18", label: "18 (6PM)" },
          ]}
        />
        <FieldEditor
          label="Day (month)"
          value={dom}
          onChange={(v) => { setDom(v); setManualInput(""); }}
          options={[
            { value: "*", label: "Every" },
            { value: "1", label: "1st" },
            { value: "15", label: "15th" },
            { value: "1,15", label: "1,15" },
          ]}
        />
        <FieldEditor
          label="Month"
          value={month}
          onChange={(v) => { setMonth(v); setManualInput(""); }}
          options={[
            { value: "*", label: "Every" },
            { value: "1", label: "Jan" },
            { value: "1,7", label: "Jan,Jul" },
            { value: "1-6", label: "Jan-Jun" },
          ]}
        />
        <FieldEditor
          label="Day (week)"
          value={dow}
          onChange={(v) => { setDow(v); setManualInput(""); }}
          options={[
            { value: "*", label: "Every" },
            { value: "1-5", label: "Weekdays" },
            { value: "0,6", label: "Weekend" },
            { value: "1", label: "Mon" },
            { value: "5", label: "Fri" },
          ]}
        />
      </div>

      {/* Presets */}
      <div className="mb-6">
        <div className="text-xs text-[#555] font-mono uppercase tracking-wider mb-2">Common Schedules</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(({ label, expr }) => (
            <button
              key={expr}
              onClick={() => applyPreset(expr)}
              className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                expression === expr
                  ? "bg-[#1e2433] border-blue-500/40 text-blue-400"
                  : "bg-[#141414] border-[#222] text-[#888] hover:text-[#e5e5e5] hover:border-[#333]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Next runs */}
      {nextRuns.length > 0 && (
        <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1a1a1a] text-xs text-[#555] font-mono uppercase tracking-wider">
            Next {nextRuns.length} Runs
          </div>
          {nextRuns.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="text-xs text-[#555] font-mono min-w-[24px]">#{i + 1}</span>
              <span className="font-mono text-sm text-[#e5e5e5]">
                {d.toLocaleString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              <span className="text-xs text-[#555]">
                {(() => {
                  const diff = d.getTime() - Date.now();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) return `in ${mins}m`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
                  const days = Math.floor(hrs / 24);
                  return `in ${days}d ${hrs % 24}h`;
                })()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cheatsheet */}
      <details className="mt-6">
        <summary className="text-sm text-[#555] cursor-pointer hover:text-[#888] transition-colors">
          Cron Syntax Reference
        </summary>
        <div className="mt-3 font-mono text-xs text-[#888] bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <pre>{`┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *

*     = every value
*/n   = every n intervals
n     = specific value
n,m   = multiple values
n-m   = range of values`}</pre>
        </div>
      </details>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Timestamp", href: "/unix-timestamp-converter" },
            { name: "Timezone Converter", href: "/timezone" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Regex Tester", href: "/regex" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
