"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

const SAMPLE_LEFT = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How valiantly did Czar Quixote jump the frozen fjord.
The five boxing wizards jump quickly.
Sphinx of black quartz, judge my vow.`;

const SAMPLE_RIGHT = `The quick brown fox jumped over the lazy cat.
Pack my box with five dozen liquor jugs.
How valiantly did Czar Quixote leap the frozen fjord.
The five boxing wizards jump quickly and with great precision.
Sphinx of black quartz, judge my vow.
This is a new line added at the end.`;

type DiffOp = "equal" | "insert" | "delete" | "replace";

interface LineDiff {
  op: DiffOp;
  left?: string;
  right?: string;
  lineLeft?: number;
  lineRight?: number;
}

// Simple LCS-based diff for lines
function diffLines(leftLines: string[], rightLines: string[]): LineDiff[] {
  const n = leftLines.length;
  const m = rightLines.length;

  // LCS DP
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (leftLines[i] === rightLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Trace back
  const result: LineDiff[] = [];
  let i = 0;
  let j = 0;
  let lNum = 1;
  let rNum = 1;

  while (i < n || j < m) {
    if (i < n && j < m && leftLines[i] === rightLines[j]) {
      result.push({ op: "equal", left: leftLines[i], right: rightLines[j], lineLeft: lNum++, lineRight: rNum++ });
      i++;
      j++;
    } else if (i < n && (j >= m || dp[i + 1][j] >= dp[i][j + 1])) {
      // Check if next right matches (replace)
      if (j < m && dp[i + 1][j] < dp[i][j + 1]) {
        result.push({ op: "replace", left: leftLines[i], right: rightLines[j], lineLeft: lNum++, lineRight: rNum++ });
        i++;
        j++;
      } else {
        result.push({ op: "delete", left: leftLines[i], lineLeft: lNum++ });
        i++;
      }
    } else {
      result.push({ op: "insert", right: rightLines[j], lineRight: rNum++ });
      j++;
    }
  }

  return result;
}

// Word-level diff for changed lines
function diffWords(a: string, b: string): React.ReactNode[] {
  const aWords = a.split(/(\s+)/);
  const bWords = b.split(/(\s+)/);
  const n = aWords.length;
  const m = bWords.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (aWords[i] === bWords[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const parts: React.ReactNode[] = [];
  let i = 0; let j = 0; let k = 0;
  while (i < n || j < m) {
    if (i < n && j < m && aWords[i] === bWords[j]) {
      parts.push(<span key={k++}>{aWords[i]}</span>);
      i++; j++;
    } else if (i < n && (j >= m || dp[i + 1][j] >= dp[i][j + 1])) {
      parts.push(<span key={k++} className="bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through">{aWords[i]}</span>);
      i++;
    } else {
      parts.push(<span key={k++} className="bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">{bWords[j]}</span>);
      j++;
    }
  }
  return parts;
}

const OP_BG: Record<DiffOp, string> = {
  equal: "",
  insert: "bg-emerald-50 dark:bg-emerald-900/20",
  delete: "bg-red-50 dark:bg-red-900/20",
  replace: "bg-amber-50 dark:bg-amber-900/20",
};
const OP_LINE_BG: Record<DiffOp, string> = {
  equal: "text-text-ghost",
  insert: "text-emerald-600 dark:text-emerald-400",
  delete: "text-red-500 dark:text-red-400",
  replace: "text-amber-600 dark:text-amber-400",
};

export function TextCompareTool() {
  useWebMCP({
    name: "compareText",
    description: "Compare two texts line by line",
    inputSchema: {
      type: "object" as const,
      properties: {
      "text1": {
            "type": "string",
            "description": "First text"
      },
      "text2": {
            "type": "string",
            "description": "Second text"
      }
},
      required: ["text1", "text2"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for text comparison" }] };
    },
  });

  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);
  const [view, setView] = useState<"unified" | "split">("unified");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const normalize = (s: string) => {
    let r = s;
    if (ignoreCase) r = r.toLowerCase();
    if (ignoreWhitespace) r = r.replace(/\s+/g, " ").trim();
    return r;
  };

  const diffs = useMemo(() => {
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");
    const normLeft = leftLines.map(normalize);
    const normRight = rightLines.map(normalize);
    const d = diffLines(normLeft, normRight);
    // Restore original lines
    let li = 0; let ri = 0;
    return d.map((diff) => {
      const result = { ...diff };
      if (diff.op === "equal" || diff.op === "delete" || diff.op === "replace") {
        result.left = leftLines[li++];
      }
      if (diff.op === "equal" || diff.op === "insert" || diff.op === "replace") {
        result.right = rightLines[ri++];
      }
      return result;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, right, ignoreCase, ignoreWhitespace]);

  const stats = useMemo(() => ({
    added: diffs.filter((d) => d.op === "insert").length,
    removed: diffs.filter((d) => d.op === "delete").length,
    changed: diffs.filter((d) => d.op === "replace").length,
    unchanged: diffs.filter((d) => d.op === "equal").length,
  }), [diffs]);

  return (
    <ToolLayout agentReady
      title="Text Compare"
      description="Compare two texts side by side or in unified view. Highlights added, removed, and changed lines."
    >
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="pane-label">Text A (original)</div>
            <button onClick={() => setLeft("")} className="action-btn"><Trash2 size={11} /></button>
          </div>
          <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="tool-textarea w-full" rows={10} spellCheck={false} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="pane-label">Text B (modified)</div>
            <button onClick={() => setRight("")} className="action-btn"><Trash2 size={11} /></button>
          </div>
          <textarea value={right} onChange={(e) => setRight(e.target.value)} className="tool-textarea w-full" rows={10} spellCheck={false} />
        </div>
      </div>

      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-1">
          {(["unified", "split"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`tab-btn capitalize ${view === v ? "active" : ""}`}>{v}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-600" />
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
          <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-600" />
          Ignore whitespace
        </label>
        <div className="ml-auto flex gap-3 text-xs font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">+{stats.added} added</span>
          <span className="text-red-500 dark:text-red-400">−{stats.removed} removed</span>
          <span className="text-amber-600 dark:text-amber-400">~{stats.changed} changed</span>
          <span className="text-text-ghost">{stats.unchanged} unchanged</span>
        </div>
      </div>

      {/* Diff output */}
      <div className="rounded-lg border border-border-subtle overflow-auto font-mono text-xs">
        {view === "unified" ? (
          <table className="w-full border-collapse">
            <tbody>
              {diffs.map((diff, i) => {
                if (diff.op === "equal") {
                  return (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="w-8 px-2 py-1 text-right text-text-ghost select-none border-r border-border-subtle">{diff.lineLeft}</td>
                      <td className="w-8 px-2 py-1 text-right text-text-ghost select-none border-r border-border-subtle">{diff.lineRight}</td>
                      <td className="w-6 px-2 text-text-ghost text-center"> </td>
                      <td className="px-3 py-1 text-text-secondary whitespace-pre-wrap break-all">{diff.left}</td>
                    </tr>
                  );
                }
                if (diff.op === "delete") {
                  return (
                    <tr key={i} className={OP_BG.delete}>
                      <td className="w-8 px-2 py-1 text-right text-red-400 select-none border-r border-border-subtle">{diff.lineLeft}</td>
                      <td className="w-8 px-2 py-1 border-r border-border-subtle" />
                      <td className="w-6 px-2 text-red-500 text-center font-bold">−</td>
                      <td className="px-3 py-1 text-red-700 dark:text-red-300 whitespace-pre-wrap break-all">{diff.left}</td>
                    </tr>
                  );
                }
                if (diff.op === "insert") {
                  return (
                    <tr key={i} className={OP_BG.insert}>
                      <td className="w-8 px-2 py-1 border-r border-border-subtle" />
                      <td className="w-8 px-2 py-1 text-right text-emerald-500 select-none border-r border-border-subtle">{diff.lineRight}</td>
                      <td className="w-6 px-2 text-emerald-500 text-center font-bold">+</td>
                      <td className="px-3 py-1 text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap break-all">{diff.right}</td>
                    </tr>
                  );
                }
                // replace — show word-level diff
                return (
                  <tr key={i} className={OP_BG.replace}>
                    <td className="w-8 px-2 py-1 text-right text-amber-500 select-none border-r border-border-subtle">{diff.lineLeft}</td>
                    <td className="w-8 px-2 py-1 text-right text-amber-500 select-none border-r border-border-subtle">{diff.lineRight}</td>
                    <td className="w-6 px-2 text-amber-500 text-center font-bold">~</td>
                    <td className="px-3 py-1 whitespace-pre-wrap break-all">{diffWords(diff.left ?? "", diff.right ?? "")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          // Split view
          <div className="grid grid-cols-2 divide-x divide-border-subtle">
            <div>
              <div className="bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-text-secondary border-b border-border-subtle">Text A</div>
              {diffs.map((diff, i) => {
                const show = diff.op !== "insert";
                if (!show) return <div key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800/50 min-h-[24px]" />;
                return (
                  <div key={i} className={`flex gap-2 px-3 py-1 ${OP_BG[diff.op]} min-h-[24px]`}>
                    <span className={`w-6 shrink-0 text-right ${OP_LINE_BG[diff.op]} select-none`}>{diff.lineLeft}</span>
                    <span className={`whitespace-pre-wrap break-all flex-1 ${diff.op === "delete" ? "text-red-700 dark:text-red-300 line-through" : diff.op === "replace" ? "text-amber-700 dark:text-amber-300" : "text-text-secondary"}`}>
                      {diff.left}
                    </span>
                  </div>
                );
              })}
            </div>
            <div>
              <div className="bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-text-secondary border-b border-border-subtle">Text B</div>
              {diffs.map((diff, i) => {
                const show = diff.op !== "delete";
                if (!show) return <div key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800/50 min-h-[24px]" />;
                return (
                  <div key={i} className={`flex gap-2 px-3 py-1 ${OP_BG[diff.op]} min-h-[24px]`}>
                    <span className={`w-6 shrink-0 text-right ${OP_LINE_BG[diff.op]} select-none`}>{diff.lineRight}</span>
                    <span className={`whitespace-pre-wrap break-all flex-1 ${diff.op === "insert" ? "text-emerald-700 dark:text-emerald-300" : diff.op === "replace" ? "text-amber-700 dark:text-amber-300" : "text-text-secondary"}`}>
                      {diff.right}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-text-ghost">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-400" />Added</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-400" />Removed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-400" />Changed</span>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Diff Checker", href: "/diff-checker" },
            { name: "JSON Diff", href: "/json-diff" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Text Sort & Dedupe", href: "/text-sort" },
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
