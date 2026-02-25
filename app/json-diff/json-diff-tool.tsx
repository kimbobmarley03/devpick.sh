"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";

const SAMPLE_LEFT = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "role": "admin",
  "settings": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  },
  "tags": ["developer", "admin"]
}`;

const SAMPLE_RIGHT = `{
  "name": "Alice",
  "age": 31,
  "email": "alice@newdomain.com",
  "settings": {
    "theme": "light",
    "notifications": true,
    "language": "fr",
    "fontSize": 14
  },
  "tags": ["developer", "admin", "beta"],
  "lastLogin": "2024-01-15"
}`;

type DiffType = "added" | "removed" | "changed" | "unchanged";

interface DiffNode {
  key: string;
  type: DiffType;
  leftVal?: unknown;
  rightVal?: unknown;
  children?: DiffNode[];
}

function diff(left: unknown, right: unknown, key = "root"): DiffNode {
  if (left === undefined && right !== undefined) {
    return { key, type: "added", rightVal: right };
  }
  if (left !== undefined && right === undefined) {
    return { key, type: "removed", leftVal: left };
  }

  const isObj = (v: unknown) => v !== null && typeof v === "object" && !Array.isArray(v);

  if (isObj(left) && isObj(right)) {
    const lObj = left as Record<string, unknown>;
    const rObj = right as Record<string, unknown>;
    const allKeys = Array.from(new Set([...Object.keys(lObj), ...Object.keys(rObj)]));
    const children: DiffNode[] = allKeys.map((k) => diff(lObj[k], rObj[k], k));
    const hasChanges = children.some((c) => c.type !== "unchanged");
    return { key, type: hasChanges ? "changed" : "unchanged", children };
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLen = Math.max(left.length, right.length);
    const children: DiffNode[] = Array.from({ length: maxLen }, (_, i) =>
      diff(left[i], right[i], `[${i}]`)
    );
    const hasChanges = children.some((c) => c.type !== "unchanged");
    return { key, type: hasChanges ? "changed" : "unchanged", children };
  }

  if (JSON.stringify(left) === JSON.stringify(right)) {
    return { key, type: "unchanged", leftVal: left };
  }

  return { key, type: "changed", leftVal: left, rightVal: right };
}

const TYPE_STYLES: Record<DiffType, string> = {
  added: "bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-500",
  removed: "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500",
  changed: "bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-500",
  unchanged: "",
};

const TYPE_LABEL: Record<DiffType, string> = {
  added: "text-emerald-600 dark:text-emerald-400",
  removed: "text-red-600 dark:text-red-400",
  changed: "text-amber-600 dark:text-amber-400",
  unchanged: "text-text-ghost",
};

function renderValue(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  return JSON.stringify(v);
}

function DiffTree({ node, depth = 0 }: { node: DiffNode; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const pad = depth * 16;
  const hasChildren = node.children && node.children.length > 0;

  if (node.type === "unchanged" && !hasChildren) {
    return null; // Don't show unchanged leaf nodes
  }

  return (
    <div>
      <div
        className={`flex items-start gap-2 px-3 py-1 rounded text-xs font-mono ${TYPE_STYLES[node.type]} ${hasChildren ? "cursor-pointer" : ""}`}
        style={{ marginLeft: pad }}
        onClick={() => hasChildren && setCollapsed((c) => !c)}
      >
        {hasChildren && (
          <span className="text-text-ghost select-none mt-0.5">{collapsed ? "▶" : "▼"}</span>
        )}
        <span className="text-text-secondary">{node.key}:</span>
        {!hasChildren && (
          <span className={`flex-1 ${TYPE_LABEL[node.type]}`}>
            {node.type === "added" && renderValue(node.rightVal)}
            {node.type === "removed" && renderValue(node.leftVal)}
            {node.type === "changed" && (
              <>
                <span className="line-through text-red-500 dark:text-red-400 mr-2">{renderValue(node.leftVal)}</span>
                <span className="text-emerald-600 dark:text-emerald-400">{renderValue(node.rightVal)}</span>
              </>
            )}
            {node.type === "unchanged" && renderValue(node.leftVal)}
          </span>
        )}
        {node.type !== "unchanged" && (
          <span className={`ml-auto text-[10px] uppercase font-bold tracking-wide ${TYPE_LABEL[node.type]}`}>
            {node.type}
          </span>
        )}
      </div>
      {hasChildren && !collapsed && (
        <div>
          {node.children!.map((child, i) => (
            <DiffTree key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonDiffTool() {
  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);
  const [error, setError] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(false);

  let diffResult: DiffNode | null = null;
  const stats = { added: 0, removed: 0, changed: 0 };

  if (left.trim() && right.trim()) {
    try {
      const l = JSON.parse(left);
      const r = JSON.parse(right);
      diffResult = diff(l, r, "root");

      const countDiffs = (node: DiffNode) => {
        if (node.type === "added") stats.added++;
        else if (node.type === "removed") stats.removed++;
        else if (node.type === "changed") stats.changed++;
        node.children?.forEach(countDiffs);
      };
      if (diffResult) countDiffs(diffResult);
      if (error) setError("");
    } catch (e) {
      diffResult = null;
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  function filterDiffNode(node: DiffNode): DiffNode | null {
    if (!showUnchanged && node.type === "unchanged" && !node.children) return null;
    if (node.children) {
      const filtered = node.children.map(filterDiffNode).filter(Boolean) as DiffNode[];
      if (!showUnchanged && filtered.length === 0 && node.type === "unchanged") return null;
      return { ...node, children: filtered };
    }
    return node;
  }

  const filteredResult = diffResult ? filterDiffNode(diffResult) : null;

  return (
    <ToolLayout
      title="JSON Diff"
      description="Compare two JSON objects and see added, removed, and changed keys in a color-coded tree view."
    >
      {/* Stats */}
      {diffResult && (
        <div className="flex items-center gap-4 mb-4 text-xs font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">+{stats.added} added</span>
          <span className="text-red-500 dark:text-red-400">−{stats.removed} removed</span>
          <span className="text-amber-600 dark:text-amber-400">~{stats.changed} changed</span>
          <label className="ml-auto flex items-center gap-2 text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            Show unchanged
          </label>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <div className="pane-label">JSON A (original)</div>
          <textarea
            value={left}
            onChange={(e) => { setLeft(e.target.value); setError(""); }}
            className="tool-textarea"
            rows={12}
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <div className="pane-label">JSON B (modified)</div>
          <textarea
            value={right}
            onChange={(e) => { setRight(e.target.value); setError(""); }}
            className="tool-textarea"
            rows={12}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      <div className="pane-label mb-2">Diff Result</div>
      <div className="rounded-lg border border-border-subtle bg-zinc-50 dark:bg-zinc-900 p-3 min-h-[200px] space-y-0.5 overflow-auto">
        {error && (
          <div className="text-[var(--dp-error)] text-xs font-mono">{error}</div>
        )}
        {!diffResult && !error && (
          <div className="text-text-ghost text-xs font-mono">Diff will appear here…</div>
        )}
        {filteredResult && (
          <DiffTree node={filteredResult} />
        )}
        {diffResult && stats.added === 0 && stats.removed === 0 && stats.changed === 0 && (
          <div className="text-emerald-600 dark:text-emerald-400 text-sm font-mono text-center py-8">
            ✓ JSON objects are identical
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-text-ghost">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />added</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500" />removed</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />changed</span>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Diff Checker", href: "/diff-checker" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON Viewer", href: "/json-viewer" },
            { name: "Text Compare", href: "/text-compare" },
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
