"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { RefreshCw } from "lucide-react";

export function TimestampTool() {
  useWebMCP({
    name: "convertTimestamp",
    description: "Convert between Unix timestamps and dates",
    inputSchema: {
      type: "object" as const,
      properties: {
      "input": {
            "type": "string",
            "description": "Unix timestamp (number) or date string"
      },
      "mode": {
            "type": "string",
            "description": "toDate or toTimestamp"
      }
},
      required: ["input"],
    },
    execute: async (params) => {
      const i = params.input as string; const n = Number(i); if (!isNaN(n) && n > 1e9) { return { content: [{ type: "text", text: new Date(n * 1000).toISOString() }] }; } else { return { content: [{ type: "text", text: String(Math.floor(new Date(i).getTime() / 1000)) }] }; }
    },
  });

  const [now, setNow] = useState<number>(0);
  const [unixInput, setUnixInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [unixResult, setUnixResult] = useState("");
  const [dateResult, setDateResult] = useState("");

  useEffect(() => {
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const convertUnixToDate = (val: string) => {
    setUnixInput(val);
    if (!val.trim()) { setDateResult(""); return; }
    const ts = parseInt(val.trim());
    if (isNaN(ts)) { setDateResult("Invalid timestamp"); return; }
    // Handle milliseconds
    const ms = val.trim().length >= 13 ? ts : ts * 1000;
    const d = new Date(ms);
    setDateResult(
      [
        d.toISOString(),
        d.toLocaleString(),
        `UTC: ${d.toUTCString()}`,
        `Relative: ${getRelative(ms)}`,
      ].join("\n")
    );
  };

  const convertDateToUnix = (val: string) => {
    setDateInput(val);
    if (!val.trim()) { setUnixResult(""); return; }
    const d = new Date(val.trim());
    if (isNaN(d.getTime())) { setUnixResult("Invalid date"); return; }
    setUnixResult(
      [
        `Unix (seconds): ${Math.floor(d.getTime() / 1000)}`,
        `Unix (ms): ${d.getTime()}`,
        `ISO: ${d.toISOString()}`,
      ].join("\n")
    );
  };

  const getRelative = (ms: number) => {
    const diff = Date.now() - ms;
    const abs = Math.abs(diff);
    const future = diff < 0;
    if (abs < 60000) return `${future ? "in" : ""} ${Math.round(abs / 1000)}s${!future ? " ago" : ""}`;
    if (abs < 3600000) return `${future ? "in" : ""} ${Math.round(abs / 60000)}m${!future ? " ago" : ""}`;
    if (abs < 86400000) return `${future ? "in" : ""} ${Math.round(abs / 3600000)}h${!future ? " ago" : ""}`;
    return `${future ? "in" : ""} ${Math.round(abs / 86400000)}d${!future ? " ago" : ""}`;
  };

  const nowDate = now > 0 ? new Date(now * 1000) : null;

  return (
    <ToolLayout agentReady
      title="Timestamp Converter"
      description="Convert between Unix timestamps and human-readable dates"
    >
      {/* Live clock */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={13} className="text-[#3b82f6] animate-spin" style={{ animationDuration: "2s" }} />
          <span className="text-xs text-text-dimmed uppercase tracking-wider font-mono">Current Time</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-text-dimmed mb-1">Unix (seconds)</div>
            <div className="font-mono text-xl text-text-primary">{now || "..."}</div>
          </div>
          <div>
            <div className="text-xs text-text-dimmed mb-1">Unix (milliseconds)</div>
            <div className="font-mono text-xl text-text-primary">{now ? now * 1000 : "..."}</div>
          </div>
          <div>
            <div className="text-xs text-text-dimmed mb-1">ISO 8601</div>
            <div className="font-mono text-sm text-text-primary break-all">
              {nowDate ? nowDate.toISOString() : "..."}
            </div>
          </div>
        </div>
      </div>

      {/* Converters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unix → Date */}
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Unix → Date</h2>
          <p className="text-xs text-text-dimmed mb-4">Enter a Unix timestamp (seconds or ms)</p>
          <input
            type="text"
            value={unixInput}
            onChange={(e) => convertUnixToDate(e.target.value)}
            placeholder="e.g. 1700000000"
            className="tool-textarea mb-3"
            style={{ height: "44px", resize: "none" }}
          />
          <div className="bg-output-bg border border-border-subtle rounded-lg p-3 min-h-[80px]">
            {dateResult ? (
              <pre className="font-mono text-[12px] text-text-primary whitespace-pre-wrap leading-relaxed">{dateResult}</pre>
            ) : (
              <span className="text-text-ghost font-mono text-[12px]">Result appears here...</span>
            )}
          </div>
          {dateResult && (
            <div className="mt-2 flex justify-end">
              <CopyButton text={dateResult} />
            </div>
          )}
        </div>

        {/* Date → Unix */}
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Date → Unix</h2>
          <p className="text-xs text-text-dimmed mb-4">Enter a date string (ISO, local, or any format)</p>
          <input
            type="text"
            value={dateInput}
            onChange={(e) => convertDateToUnix(e.target.value)}
            placeholder="e.g. 2024-01-15T10:30:00Z"
            className="tool-textarea mb-3"
            style={{ height: "44px", resize: "none" }}
          />
          <div className="bg-output-bg border border-border-subtle rounded-lg p-3 min-h-[80px]">
            {unixResult ? (
              <pre className="font-mono text-[12px] text-text-primary whitespace-pre-wrap leading-relaxed">{unixResult}</pre>
            ) : (
              <span className="text-text-ghost font-mono text-[12px]">Result appears here...</span>
            )}
          </div>
          {unixResult && (
            <div className="mt-2 flex justify-end">
              <CopyButton text={unixResult} />
            </div>
          )}
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Timezone Converter", href: "/timezone" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Cron Generator", href: "/cron" },
            { name: "Number Formatter", href: "/number-format" },
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
