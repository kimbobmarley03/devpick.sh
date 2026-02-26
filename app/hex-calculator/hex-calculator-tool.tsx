"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Op = "+" | "-" | "*" | "/" | "AND" | "OR" | "XOR" | "SHL" | "SHR";
type UnaryOp = "NOT" | "NEG" | "REV";

const BINARY_OPS: { op: Op; label: string; desc: string }[] = [
  { op: "+", label: "+", desc: "Add" },
  { op: "-", label: "−", desc: "Subtract" },
  { op: "*", label: "×", desc: "Multiply" },
  { op: "/", label: "÷", desc: "Divide" },
  { op: "AND", label: "AND", desc: "Bitwise AND" },
  { op: "OR", label: "OR", desc: "Bitwise OR" },
  { op: "XOR", label: "XOR", desc: "Bitwise XOR" },
  { op: "SHL", label: "<<", desc: "Shift Left" },
  { op: "SHR", label: ">>", desc: "Shift Right" },
];

const UNARY_OPS: { op: UnaryOp; label: string; desc: string }[] = [
  { op: "NOT", label: "NOT", desc: "Bitwise NOT (32-bit)" },
  { op: "NEG", label: "NEG", desc: "Negate (two's complement)" },
  { op: "REV", label: "REV", desc: "Reverse bytes (32-bit)" },
];

function hexToNum(hex: string): bigint {
  const clean = hex.replace(/\s+/g, "").toLowerCase().replace(/^0x/, "");
  if (!clean) throw new Error("Empty input");
  if (!/^[0-9a-f]+$/.test(clean)) throw new Error(`Invalid hex: ${hex}`);
  return BigInt("0x" + clean);
}

function numToHex(n: bigint): string {
  if (n < 0n) {
    // Show as two's complement 64-bit
    n = n & 0xFFFFFFFFFFFFFFFFn;
  }
  return n.toString(16).toUpperCase().padStart(
    Math.max(2, Math.ceil(n.toString(16).length / 2) * 2), "0"
  );
}

function numToBin(n: bigint): string {
  if (n < 0n) n = n & 0xFFFFFFFFFFFFFFFFn;
  return n.toString(2).padStart(Math.max(8, Math.ceil(n.toString(2).length / 8) * 8), "0");
}

interface CalcResult {
  hex: string;
  decimal: string;
  binary: string;
  expression: string;
}

function calculate(a: string, op: Op, b: string): CalcResult {
  const aNum = hexToNum(a);
  const bNum = hexToNum(b);

  let result: bigint;
  switch (op) {
    case "+": result = aNum + bNum; break;
    case "-": result = aNum - bNum; break;
    case "*": result = aNum * bNum; break;
    case "/":
      if (bNum === 0n) throw new Error("Division by zero");
      result = aNum / bNum;
      break;
    case "AND": result = aNum & bNum; break;
    case "OR": result = aNum | bNum; break;
    case "XOR": result = aNum ^ bNum; break;
    case "SHL": result = aNum << bNum; break;
    case "SHR": result = aNum >> bNum; break;
  }

  const hex = numToHex(result < 0n ? result & 0xFFFFFFFFFFFFFFFFn : result);
  return {
    hex: "0x" + hex,
    decimal: result.toString(),
    binary: numToBin(result < 0n ? result & 0xFFFFFFFFFFFFFFFFn : result),
    expression: `0x${numToHex(aNum)} ${op} 0x${numToHex(bNum)}`,
  };
}

function calculateUnary(a: string, op: UnaryOp): CalcResult {
  const aNum = hexToNum(a);
  let result: bigint;
  const MASK32 = 0xFFFFFFFFn;
  switch (op) {
    case "NOT": result = (~aNum) & MASK32; break;
    case "NEG": result = (-aNum) & MASK32; break;
    case "REV": {
      const masked = aNum & MASK32;
      const b0 = (masked >> 24n) & 0xFFn;
      const b1 = (masked >> 16n) & 0xFFn;
      const b2 = (masked >> 8n) & 0xFFn;
      const b3 = masked & 0xFFn;
      result = (b3 << 24n) | (b2 << 16n) | (b1 << 8n) | b0;
      break;
    }
  }
  const hex = numToHex(result);
  return {
    hex: "0x" + hex,
    decimal: result.toString(),
    binary: numToBin(result),
    expression: `${op}(0x${numToHex(aNum)})`,
  };
}

