"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return "—";
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

const ONES = ["","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen",
  "eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

function toWords(n: number): string {
  if (isNaN(n)) return "—";
  if (n === 0) return "zero";
  const negative = n < 0;
  let abs = Math.abs(Math.floor(n));
  if (abs > 999999999999) return "number too large";

  function chunk(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ONES[num];
    if (num < 100) return TENS[Math.floor(num / 10)] + (num % 10 ? "-" + ONES[num % 10] : "");
    return ONES[Math.floor(num / 100)] + " hundred" + (num % 100 ? " " + chunk(num % 100) : "");
  }

  const parts: string[] = [];
  if (abs >= 1000000000) {
    parts.push(chunk(Math.floor(abs / 1000000000)) + " billion");
    abs %= 1000000000;
  }
  if (abs >= 1000000) {
    parts.push(chunk(Math.floor(abs / 1000000)) + " million");
    abs %= 1000000;
  }
  if (abs >= 1000) {
    parts.push(chunk(Math.floor(abs / 1000)) + " thousand");
    abs %= 1000;
  }
  if (abs > 0) parts.push(chunk(abs));

  // Handle decimal part
  const decStr = String(Math.abs(n)).split(".")[1];
  let result = (negative ? "negative " : "") + parts.join(", ");
  if (decStr) {
    const decimals = decStr.split("").map((d) => ONES[parseInt(d)]).join("-");
    result += " point " + decimals;
  }
  return result;
}

function toFileSize(n: number): string {
  if (n < 0) return "—";
  const units = ["B","KB","MB","GB","TB","PB"];
  let i = 0;
  let size = Math.abs(n);
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface FormatRow {
  label: string;
  value: string;
}

function formatRows(raw: string): FormatRow[] {
  const n = parseFloat(raw.replace(/,/g, ""));
  if (isNaN(n)) return [];

  const intN = Math.trunc(n);
  const rows: FormatRow[] = [];

  const fmt = (opts: Intl.NumberFormatOptions, val = n) =>
    new Intl.NumberFormat("en-US", opts).format(val);

  rows.push({ label: "With commas", value: fmt({ minimumFractionDigits: 0, maximumFractionDigits: 10 }) });
  rows.push({ label: "Currency (USD)", value: fmt({ style: "currency", currency: "USD" }) });
  rows.push({ label: "Percentage", value: fmt({ style: "percent", minimumFractionDigits: 2 }) });
  rows.push({ label: "Scientific", value: n.toExponential(4) });
  rows.push({ label: "Fixed (2 decimals)", value: fmt({ minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
  rows.push({ label: "In words", value: toWords(n) });

  // Integer-only formats
  rows.push({ label: "Binary", value: intN >= 0 ? intN.toString(2) : "—" });
  rows.push({ label: "Octal", value: intN >= 0 ? "0o" + intN.toString(8) : "—" });
  rows.push({ label: "Hexadecimal", value: intN >= 0 ? "0x" + intN.toString(16).toUpperCase() : "—" });
  rows.push({ label: "Roman numerals", value: toRoman(intN) });
  rows.push({ label: "File size", value: toFileSize(n) });

  return rows;
}

export function NumberFormatTool() {
  const [input, setInput] = useState("1234567.89");

  const rows = formatRows(input);
  const isValid = rows.length > 0;

  return (
    <ToolLayout
      title="Number Formatter"
      description="Format a number as commas, currency, scientific, words, binary, hex, Roman numerals, and more"
    >
      {/* Input */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a number… e.g. 1234567.89"
          className="tool-textarea flex-1 font-mono text-lg"
          style={{ height: "48px", resize: "none" }}
          spellCheck={false}
        />
        <button onClick={() => setInput("")} className="action-btn">
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {!isValid && input.trim() && (
        <p className="text-sm text-red-400 font-mono mb-4">Invalid number</p>
      )}

      {/* Formatted rows */}
      {isValid && (
        <div className="space-y-2">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 bg-card-bg border border-card-border rounded-lg px-4 py-3 hover:bg-surface-subtle transition-colors group"
            >
              <span className="text-xs text-text-dimmed font-mono w-44 shrink-0">{label}</span>
              <span className="font-mono text-sm text-text-primary flex-1 truncate">{value}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <CopyButton text={value} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!input.trim() && (
        <div className="text-sm text-text-muted font-mono">
          Enter a number above to see all formats
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Number Base Converter", href: "/base" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Text to Binary", href: "/text-to-binary" },
            { name: "Timestamp", href: "/unix-timestamp-converter" },
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
