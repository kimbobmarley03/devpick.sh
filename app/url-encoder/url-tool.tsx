"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "encode" | "decode";

export function UrlTool() {
  useWebMCP({
    name: "urlEncode",
    description: "URL encode or decode a string",
    inputSchema: {
      type: "object" as const,
      properties: {
      "input": {
            "type": "string",
            "description": "String to encode/decode"
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
      const result = params.mode === "encode" ? encodeURIComponent(params.input as string) : decodeURIComponent(params.input as string); return { content: [{ type: "text", text: result }] };
    },
  });

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
      agentReady
      title="URL Encoder / Decoder"
      description="URL encode or decode query strings, path segments, and full URLs with percent-encoding"
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
            { name: "UTM Builder", href: "/utm-builder" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Escape / Unescape", href: "/escape" },
            { name: "Meta Tags Generator", href: "/meta-tags" },
            { name: "Base64", href: "/base64" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>

      {/* SEO Content: FAQ */}
      <section className="mt-8 pt-6 border-t border-border-subtle space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary">URL Encoding FAQ</h2>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            <strong className="text-text-primary">What is URL encoding?</strong> URL encoding (percent encoding)
            converts reserved characters like spaces, <code>?</code>, <code>&amp;</code>, and <code>#</code> into a
            safe format (for example, space becomes <code>%20</code>) so URLs can be transmitted correctly.
          </p>
          <p>
            <strong className="text-text-primary">When should I encode a URL?</strong> Encode query parameter
            values, dynamic path segments, and any user-provided text before appending it to a URL.
          </p>
          <p>
            <strong className="text-text-primary">What is URL decoding?</strong> URL decoding reverses
            percent-encoded text back into readable characters, which is useful for debugging query strings and
            inspecting redirects.
          </p>
          <p>
            <strong className="text-text-primary">Should I encode the full URL or only parts?</strong> Usually
            encode components (like parameter values) rather than the entire URL to avoid double encoding.
          </p>
        </div>
      </section>
    </ToolLayout>
  );
}
