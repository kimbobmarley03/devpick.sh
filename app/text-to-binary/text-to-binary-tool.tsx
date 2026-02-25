"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, ArrowLeftRight } from "lucide-react";

type Mode = "encode" | "decode";
type Format = "binary" | "hex" | "octal" | "decimal";

function textToBinary(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

function textToHex(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

function textToOctal(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(8).padStart(3, "0"))
    .join(" ");
}

function textToDecimal(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(10))
    .join(" ");
}

function binaryToText(bin: string): string {
  const parts = bin.trim().split(/\s+/);
  return parts.map((b) => String.fromCharCode(parseInt(b, 2))).join("");
}

function hexToText(hex: string): string {
  const parts = hex.trim().replace(/0x/gi, "").split(/[\s,]+/);
  return parts.map((h) => String.fromCharCode(parseInt(h, 16))).join("");
}

function octalToText(oct: string): string {
  const parts = oct.trim().split(/\s+/);
  return parts.map((o) => String.fromCharCode(parseInt(o, 8))).join("");
}

function decimalToText(dec: string): string {
  const parts = dec.trim().split(/[\s,]+/);
  return parts.map((d) => String.fromCharCode(parseInt(d, 10))).join("");
}

const FORMAT_LABELS: Record<Format, string> = {
  binary: "Binary (base 2)",
  hex: "Hex (base 16)",
  octal: "Octal (base 8)",
  decimal: "Decimal (base 10)",
};

const FORMAT_EXAMPLES: Record<Format, string> = {
  binary: "01001000 01101001",
  hex: "48 69",
  octal: "110 151",
  decimal: "72 105",
};

export function TextToBinaryTool() {
  useWebMCP({
    name: "textToBinary",
    description: "Convert text to binary representation",
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
      const result = Array.from(params.text as string).map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "); return { content: [{ type: "text", text: result }] };
    },
  });

  const [mode, setMode] = useState<Mode>("encode");
  const [format, setFormat] = useState<Format>("binary");
  const [input, setInput] = useState("Hello");

  const encode = (text: string, fmt: Format): string => {
    if (!text) return "";
    switch (fmt) {
      case "binary": return textToBinary(text);
      case "hex": return textToHex(text);
      case "octal": return textToOctal(text);
      case "decimal": return textToDecimal(text);
    }
  };

  const decode = (encoded: string, fmt: Format): string => {
    if (!encoded.trim()) return "";
    try {
      switch (fmt) {
        case "binary": return binaryToText(encoded);
        case "hex": return hexToText(encoded);
        case "octal": return octalToText(encoded);
        case "decimal": return decimalToText(encoded);
      }
    } catch {
      return "⚠ Invalid input — check format";
    }
  };

  const output = mode === "encode" ? encode(input, format) : decode(input, format);

  const swap = () => {
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  return (
    <ToolLayout agentReady
      title="Text to Binary"
      description="Convert text to binary, hex, octal, decimal — and back. Free, instant, client-side."
    >
      {/* Mode + Format */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
            >
              {m === "encode" ? "Text → Number" : "Number → Text"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`tab-btn ${format === f ? "active" : ""}`}
            >
              {f === "binary" ? "Binary" : f === "hex" ? "Hex" : f === "octal" ? "Octal" : "Decimal"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <button onClick={swap} className="action-btn" disabled={!output}>
            <ArrowLeftRight size={13} />
            Swap
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? "Text Input" : `${FORMAT_LABELS[format]} Input`}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Type or paste text here..."
                  : `Enter ${format} values, e.g. ${FORMAT_EXAMPLES[format]}`
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? `${FORMAT_LABELS[format]} Output` : "Text Output"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">Output will appear here...</span>
              )}
            </div>
          </div>
        }
      />

      {/* Quick reference */}
      {input && output && mode === "encode" && (
        <div className="mt-4 overflow-x-auto">
          <table className="text-xs font-mono w-full">
            <thead>
              <tr className="text-text-dimmed">
                <th className="text-left pr-4 py-1">Char</th>
                <th className="text-left pr-4 py-1">Dec</th>
                <th className="text-left pr-4 py-1">Hex</th>
                <th className="text-left pr-4 py-1">Oct</th>
                <th className="text-left pr-4 py-1">Bin</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(input.slice(0, 16)).map((ch, i) => {
                const code = ch.charCodeAt(0);
                return (
                  <tr key={i} className="text-text-secondary border-t border-border-subtle">
                    <td className="pr-4 py-0.5">{ch === " " ? "SP" : ch}</td>
                    <td className="pr-4 py-0.5">{code}</td>
                    <td className="pr-4 py-0.5">{code.toString(16).padStart(2, "0")}</td>
                    <td className="pr-4 py-0.5">{code.toString(8).padStart(3, "0")}</td>
                    <td className="pr-4 py-0.5">{code.toString(2).padStart(8, "0")}</td>
                  </tr>
                );
              })}
              {input.length > 16 && (
                <tr className="text-text-muted">
                  <td colSpan={5} className="pt-1">…and {input.length - 16} more characters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Number Base Converter", href: "/base" },
            { name: "ASCII Table", href: "/ascii-art-generator" },
            { name: "Base64", href: "/base64" },
            { name: "HTML Entities", href: "/html-entities" },
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
