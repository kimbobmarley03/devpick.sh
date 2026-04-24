"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "encode" | "decode";

export function Base64Tool() {
  useWebMCP({
    name: "base64",
    description: "Encode or decode Base64 strings",
    inputSchema: {
      type: "object" as const,
      properties: {
      "input": {
            "type": "string",
            "description": "Text to encode/decode"
      },
      "mode": {
            "type": "string",
            "description": "encode or decode",
            "enum": [
                  "encode",
                  "decode"
            ]
      }
},
      required: ["input", "mode"],
    },
    execute: async (params) => {
      try { const text = params.mode === "encode" ? btoa(params.input as string) : atob(params.input as string); return { content: [{ type: "text", text }] }; } catch (e) { return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Failed") }] }; }
    },
  });

  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "encode") {
        return btoa(unescape(encodeURIComponent(input)));
      } else {
        return decodeURIComponent(escape(atob(input.trim())));
      }
    } catch {
      return "⚠ Invalid input for " + mode;
    }
  })();

  const swap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
  };

  // Ctrl+Enter to swap
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
      agentReady
      title="Base64 Encoder / Decoder"
      description="Encode text to Base64 or decode Base64 back to text"
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
              {mode === "encode" ? "Plain Text" : "Base64 Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Paste Base64 here..."
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? "Base64 Output" : "Decoded Text"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
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

      {/* SEO Content */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Base64 encoder/decoder for API payloads and debugging</h2>
        <p className="text-sm text-text-dimmed leading-relaxed mb-3">
          Use this free Base64 tool to quickly encode plain text or decode Base64 strings while debugging APIs,
          auth tokens, and app configs. Everything runs locally in your browser.
        </p>
        <ul className="list-disc pl-5 text-sm text-text-dimmed space-y-1">
          <li>Encode UTF-8 text to Base64 for transport-safe payloads</li>
          <li>Decode Base64 strings to inspect token claims and request bodies</li>
          <li>No upload, no account, and no server-side processing</li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What is Base64 encoding used for?",
              a: "Base64 converts text/binary data into ASCII-safe text, commonly used in APIs, email attachments, data URLs, and auth headers.",
            },
            {
              q: "Does Base64 encryption protect my data?",
              a: "No. Base64 is encoding, not encryption. Anyone can decode it. Use encryption if you need confidentiality.",
            },
            {
              q: "Can I decode UTF-8 characters with this tool?",
              a: "Yes. This tool supports UTF-8 text so non-English characters are preserved when encoding/decoding.",
            },
            {
              q: "Is my data uploaded to a server?",
              a: "No. Encoding and decoding happen entirely in your browser.",
            },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Image → Base64", href: "/image-base64" },
            { name: "JWT Decoder", href: "/jwt-decoder" },
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
