"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { RefreshCw } from "lucide-react";

const ALL_TIMEZONES = Intl.supportedValuesOf("timeZone");

const QUICK_ZONES = [
  { label: "UTC", value: "UTC" },
  { label: "EST", value: "America/New_York" },
  { label: "PST", value: "America/Los_Angeles" },
  { label: "JST", value: "Asia/Tokyo" },
  { label: "KST", value: "Asia/Seoul" },
  { label: "CET", value: "Europe/Paris" },
  { label: "IST", value: "Asia/Kolkata" },
];

function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getOffsetMinutes(tz: string, date: Date): number {
  const utcStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  const tzStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  const parseDate = (s: string) => {
    // en-CA format: YYYY-MM-DD, HH:MM:SS
    const [datePart, timePart] = s.split(", ");
    return new Date(`${datePart}T${timePart}Z`);
  };

  return (parseDate(tzStr).getTime() - parseDate(utcStr).getTime()) / 60000;
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}

export function TimezoneTool() {
  useWebMCP({
    name: "convertTimezone",
    description: "Convert time between timezones",
    inputSchema: {
      type: "object" as const,
      properties: {
      "time": {
            "type": "string",
            "description": "Time string"
      },
      "from": {
            "type": "string",
            "description": "Source timezone"
      },
      "to": {
            "type": "string",
            "description": "Target timezone"
      }
},
      required: ["time", "from", "to"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for timezone conversion" }] };
    },
  });

  const [sourceTz, setSourceTz] = useState("America/New_York");
  const [targetTz, setTargetTz] = useState("Asia/Seoul");
  const [now, setNow] = useState(new Date());
  const [manualInput, setManualInput] = useState("");
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!useManual) setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, [useManual]);

  const baseDate = (() => {
    if (useManual && manualInput) {
      const parsed = new Date(manualInput);
      return isNaN(parsed.getTime()) ? now : parsed;
    }
    return now;
  })();

  const sourceTime = formatTime(baseDate, sourceTz);
  const targetTime = formatTime(baseDate, targetTz);

  const srcOffset = (() => {
    try { return getOffsetMinutes(sourceTz, baseDate); } catch { return 0; }
  })();
  const tgtOffset = (() => {
    try { return getOffsetMinutes(targetTz, baseDate); } catch { return 0; }
  })();
  const diff = tgtOffset - srcOffset;
  const diffStr = diff === 0 ? "Same time" : `${diff >= 0 ? "+" : ""}${diff / 60}h difference`;

  const handleManual = (v: string) => {
    setManualInput(v);
    setUseManual(true);
  };

  const resetToNow = () => {
    setUseManual(false);
    setManualInput("");
    setNow(new Date());
  };

  return (
    <ToolLayout agentReady
      title="Timezone Converter"
      description="Convert time between any two IANA timezones"
    >
      {/* Quick buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs text-text-dimmed font-mono self-center">Quick:</span>
        {QUICK_ZONES.map((z) => (
          <button
            key={z.value}
            onClick={() => setSourceTz(z.value)}
            className={`tab-btn ${sourceTz === z.value ? "active" : ""}`}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* Timezone selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Source */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Source</div>
            <div className="flex gap-1 flex-wrap justify-end">
              {QUICK_ZONES.map((z) => (
                <button
                  key={z.value}
                  onClick={() => setSourceTz(z.value)}
                  className={`tab-btn text-[10px] py-0.5 px-2 ${sourceTz === z.value ? "active" : ""}`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
          <select
            value={sourceTz}
            onChange={(e) => setSourceTz(e.target.value)}
            className="tool-textarea w-full mb-3 cursor-pointer"
            style={{ height: "36px", padding: "6px 10px", resize: "none" }}
          >
            {ALL_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <div className="font-mono text-2xl text-text-primary mb-1">{sourceTime}</div>
          <div className="text-xs text-text-dimmed">{formatOffset(srcOffset)}</div>
        </div>

        {/* Target */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Target</div>
            <div className="flex gap-1 flex-wrap justify-end">
              {QUICK_ZONES.map((z) => (
                <button
                  key={z.value}
                  onClick={() => setTargetTz(z.value)}
                  className={`tab-btn text-[10px] py-0.5 px-2 ${targetTz === z.value ? "active" : ""}`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>
          <select
            value={targetTz}
            onChange={(e) => setTargetTz(e.target.value)}
            className="tool-textarea w-full mb-3 cursor-pointer"
            style={{ height: "36px", padding: "6px 10px", resize: "none" }}
          >
            {ALL_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <div className="font-mono text-2xl text-text-primary mb-1">{targetTime}</div>
          <div className="text-xs text-text-dimmed">{formatOffset(tgtOffset)}</div>
        </div>
      </div>

      {/* Offset difference */}
      <div className="bg-output-bg border border-border-subtle rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <span className="text-text-dimmed text-sm font-mono">Offset difference:</span>
        <span className="text-[#3b82f6] font-mono font-semibold">{diffStr}</span>
      </div>

      {/* Manual input */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-text-dimmed font-mono">Manual time (ISO / date string):</div>
        <input
          type="text"
          value={manualInput}
          onChange={(e) => handleManual(e.target.value)}
          placeholder="e.g. 2024-06-15T09:00:00"
          className="tool-textarea flex-1"
          style={{ height: "36px", padding: "6px 12px", resize: "none", minWidth: "200px" }}
        />
        <button onClick={resetToNow} className="action-btn">
          <RefreshCw size={13} />
          Live
        </button>
        <CopyButton text={`${sourceTz}: ${sourceTime} → ${targetTz}: ${targetTime}`} label="Copy Result" />
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Timestamp", href: "/unix-timestamp-converter" },
            { name: "Cron Generator", href: "/cron" },
            { name: "UUID Generator", href: "/uuid-generator" },
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
