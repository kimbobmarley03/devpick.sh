"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, ArrowLeftRight } from "lucide-react";

type Mode = "encode" | "decode";
type Prefix = "none" | "0x" | "\\x";
type Separator = "space" | "comma" | "none";

function textToHex(text: string, prefix: Prefix, separator: Separator): string {
  const parts = Array.from(text).map((c) => {
    const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
    return prefix === "0x" ? `0x${hex}` : prefix === "\\x" ? `\\x${hex}` : hex;
  });
  const sep = separator === "space" ? " " : separator === "comma" ? ", " : "";
  return parts.join(sep);
}

function hexToText(hex: string): string {
  const cleaned = hex.replace(/0x/gi, "").replace(/\\x/gi, "").replace(/[\s,]+/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return parts.map((h) => {
    const code = parseInt(h, 16);
    if (isNaN(code)) throw new Error(`Invalid hex value: ${h}`);
    return String.fromCharCode(code);
  }).join("");
}

export function TextToHexTool() {
  useWebMCP({
    name: "textToHex",
    description: "Convert text to hexadecimal",
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
      const result = Array.from(params.text as string).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" "); return { content: [{ type: "text", text: result }] };
    },
  });

  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("Hello, World!");
  const [prefix, setPrefix] = useState<Prefix>("none");
  const [separator, setSeparator] = useState<Separator>("space");
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      if (mode === "encode") {
        output = textToHex(input, prefix, separator);
      } else {
        output = hexToText(input);
      }
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  const swap = () => {
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setError("");
  };

  return (
    <ToolLayout agentReady
      title="Text to Hex"
      description="Convert text to hexadecimal and back — supports multiple prefix formats. 100% client-side."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {([
            { value: "encode" as Mode, label: "Text → Hex" },
            { value: "decode" as Mode, label: "Hex → Text" },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setError(""); }}
              className={`tab-btn ${mode === m.value ? "active" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-text-dimmed">
              <span>Prefix:</span>
              {(["none", "0x", "\\x"] as Prefix[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrefix(p)}
                  className={`tab-btn ${prefix === p ? "active" : ""}`}
                >
                  {p === "none" ? "none" : p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-dimmed">
              <span>Sep:</span>
              {(["space", "comma", "none"] as Separator[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeparator(s)}
                  className={`tab-btn ${separator === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={swap} className="action-btn" disabled={!output}>
            <ArrowLeftRight size={13} />
            Swap
          </button>
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
            <div className="pane-label">
              {mode === "encode" ? "Text Input" : "Hex Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder={mode === "encode" ? "Type or paste text here..." : "Enter hex values, e.g. 48 65 6c 6c 6f"}
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? "Hex Output" : "Text Output"}
            </div>
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
            { name: "Binary to Text", href: "/binary-to-text" },
            { name: "Text to Binary", href: "/text-to-binary" },
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "Base64", href: "/base64" },
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
