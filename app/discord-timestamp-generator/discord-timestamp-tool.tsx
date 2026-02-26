"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton, copyToClipboard } from "@/components/copy-button";
import { Check } from "lucide-react";

const FORMATS = [
  { code: "t", label: "Short Time", example: "9:41 AM" },
  { code: "T", label: "Long Time", example: "9:41:30 AM" },
  { code: "d", label: "Short Date", example: "30/06/2021" },
  { code: "D", label: "Long Date", example: "30 June 2021" },
  { code: "f", label: "Short Date/Time", example: "30 June 2021 9:41 AM" },
  { code: "F", label: "Long Date/Time", example: "Wednesday, 30 June 2021 9:41 AM" },
  { code: "R", label: "Relative Time", example: "2 months ago" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function toEpoch(dateStr: string, timeStr: string): number {
  const dt = new Date(`${dateStr}T${timeStr}`);
  return Math.floor(dt.getTime() / 1000);
}

function formatPreview(epoch: number, code: string): string {
  const d = new Date(epoch * 1000);
  switch (code) {
    case "t":
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    case "T":
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    case "d":
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
    case "D":
      return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    case "f":
      return d.toLocaleString(undefined, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    case "F":
      return d.toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    case "R": {
      const diff = epoch - Math.floor(Date.now() / 1000);
      const abs = Math.abs(diff);
      if (abs < 60) return diff < 0 ? "just now" : "in a few seconds";
      if (abs < 3600) return diff < 0 ? `${Math.floor(abs / 60)} minutes ago` : `in ${Math.floor(abs / 60)} minutes`;
      if (abs < 86400) return diff < 0 ? `${Math.floor(abs / 3600)} hours ago` : `in ${Math.floor(abs / 3600)} hours`;
      return diff < 0 ? `${Math.floor(abs / 86400)} days ago` : `in ${Math.floor(abs / 86400)} days`;
    }
    default:
      return d.toLocaleString();
  }
}

export function DiscordTimestampTool() {
  useWebMCP({
    name: "discordTimestamp",
    description: "Generate Discord timestamp formats from a date/time",
    inputSchema: {
      type: "object" as const,
      properties: {
        epoch: { type: "number", description: "Unix epoch timestamp" },
      },
      required: [],
    },
    execute: async (params) => {
      const epoch = (params.epoch as number) || Math.floor(Date.now() / 1000);
      const results = FORMATS.map((f) => `${f.label}: <t:${epoch}:${f.code}>`).join("\n");
      return { content: [{ type: "text", text: results }] };
    },
  });

  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const epoch = (() => {
    try {
      return toEpoch(date, time);
    } catch {
      return 0;
    }
  })();
  const isValid = !isNaN(epoch);

  const handleCopy = async (code: string, text: string) => {
    await copyToClipboard(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleNow = () => {
    const n = new Date();
    setDate(`${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`);
    setTime(`${pad(n.getHours())}:${pad(n.getMinutes())}`);
  };

  return (
    <ToolLayout
      agentReady
      title="Discord Timestamp Generator"
      description="Generate Discord timestamp tags that display correctly in every user's local timezone. Pick a date & time → get all formats."
    >
      {/* Date/Time Picker */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
          </div>
          <button onClick={handleNow} className="action-btn">
            Now
          </button>
          <div className="ml-auto flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Epoch</label>
            <div className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-muted font-mono min-w-[130px]">
              {isValid ? epoch : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Format Table */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-0 text-xs text-text-muted font-mono uppercase px-4 py-2 border-b border-border-subtle bg-surface-subtle">
          <div className="w-8">Code</div>
          <div className="px-4">Label</div>
          <div className="px-4">Preview</div>
          <div className="w-24 text-right">Copy</div>
        </div>
        {FORMATS.map((fmt) => {
          const tag = `<t:${epoch}:${fmt.code}>`;
          const preview = isValid ? formatPreview(epoch, fmt.code) : "—";
          const isCopied = copiedCode === fmt.code;
          return (
            <div
              key={fmt.code}
              className="grid grid-cols-[auto_1fr_1fr_auto] gap-0 px-4 py-3.5 border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors items-center"
            >
              <div className="w-8">
                <span className="font-mono text-xs bg-[var(--dp-bg-subtle)] border border-border-subtle rounded px-1.5 py-0.5 text-accent">
                  :{fmt.code}
                </span>
              </div>
              <div className="px-4">
                <div className="text-sm text-text-secondary">{fmt.label}</div>
              </div>
              <div className="px-4">
                <div className="text-sm text-text-primary font-mono">{preview}</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{tag}</div>
              </div>
              <div className="w-24 flex justify-end">
                <button
                  onClick={() => handleCopy(fmt.code, tag)}
                  className="action-btn text-xs py-1 px-2.5 min-w-[70px] flex items-center gap-1 justify-center"
                >
                  {isCopied ? (
                    <>
                      <Check size={11} className="text-success" />
                      <span className="text-success">Copied</span>
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Copy */}
      <div className="mt-4 flex justify-end">
        <CopyButton
          text={FORMATS.map((f) => `<t:${epoch}:${f.code}>`).join("\n")}
          label="Copy All Formats"
        />
      </div>

      <div className="mt-6 p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted leading-relaxed">
        <strong className="text-text-secondary">How Discord timestamps work:</strong> Discord renders{" "}
        <code className="font-mono text-accent text-[11px]">&lt;t:EPOCH:FORMAT&gt;</code> tags in every user&apos;s local
        timezone. The epoch is seconds since Jan 1, 1970 UTC. Copy any tag above and paste it directly into Discord.
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Unix Timestamp Converter", href: "/unix-timestamp-converter" },
            { name: "Timezone Converter", href: "/timezone" },
            { name: "Cron Generator", href: "/cron" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
