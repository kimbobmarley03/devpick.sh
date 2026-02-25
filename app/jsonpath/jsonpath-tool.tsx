"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

// ── JSONPath evaluator (hand-rolled) ─────────────────────────────────────────

// Use unknown with a helper to avoid circular type alias issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonVal = any;

function evalPath(data: JsonVal, path: string): JsonVal[] {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "$") return [data];

  // Strip leading $
  const expr = trimmed.startsWith("$") ? trimmed.slice(1) : trimmed;

  // Tokenise into segments
  const segments = tokenise(expr);
  let current: JsonVal[] = [data];

  for (const seg of segments) {
    current = applySegment(current, seg);
  }

  return current;
}

type Segment =
  | { type: "key"; key: string }
  | { type: "index"; idx: number }
  | { type: "wildcard" }
  | { type: "recursive"; key: string | null };

function tokenise(expr: string): Segment[] {
  const segs: Segment[] = [];
  let i = 0;

  while (i < expr.length) {
    // Recursive descent: ..key or ..*
    if (expr[i] === "." && expr[i + 1] === ".") {
      i += 2;
      if (expr[i] === "*") {
        segs.push({ type: "recursive", key: null });
        i++;
      } else {
        const start = i;
        while (i < expr.length && expr[i] !== "." && expr[i] !== "[") i++;
        segs.push({ type: "recursive", key: expr.slice(start, i) || null });
      }
      continue;
    }

    // Dot notation: .key or .*
    if (expr[i] === ".") {
      i++;
      if (expr[i] === "*") {
        segs.push({ type: "wildcard" });
        i++;
      } else {
        const start = i;
        while (i < expr.length && expr[i] !== "." && expr[i] !== "[") i++;
        const key = expr.slice(start, i);
        if (key) segs.push({ type: "key", key });
      }
      continue;
    }

    // Bracket notation: [key], [index], [*], ['key']
    if (expr[i] === "[") {
      i++;
      const end = expr.indexOf("]", i);
      const inner = expr.slice(i, end < 0 ? undefined : end).trim();
      i = end < 0 ? expr.length : end + 1;

      if (inner === "*") {
        segs.push({ type: "wildcard" });
      } else if (/^-?\d+$/.test(inner)) {
        segs.push({ type: "index", idx: parseInt(inner) });
      } else {
        const key = inner.replace(/^['"]|['"]$/g, "");
        segs.push({ type: "key", key });
      }
      continue;
    }

    i++;
  }

  return segs;
}

function applySegment(nodes: JsonVal[], seg: Segment): JsonVal[] {
  const out: JsonVal[] = [];

  for (const node of nodes) {
    if (seg.type === "key") {
      if (node !== null && typeof node === "object" && !Array.isArray(node) && seg.key in node) {
        out.push(node[seg.key]);
      }
    } else if (seg.type === "index") {
      if (Array.isArray(node)) {
        const idx = seg.idx < 0 ? node.length + seg.idx : seg.idx;
        if (idx >= 0 && idx < node.length) out.push(node[idx]);
      }
    } else if (seg.type === "wildcard") {
      if (Array.isArray(node)) out.push(...node);
      else if (node !== null && typeof node === "object") out.push(...Object.values(node));
    } else if (seg.type === "recursive") {
      out.push(...recursive(node, seg.key));
    }
  }

  return out;
}

function recursive(node: JsonVal, key: string | null): JsonVal[] {
  const out: JsonVal[] = [];

  if (Array.isArray(node)) {
    for (const child of node) {
      if (key === null) out.push(child);
      out.push(...recursive(child, key));
    }
  } else if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, JsonVal>)) {
      if (key === null || k === key) out.push(v);
      out.push(...recursive(v, key));
    }
  }

  return out;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SAMPLE_JSON = `{
  "store": {
    "book": [
      { "title": "Moby Dick", "price": 8.99, "available": true },
      { "title": "The Lord of the Rings", "price": 22.99, "available": false },
      { "title": "Sayings of the Century", "price": 8.95, "available": true }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`;

const SAMPLE_PATH = "$.store.book[*].title";

export function JsonPathTool() {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [pathInput, setPathInput] = useState(SAMPLE_PATH);

  const { results, error } = (() => {
    if (!jsonInput.trim() || !pathInput.trim()) return { results: [] as JsonVal[], error: null };
    try {
      const data = JSON.parse(jsonInput) as JsonVal;
      const res = evalPath(data, pathInput.trim());
      return { results: res, error: null };
    } catch (e) {
      return { results: [] as JsonVal[], error: String(e instanceof Error ? e.message : e) };
    }
  })();

  const resultText = results.map((r: JsonVal) => JSON.stringify(r, null, 2)).join("\n---\n");

  return (
    <ToolLayout
      title="JSONPath Tester"
      description="Test JSONPath expressions against JSON — supports $ . [] [*] .."
    >
      {/* Path input */}
      <div className="mb-4 space-y-2">
        <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
          JSONPath Expression
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="$.store.book[*].title"
            className="tool-textarea flex-1 font-mono"
            style={{ height: "40px", resize: "none" }}
            spellCheck={false}
          />
          <button onClick={() => { setPathInput(""); }} className="action-btn">
            <Trash2 size={13} />
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2">
          {[
            "$.store.book[*].title",
            "$.store.book[0].price",
            "$..price",
            "$.store.*",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => setPathInput(ex)}
              className="text-xs font-mono px-2 py-1 bg-surface-subtle border border-border-subtle rounded text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* JSON Input */}
        <div className="flex flex-col">
          <div className="pane-label">JSON Input</div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON here…"
            className="tool-textarea flex-1"
            style={{ minHeight: "320px" }}
            spellCheck={false}
          />
        </div>

        {/* Results */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
              {error ? (
                <span className="text-red-400">Error</span>
              ) : (
                <>Results <span className="text-blue-400">({results.length} match{results.length !== 1 ? "es" : ""})</span></>
              )}
            </div>
            {resultText && <CopyButton text={resultText} />}
          </div>
          <div
            className={`flex-1 bg-output-bg border rounded-lg overflow-auto p-3 ${
              error ? "border-red-500/40" : "border-card-border"
            }`}
            style={{ minHeight: "320px" }}
          >
            {error ? (
              <pre className="text-red-400 font-mono text-[13px] whitespace-pre-wrap">{error}</pre>
            ) : results.length === 0 ? (
              <span className="text-text-ghost font-mono text-[13px]">
                {jsonInput.trim() && pathInput.trim() ? "No matches" : "Results will appear here…"}
              </span>
            ) : (
              <div className="space-y-3">
                {results.map((r: JsonVal, i: number) => (
                  <div key={i} className="group relative">
                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={JSON.stringify(r, null, 2)} />
                    </div>
                    <div className="text-xs text-text-dimmed font-mono mb-1">Match {i + 1}</div>
                    <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary bg-card-bg rounded p-2 border border-border-subtle">
                      {JSON.stringify(r, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
            { name: "CSV to JSON", href: "/csv-formatter" },
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