function HexInput({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const isValid = !value.trim() || /^(0x)?[0-9a-fA-F\s]+$/.test(value);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm pointer-events-none">0x</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "FF"}
          className={`w-full pl-8 pr-3 py-2 text-sm border rounded-lg bg-surface-raised text-text-primary font-mono focus:outline-none focus:ring-1 ${isValid ? "border-border-subtle focus:ring-accent" : "border-[var(--dp-error)] focus:ring-[var(--dp-error)]"}`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function ResultPanel({ result, error }: { result: CalcResult | null; error: string }) {
  if (error) {
    return (
      <div className="bg-card-bg border border-card-border rounded-xl p-4 text-sm text-[var(--dp-error)] font-mono">
        Error: {error}
      </div>
    );
  }
  if (!result) return null;
  return (
    <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-surface-subtle border-b border-border-subtle text-xs text-text-muted font-mono">
        {result.expression}
      </div>
      <div className="divide-y divide-border-subtle">
        {[
          { label: "Hex", value: result.hex, icon: "0x" },
          { label: "Decimal", value: result.decimal, icon: "10" },
          { label: "Binary", value: result.binary, icon: "2" },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-subtle transition-colors group">
            <span className="text-xs font-mono text-text-muted w-16">{row.label}</span>
            <span className="flex-1 font-mono text-sm text-text-primary break-all">{row.value}</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={row.value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HexCalculatorTool() {
  useWebMCP({
    name: "hexCalculate",
    description: "Perform hex arithmetic and bitwise operations",
    inputSchema: {
      type: "object" as const,
      properties: {
        a: { type: "string", description: "First hex operand (e.g. FF, 0x1A2B)" },
        op: { type: "string", description: "Operation: +, -, *, /, AND, OR, XOR, NOT, SHL, SHR" },
        b: { type: "string", description: "Second hex operand (required for binary ops)" },
      },
      required: ["a", "op"],
    },
    execute: async (params) => {
      try {
        const a = params.a as string;
        const op = (params.op as string).toUpperCase();
        const b = (params.b as string) || "";
        let result: CalcResult;
        if (["NOT", "NEG", "REV"].includes(op)) {
          result = calculateUnary(a, op as UnaryOp);
        } else {
          result = calculate(a, op as Op, b);
        }
        return { content: [{ type: "text", text: `Hex: ${result.hex}\nDecimal: ${result.decimal}\nBinary: ${result.binary}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Unknown") }] };
      }
    },
  });

  const [inputA, setInputA] = useState("FF");
  const [inputB, setInputB] = useState("0A");
  const [op, setOp] = useState<Op>("+");
  const [unaryOp, setUnaryOp] = useState<UnaryOp>("NOT");
  const [mode, setMode] = useState<"binary" | "unary">("binary");

  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");

  const compute = () => {
    try {
      if (mode === "binary") {
        setResult(calculate(inputA, op, inputB));
      } else {
        setResult(calculateUnary(inputA, unaryOp));
      }
      setError("");
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    }
  };

  // Live compute
  const tryCompute = () => {
    try {
      if (mode === "binary") {
        if (!inputA.trim() || !inputB.trim()) { setResult(null); setError(""); return; }
        setResult(calculate(inputA, op, inputB));
      } else {
        if (!inputA.trim()) { setResult(null); setError(""); return; }
        setResult(calculateUnary(inputA, unaryOp));
      }
      setError("");
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    }
  };

  return (
    <ToolLayout
      agentReady
      title="Hex Calculator"
      description="Hexadecimal arithmetic and bitwise operations. Input hex values → result in hex, decimal, and binary."
    >
      {/* Mode selector */}
      <div className="flex gap-1 mb-5">
        {(["binary", "unary"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setResult(null); setError(""); }}
            className={`tab-btn ${mode === m ? "active" : ""}`}
          >
            {m === "binary" ? "Binary Operations" : "Unary Operations"}
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-5">
        {mode === "binary" ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <HexInput label="Operand A" value={inputA} onChange={(v) => { setInputA(v); }} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Operator</label>
                <select
                  value={op}
                  onChange={(e) => setOp(e.target.value as Op)}
                  className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none"
                >
                  {BINARY_OPS.map((o) => (
                    <option key={o.op} value={o.op}>{o.label} ({o.desc})</option>
                  ))}
                </select>
              </div>
              <HexInput label="Operand B" value={inputB} onChange={(v) => { setInputB(v); }} />
            </div>
            {/* Op Shortcut Buttons */}
            <div className="flex flex-wrap gap-2">
              {BINARY_OPS.map((o) => (
                <button
                  key={o.op}
                  onClick={() => { setOp(o.op); }}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${op === o.op ? "bg-accent text-white border-accent" : "border-border-subtle hover:border-accent hover:text-accent"}`}
                  title={o.desc}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <HexInput label="Operand" value={inputA} onChange={(v) => { setInputA(v); }} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary font-mono uppercase tracking-wide">Operation</label>
                <select
                  value={unaryOp}
                  onChange={(e) => setUnaryOp(e.target.value as UnaryOp)}
                  className="px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none"
                >
                  {UNARY_OPS.map((o) => (
                    <option key={o.op} value={o.op}>{o.label} — {o.desc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              {UNARY_OPS.map((o) => (
                <button
                  key={o.op}
                  onClick={() => setUnaryOp(o.op)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${unaryOp === o.op ? "bg-accent text-white border-accent" : "border-border-subtle hover:border-accent hover:text-accent"}`}
                  title={o.desc}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { tryCompute(); compute(); }}
            className="action-btn primary"
          >
            Calculate
          </button>
          <button onClick={() => { setInputA(""); setInputB(""); setResult(null); setError(""); }} className="action-btn">
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      <ResultPanel result={result} error={error} />

      {/* Quick Reference */}
      <div className="mt-6 bg-surface-subtle border border-border-subtle rounded-xl p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs font-mono text-text-muted">
          <div>0xFF = 255 = 11111111₂</div>
          <div>0x0F & 0xFF = 0x0F</div>
          <div>0x0F | 0xF0 = 0xFF</div>
          <div>0xFF ^ 0x0F = 0xF0</div>
          <div>NOT(0x00) = 0xFFFFFFFF</div>
          <div>0x01 &lt;&lt; 4 = 0x10</div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Number Base Converter", href: "/base" },
            { name: "Text to Hex", href: "/text-to-hex" },
            { name: "Binary to Text", href: "/binary-to-text" },
            { name: "Bitwise Operations", href: "/base" },
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
