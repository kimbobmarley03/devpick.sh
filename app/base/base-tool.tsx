"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const COMMON_BASES = [
  { base: 2, label: "Binary", prefix: "0b" },
  { base: 8, label: "Octal", prefix: "0o" },
  { base: 10, label: "Decimal", prefix: "" },
  { base: 16, label: "Hexadecimal", prefix: "0x" },
];

function convertFromBase(input: string, fromBase: number): bigint | null {
  const s = input.trim().replace(/[\s_]/g, "");
  if (s === "" || s === "-") return null;

  const negative = s.startsWith("-");
  const digits = negative ? s.slice(1) : s;
  if (digits === "") return null;

  const validChars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, fromBase);
  if (!digits.toLowerCase().split("").every((c) => validChars.includes(c))) return null;

  // Manual conversion using BigInt() constructor (no bigint literals for ES2017 compat)
  try {
    let value = BigInt(0);
    const base = BigInt(fromBase);
    for (const ch of digits.toLowerCase()) {
      value = value * base + BigInt(validChars.indexOf(ch));
    }
    return negative ? -value : value;
  } catch {
    return null;
  }
}

function convertToBase(value: bigint, toBase: number): string {
  if (toBase === 10) return value.toString(10);
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const base = BigInt(toBase);
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  let n = abs;
  if (n === BigInt(0)) return "0";
  while (n > BigInt(0)) {
    result = chars[Number(n % base)] + result;
    n = n / base;
  }
  return (negative ? "-" : "") + result;
}

export function BaseTool() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [customBase, setCustomBase] = useState(32);
  const [showCustom, setShowCustom] = useState(false);

  const parsed = convertFromBase(input, fromBase);
  const isValid = input.trim() === "" ? null : parsed !== null;

  const getResult = (toBase: number): string => {
    if (parsed === null) return "";
    return convertToBase(parsed, toBase);
  };

  const allBases = [
    ...COMMON_BASES,
    ...(showCustom ? [{ base: customBase, label: `Base ${customBase}`, prefix: "" }] : []),
  ];

  const baseButtons = [2, 8, 10, 16];

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert numbers between binary, octal, decimal, hex, and any base 2–36 in real-time"
    >
      {/* Input row */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Input Base:</span>
          {baseButtons.map((b) => (
            <button
              key={b}
              onClick={() => { setFromBase(b); setShowCustom(false); }}
              className={`tab-btn ${fromBase === b && !showCustom ? "active" : ""}`}
            >
              {b === 2 ? "Binary (2)" : b === 8 ? "Octal (8)" : b === 10 ? "Decimal (10)" : "Hex (16)"}
            </button>
          ))}
          <button
            onClick={() => { setShowCustom(true); setFromBase(customBase); }}
            className={`tab-btn ${showCustom ? "active" : ""}`}
          >
            Custom
          </button>
          {showCustom && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-dimmed font-mono">Base:</span>
              <input
                type="number"
                min={2}
                max={36}
                value={customBase}
                onChange={(e) => {
                  const b = Math.min(36, Math.max(2, parseInt(e.target.value) || 2));
                  setCustomBase(b);
                  setFromBase(b);
                }}
                className="tool-textarea text-center"
                style={{ width: "64px", height: "34px", padding: "6px 8px", resize: "none" }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter base-${fromBase} number...`}
            className="tool-textarea flex-1 font-mono text-lg"
            style={{ height: "52px", resize: "none", padding: "12px 16px" }}
            spellCheck={false}
          />
          {input && (
            <button onClick={() => setInput("")} className="action-btn">
              Clear
            </button>
          )}
        </div>

        {input && !isValid && (
          <p className="text-xs text-red-400 mt-2 font-mono">
            ⚠ Invalid base-{fromBase} number
          </p>
        )}
      </div>

      {/* Results grid */}
      {parsed !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allBases.map(({ base, label, prefix }) => {
            const result = getResult(base);
            const isCurrent = base === fromBase;
            return (
              <div
                key={base}
                className={`bg-card-bg border rounded-xl p-4 transition-colors ${
                  isCurrent ? "border-border-strong" : "border-card-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
                      {label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-[#3b82f6] font-mono bg-[#1e3a5f] px-1.5 py-0.5 rounded">
                        input
                      </span>
                    )}
                  </div>
                  <CopyButton text={prefix + result} />
                </div>
                <div className="font-mono text-text-primary text-sm break-all leading-relaxed">
                  {prefix && <span className="text-text-dimmed">{prefix}</span>}
                  {result || "0"}
                </div>
                {base === 16 && (
                  <div className="font-mono text-text-primary text-sm mt-1 break-all">
                    <span className="text-text-dimmed text-xs mr-1">upper:</span>
                    {(prefix + result).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {!showCustom && (
            <button
              onClick={() => { setShowCustom(true); setFromBase(customBase); }}
              className="bg-card-bg border border-dashed border-border-subtle rounded-xl p-4 text-text-muted hover:text-text-dimmed hover:border-border-strong transition-colors text-sm font-mono text-left"
            >
              + Add custom base (2–36)
            </button>
          )}
        </div>
      )}

      {!input && (
        <div className="text-center py-16 text-text-ghost font-mono text-sm">
          Enter a number above to see all base conversions
        </div>
      )}

      <p className="text-xs text-text-muted mt-4 font-mono text-right">
        Powered by BigInt — handles arbitrarily large integers
      </p>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "ASCII Table", href: "/ascii-art-generator" },
            { name: "Text to Binary", href: "/text-to-binary" },
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
