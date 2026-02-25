"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

// ── Type utilities ────────────────────────────────────────────────────────
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function getType(val: JsonValue): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function typeColor(type: string): string {
  switch (type) {
    case "string": return "#4ade80";   // green
    case "number": return "#60a5fa";   // blue
    case "boolean": return "#fb923c";  // orange
    case "null": return "#9ca3af";     // gray
    default: return "var(--dp-text-secondary)";
  }
}

// ── JSON node component ───────────────────────────────────────────────────
interface NodeProps {
  keyName: string | null;
  value: JsonValue;
  path: string;
  depth: number;
  searchQuery: string;
  onCopyPath: (path: string) => void;
  copiedPath: string | null;
  defaultExpanded: boolean;
}

function JsonNode({
  keyName,
  value,
  path,
  depth,
  searchQuery,
  onCopyPath,
  copiedPath,
  defaultExpanded,
}: NodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 2);
  const type = getType(value);
  const isExpandable = type === "object" || type === "array";
  const isCopied = copiedPath === path;

  const matchesSearch = searchQuery
    ? path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (type === "string" && String(value).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (keyName !== null && keyName.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  if (!matchesSearch && !isExpandable) return null;

  const renderValue = () => {
    if (type === "null") return <span style={{ color: typeColor("null") }}>null</span>;
    if (type === "boolean")
      return <span style={{ color: typeColor("boolean") }}>{String(value)}</span>;
    if (type === "number")
      return <span style={{ color: typeColor("number") }}>{String(value)}</span>;
    if (type === "string")
      return (
        <span style={{ color: typeColor("string") }}>
          &quot;{String(value)}&quot;
        </span>
      );
    if (type === "array") {
      const arr = value as JsonValue[];
      return expanded ? null : (
        <span className="text-text-muted text-xs">
          [{arr.length} item{arr.length !== 1 ? "s" : ""}]
        </span>
      );
    }
    if (type === "object") {
      const obj = value as Record<string, JsonValue>;
      const keys = Object.keys(obj);
      return expanded ? null : (
        <span className="text-text-muted text-xs">
          {"{"}
          {keys.length} key{keys.length !== 1 ? "s" : ""}
          {"}"}
        </span>
      );
    }
  };

  return (
    <div
      className="font-mono text-xs leading-6"
      style={{ marginLeft: depth > 0 ? 16 : 0 }}
    >
      <div
        className="flex items-start gap-1 group hover:bg-[var(--dp-bg-subtle)] rounded px-1 -mx-1"
        style={{ opacity: searchQuery && !matchesSearch ? 0.3 : 1 }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => isExpandable && setExpanded((e) => !e)}
          className="flex-shrink-0 mt-0.5"
          style={{ width: 14, visibility: isExpandable ? "visible" : "hidden" }}
        >
          {expanded ? (
            <ChevronDown size={12} className="text-text-dimmed" />
          ) : (
            <ChevronRight size={12} className="text-text-dimmed" />
          )}
        </button>

        {/* Key */}
        {keyName !== null && (
          <button
            onClick={() => onCopyPath(path)}
            className="flex-shrink-0 text-[#c084fc] hover:underline cursor-pointer"
            title={`Copy path: ${path}`}
          >
            {keyName}
            <span className="text-text-dimmed">:</span>
          </button>
        )}

        {/* Value / preview */}
        <span className="flex-1 truncate">{renderValue()}</span>

        {/* Copy path icon */}
        {path && (
          <button
            onClick={() => onCopyPath(path)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dimmed hover:text-text-secondary"
            title={`Copy path: ${path}`}
          >
            {isCopied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
          </button>
        )}
      </div>

      {/* Children */}
      {expanded && isExpandable && (
        <div>
          {type === "array"
            ? (value as JsonValue[]).map((item, i) => (
                <JsonNode
                  key={i}
                  keyName={String(i)}
                  value={item}
                  path={`${path}[${i}]`}
                  depth={depth + 1}
                  searchQuery={searchQuery}
                  onCopyPath={onCopyPath}
                  copiedPath={copiedPath}
                  defaultExpanded={defaultExpanded}
                />
              ))
            : Object.entries(value as Record<string, JsonValue>).map(([k, v]) => (
                <JsonNode
                  key={k}
                  keyName={k}
                  value={v}
                  path={`${path}.${k}`}
                  depth={depth + 1}
                  searchQuery={searchQuery}
                  onCopyPath={onCopyPath}
                  copiedPath={copiedPath}
                  defaultExpanded={defaultExpanded}
                />
              ))}
        </div>
      )}
    </div>
  );
}

// ── Main tool component ───────────────────────────────────────────────────
const SAMPLE = `{
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "active": true,
    "score": 9.8,
    "address": null,
    "roles": ["admin", "editor"],
    "metadata": {
      "created": "2024-01-15",
      "lastLogin": "2025-02-20"
    }
  }
}`;

export function JsonViewerTool() {
  useWebMCP({
    name: "viewJSON",
    description: "Parse and explore JSON data",
    inputSchema: {
      type: "object" as const,
      properties: {
      "json": {
            "type": "string",
            "description": "JSON to view"
      }
},
      required: ["json"],
    },
    execute: async (params) => {
      try { const obj = JSON.parse(params.json as string); return { content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] }; } catch { return { content: [{ type: "text", text: "Error: Invalid JSON" }] }; }
    },
  });

  const [input, setInput] = useState(SAMPLE);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [view, setView] = useState<"tree" | "raw">("tree");

  const { parsed, error } = useMemo(() => {
    if (!input.trim()) return { parsed: null, error: "" };
    try {
      return { parsed: JSON.parse(input) as JsonValue, error: "" };
    } catch (e) {
      return { parsed: null, error: (e as Error).message };
    }
  }, [input]);

  const copyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1500);
    });
  }, []);

  const formatted = parsed !== null ? JSON.stringify(parsed, null, 2) : "";

  return (
    <ToolLayout agentReady
      title="JSON Viewer"
      description="Interactive JSON tree viewer — expand/collapse, click keys to copy paths, search nodes."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setView("tree")}
            className={`tab-btn ${view === "tree" ? "active" : ""}`}
          >
            Tree View
          </button>
          <button
            onClick={() => setView("raw")}
            className={`tab-btn ${view === "raw" ? "active" : ""}`}
          >
            Raw JSON
          </button>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setInput(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={formatted} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col min-h-[400px]">
          <div className="pane-label">JSON Input</div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            placeholder='{"key": "value"}'
            className="tool-textarea flex-1"
            spellCheck={false}
          />
          {error && (
            <div className="mt-2 text-[var(--dp-error)] text-xs font-mono">{error}</div>
          )}
        </div>

        {/* Tree / Raw view */}
        <div className="flex flex-col min-h-[400px]">
          <div className="pane-label flex items-center gap-2">
            {view === "tree" ? "Tree View" : "Formatted JSON"}
            {view === "tree" && parsed !== null && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keys or values..."
                className="tool-textarea ml-auto"
                style={{ height: "24px", padding: "2px 8px", fontSize: "11px", width: "160px" }}
              />
            )}
          </div>

          <div className="output-panel flex-1 overflow-auto">
            {parsed === null ? (
              <span className="text-text-ghost font-mono text-[13px]">
                {error ? "Fix JSON errors to see tree" : "Paste JSON to explore..."}
              </span>
            ) : view === "tree" ? (
              <div className="select-none">
                <JsonNode
                  keyName={null}
                  value={parsed}
                  path="root"
                  depth={0}
                  searchQuery={searchQuery}
                  onCopyPath={copyPath}
                  copiedPath={copiedPath}
                  defaultExpanded={false}
                />
              </div>
            ) : (
              <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
                {formatted}
              </pre>
            )}
          </div>

          {copiedPath && (
            <div className="mt-2 text-xs text-green-400 font-mono animate-fade-in">
              ✓ Copied: {copiedPath}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {parsed !== null && view === "tree" && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-mono">
          {[
            { label: "string", color: "#4ade80" },
            { label: "number", color: "#60a5fa" },
            { label: "boolean", color: "#fb923c" },
            { label: "null", color: "#9ca3af" },
          ].map(({ label, color }) => (
            <span key={label} style={{ color }}>● {label}</span>
          ))}
          <span className="text-text-dimmed ml-2">Click keys to copy path</span>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: "How do I copy a JSON path?",
              a: "Click on any key name in the tree view to copy its full dot-notation path. For example, clicking 'name' inside users[0] copies 'root.users[0].name'.",
            },
            {
              q: "Is my data sent to a server?",
              a: "No. All processing happens in your browser. Your JSON data is never uploaded or transmitted.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="text-xs font-semibold text-text-secondary mb-1">{q}</div>
              <div className="text-xs text-text-dimmed">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
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
