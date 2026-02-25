"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

const SAMPLE_JSON = `{
  "catalog": {
    "book": [
      {
        "id": "bk001",
        "author": "Alice Martin",
        "title": "Clean Code Patterns",
        "genre": "Technology",
        "price": 29.99,
        "publishDate": "2024-01-15",
        "description": "A guide to writing maintainable code."
      },
      {
        "id": "bk002",
        "author": "Bob Chen",
        "title": "Distributed Systems",
        "genre": "Technology",
        "price": 39.99,
        "publishDate": "2024-03-20",
        "description": "Deep dive into distributed architectures."
      }
    ]
  }
}`;

function jsonToXml(value: unknown, tagName: string, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (value === null || value === undefined) {
    return `${pad}<${tagName}/>`;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return `${pad}<${tagName}>${value}</${tagName}>`;
  }

  if (typeof value === "string") {
    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    return `${pad}<${tagName}>${escaped}</${tagName}>`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => jsonToXml(item, tagName, indent)).join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return `${pad}<${tagName}/>`;
    }
    const children = entries
      .map(([k, v]) => {
        // Sanitize key: replace spaces/invalid chars
        const safeKey = k.replace(/[^a-zA-Z0-9_.-]/g, "_").replace(/^(\d)/, "_$1");
        if (Array.isArray(v)) {
          return v.map((item) => jsonToXml(item, safeKey, indent + 1)).join("\n");
        }
        return jsonToXml(v, safeKey, indent + 1);
      })
      .join("\n");
    return `${pad}<${tagName}>\n${children}\n${pad}</${tagName}>`;
  }

  return `${pad}<${tagName}>${String(value)}</${tagName}>`;
}

function convert(jsonStr: string, rootTag: string): string {
  const parsed = JSON.parse(jsonStr);
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n';

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const entries = Object.entries(parsed);
    if (entries.length === 1) {
      const [key, val] = entries[0];
      return header + jsonToXml(val, key, 0);
    }
  }

  return header + jsonToXml(parsed, rootTag || "root", 0);
}

export function JsonToXmlTool() {
  useWebMCP({
    name: "jsonToXml",
    description: "Convert JSON to XML format",
    inputSchema: {
      type: "object" as const,
      properties: {
      "json": {
            "type": "string",
            "description": "JSON to convert"
      }
},
      required: ["json"],
    },
    execute: async (params) => {
      try { JSON.parse(params.json as string); return { content: [{ type: "text", text: "Use the web UI for full conversion" }] }; } catch { return { content: [{ type: "text", text: "Error: Invalid JSON" }] }; }
    },
  });

  const [input, setInput] = useState(SAMPLE_JSON);
  const [rootTag, setRootTag] = useState("root");
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      output = convert(input, rootTag || "root");
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  return (
    <ToolLayout agentReady
      title="JSON to XML Converter"
      description="Convert JSON to XML with proper formatting. Handles nested objects, arrays, and special characters."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Root tag:
          <input
            value={rootTag}
            onChange={(e) => setRootTag(e.target.value)}
            className="px-2 py-1 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-28"
            placeholder="root"
          />
        </label>
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
            <div className="pane-label">JSON Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder='{"key": "value"}'
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">XML Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  XML will appear here…
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
            { name: "XML to JSON", href: "/xml-to-json" },
            { name: "XML to CSV", href: "/xml-to-csv" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "XML Formatter", href: "/xml-formatter" },
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
