"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, AlertCircle } from "lucide-react";

type Mode = "format" | "minify";

function formatJSON(raw: string, indent: number): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed, null, indent);
}

function minifyJSON(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
}

function getJsonError(raw: string): string | null {
  if (!raw.trim()) return null;
  try {
    JSON.parse(raw);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Invalid JSON";
  }
}

const SAMPLE_JSON = `{"name":"devpick","tools":36,"categories":["format","encode","convert","generate","network","compare"],"meta":{"author":"devpick","url":"https://devpick.sh"}}`;

export function JsonFormatter() {
  useWebMCP({
    name: "formatJSON",
    description: "Format, prettify, or minify JSON data",
    inputSchema: {
      type: "object" as const,
      properties: {
      "json": {
            "type": "string",
            "description": "Raw JSON string to format"
      },
      "indent": {
            "type": "number",
            "description": "Indent spaces (default 2)"
      }
},
      required: ["json"],
    },
    execute: async (params) => {
      const indent = (params.indent as number) || 2; try { const parsed = JSON.parse(params.json as string); return { content: [{ type: "text", text: JSON.stringify(parsed, null, indent) }] }; } catch (e) { return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Invalid JSON") }] }; }
    },
  });

  const [mode, setMode] = useState<Mode>("format");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState(2);

  const jsonError = getJsonError(input);

  const output = (() => {
    if (!input.trim() || jsonError) return "";
    try {
      return mode === "format" ? formatJSON(input, indent) : minifyJSON(input);
    } catch (e) {
      return `⚠ ${e instanceof Error ? e.message : "Failed to process JSON"}`;
    }
  })();

  // Ctrl+Enter to format/minify
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        // Format or minify is already live — just swap mode if user presses again
        setMode((m) => (m === "format" ? "minify" : "format"));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ToolLayout
      agentReady
      title="JSON Formatter"
      description="Format, validate, and minify JSON — instant syntax checking and pretty-printing"
      kbdHint="⌘↵ toggle format/minify"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["format", "minify"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
          >
            {m}
          </button>
        ))}
        {mode === "format" && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-text-dimmed">Indent</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`tab-btn ${indent === n ? "active" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      {jsonError && input.trim() && (
        <div className="error-banner">
          <AlertCircle size={15} className="text-error mt-0.5 shrink-0" />
          <span className="error-banner-text">{jsonError}</span>
        </div>
      )}

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">JSON Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste your JSON here... e.g. {"name":"devpick"}'
              className={`tool-textarea flex-1 ${jsonError && input.trim() ? "border-error/40" : ""}`}
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "format" ? "Formatted JSON" : "Minified JSON"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : jsonError && input.trim() ? (
                <span className="text-error font-mono text-[13px]">
                  Fix the JSON error to see output
                </span>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Output will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />
      {/* FAQ Section */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What is JSON?", a: "JSON (JavaScript Object Notation) is a lightweight data format for storing and exchanging data. It uses key-value pairs and supports strings, numbers, booleans, arrays, objects, and null." },
            { q: "How do I validate JSON?", a: "Paste your JSON into the input box. If it turns red or shows an error banner, your JSON has a syntax error. Common issues include missing quotes around keys, trailing commas, and unescaped special characters." },
            { q: "What is the difference between JSON and XML?", a: "JSON uses a compact key-value syntax that is native to JavaScript, while XML uses verbose opening and closing tags. JSON is generally faster to parse and easier to read for most data structures." },
            { q: "Can I minify JSON to reduce file size?", a: "Yes! Switch to 'Minify' mode to strip all whitespace and produce the most compact JSON representation. This is useful for reducing API payload sizes and improving performance." },
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
        <p className="text-xs text-text-dimmed mb-3 leading-relaxed">
          Working with APIs or config files? Keep the full JSON workflow in one place: validate structure,
          query fields, convert between YAML and JSON, then generate TypeScript types.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "JSON → YAML", href: "/json-to-yaml" },
            { name: "YAML → JSON", href: "/yaml-to-json" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
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
