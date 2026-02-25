"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Format = "binary" | "hex" | "octal" | "decimal";

function decode(input: string, format: Format): string {
  const s = input.trim();
  if (!s) return "";

  try {
    switch (format) {
      case "binary": {
        const parts = s.split(/\s+/);
        return parts.map((b) => {
          const code = parseInt(b, 2);
          if (isNaN(code)) throw new Error(`Invalid binary: ${b}`);
          return String.fromCharCode(code);
        }).join("");
      }
      case "hex": {
        const parts = s.replace(/0x/gi, "").split(/[\s,]+/).filter(Boolean);
        return parts.map((h) => {
          const code = parseInt(h, 16);
          if (isNaN(code)) throw new Error(`Invalid hex: ${h}`);
          return String.fromCharCode(code);
        }).join("");
      }
      case "octal": {
        const parts = s.split(/\s+/);
        return parts.map((o) => {
          const code = parseInt(o, 8);
          if (isNaN(code)) throw new Error(`Invalid octal: ${o}`);
          return String.fromCharCode(code);
        }).join("");
      }
      case "decimal": {
        const parts = s.split(/[\s,]+/).filter(Boolean);
        return parts.map((d) => {
          const code = parseInt(d, 10);
          if (isNaN(code)) throw new Error(`Invalid decimal: ${d}`);
          return String.fromCharCode(code);
        }).join("");
      }
    }
  } catch (e) {
    throw e;
  }
}

const EXAMPLES: Record<Format, string> = {
  binary: "01001000 01100101 01101100 01101100 01101111",
  hex: "48 65 6c 6c 6f",
  octal: "110 145 154 154 157",
  decimal: "72 101 108 108 111",
};

const FORMAT_LABELS: Record<Format, string> = {
  binary: "Binary",
  hex: "Hexadecimal",
  octal: "Octal",
  decimal: "Decimal",
};

export function BinaryToTextTool() {
  const [format, setFormat] = useState<Format>("binary");
  const [input, setInput] = useState(EXAMPLES.binary);
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      output = decode(input, format);
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  const handleFormatChange = (f: Format) => {
    setFormat(f);
    setInput(EXAMPLES[f]);
    setError("");
  };

  return (
    <ToolLayout
      title="Binary to Text"
      description="Decode binary, hexadecimal, octal, or decimal values back to text. 100% client-side."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 flex-wrap">
          {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFormatChange(f)}
              className={`tab-btn ${format === f ? "active" : ""}`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setInput(""); setError(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">{FORMAT_LABELS[format]} Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder={`Enter ${format} values, e.g. ${EXAMPLES[format]}`}
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">Text Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Output will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Text to Binary", href: "/text-to-binary" },
            { name: "Text to Hex", href: "/text-to-hex" },
            { name: "Base64", href: "/base64" },
            { name: "ASCII Table", href: "/ascii-art-generator" },
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
