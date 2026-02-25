"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Search } from "lucide-react";

// ── ASCII data ────────────────────────────────────────────────────────────────

interface AsciiEntry {
  dec: number;
  hex: string;
  oct: string;
  char: string;
  desc: string;
  control: boolean;
}

const CONTROL_NAMES = [
  "NUL","SOH","STX","ETX","EOT","ENQ","ACK","BEL",
  "BS","HT","LF","VT","FF","CR","SO","SI",
  "DLE","DC1","DC2","DC3","DC4","NAK","SYN","ETB",
  "CAN","EM","SUB","ESC","FS","GS","RS","US",
];

const CONTROL_DESCS = [
  "Null","Start of Heading","Start of Text","End of Text",
  "End of Transmission","Enquiry","Acknowledge","Bell",
  "Backspace","Horizontal Tab","Line Feed","Vertical Tab",
  "Form Feed","Carriage Return","Shift Out","Shift In",
  "Data Link Escape","Device Control 1","Device Control 2","Device Control 3",
  "Device Control 4","Negative Acknowledge","Synchronous Idle","End of Trans Block",
  "Cancel","End of Medium","Substitute","Escape",
  "File Separator","Group Separator","Record Separator","Unit Separator",
];

function buildAscii(): AsciiEntry[] {
  const entries: AsciiEntry[] = [];
  for (let i = 0; i <= 127; i++) {
    let char = "";
    let desc = "";
    let control = false;
    if (i < 32) {
      char = CONTROL_NAMES[i];
      desc = CONTROL_DESCS[i];
      control = true;
    } else if (i === 32) {
      char = "SP";
      desc = "Space";
      control = true;
    } else if (i === 127) {
      char = "DEL";
      desc = "Delete";
      control = true;
    } else {
      char = String.fromCharCode(i);
      desc = char;
    }
    entries.push({
      dec: i,
      hex: "0x" + i.toString(16).toUpperCase().padStart(2, "0"),
      oct: "0" + i.toString(8).padStart(3, "0"),
      char,
      desc,
      control,
    });
  }
  return entries;
}

const ASCII_TABLE = buildAscii();

// ── Component ─────────────────────────────────────────────────────────────────

export function AsciiTool() {
  useWebMCP({
    name: "generateAsciiArt",
    description: "Convert text to ASCII art",
    inputSchema: {
      type: "object" as const,
      properties: {
      "text": {
            "type": "string",
            "description": "Text to convert"
      }
},
      required: ["text"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for ASCII art" }] };
    },
  });

  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = query.trim()
    ? ASCII_TABLE.filter((e) => {
        const q = query.trim().toLowerCase();
        return (
          e.dec.toString().includes(q) ||
          e.hex.toLowerCase().includes(q) ||
          e.oct.includes(q) ||
          e.char.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q)
        );
      })
    : ASCII_TABLE;

  const copyVal = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(val);
      setTimeout(() => setCopied(null), 1200);
    } catch { /* noop */ }
  };

  return (
    <ToolLayout agentReady
      title="ASCII Table"
      description="Full ASCII character set (0–127) — click any cell to copy"
    >
      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dimmed" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by character, decimal, hex, or description…"
          className="tool-textarea w-full pl-9"
          style={{ height: "40px", resize: "none" }}
        />
      </div>

      <p className="text-xs text-text-dimmed font-mono mb-3">
        {filtered.length} / 128 entries
        {" · "}
        <span className="text-blue-400">blue</span> = control chars
      </p>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-card-border bg-output-bg">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-card-border">
              {["Dec", "Hex", "Oct", "Char", "Description"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-text-dimmed uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.dec}
                className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors"
              >
                <CopyCell value={String(e.dec)} onCopy={copyVal} copied={copied} />
                <CopyCell value={e.hex} onCopy={copyVal} copied={copied} className="text-[#f59e0b]" />
                <CopyCell value={e.oct} onCopy={copyVal} copied={copied} className="text-[#10b981]" />
                <CopyCell
                  value={e.char}
                  onCopy={copyVal}
                  copied={copied}
                  className={e.control ? "text-blue-400" : "text-text-primary"}
                />
                <td className="px-3 py-2 text-text-dimmed">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {copied && (
        <div className="fixed bottom-6 right-6 bg-surface-subtle border border-border-strong rounded-lg px-4 py-2 text-sm font-mono text-green-400 shadow-lg">
          Copied: {copied}
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Number Base Converter", href: "/base" },
            { name: "Text to Binary", href: "/text-to-binary" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Escape / Unescape", href: "/escape" },
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

function CopyCell({
  value,
  onCopy,
  copied,
  className = "text-text-primary",
}: {
  value: string;
  onCopy: (v: string) => void;
  copied: string | null;
  className?: string;
}) {
  const isCopied = copied === value;
  return (
    <td
      className={`px-3 py-2 cursor-pointer select-none transition-colors ${className} ${
        isCopied ? "bg-green-900/20" : "hover:bg-[#252525]"
      }`}
      onClick={() => onCopy(value)}
      title={`Click to copy "${value}"`}
    >
      {isCopied ? "✓" : value}
    </td>
  );
}
