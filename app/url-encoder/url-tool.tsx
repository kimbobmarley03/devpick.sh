"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "encode" | "decode";

export function UrlTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "encode") {
        return encodeURIComponent(input);
      } else {
        return decodeURIComponent(input);
      }
    } catch {
      return "⚠ Invalid input for decoding";
    }
  })();

  const swap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        swap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [output, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode or decode URL components with percent-encoding"
      kbdHint="⌘↵ swap"
    >
      <div className="flex items-center gap-2 mb-4">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
          >
            {m}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={swap} className="action-btn">
            <ArrowUpDown size={13} />
            Swap
          </button>
          <button onClick={() => setInput("")} className="action-btn">
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
              {mode === "encode" ? "Plain URL / Text" : "Encoded URL"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "e.g. https://example.com/path?q=hello world"
                  : "e.g. https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world"
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
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
            { name: "Base64", href: "/base64" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Escape / Unescape", href: "/escape" },
            { name: "Slug Generator", href: "/slug-generator" },
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
