"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Action =
  | "sort-az"
  | "sort-za"
  | "sort-length"
  | "sort-length-desc"
  | "reverse"
  | "shuffle"
  | "dedupe"
  | "trim"
  | "remove-empty";

const ACTIONS: { id: Action; label: string; desc: string }[] = [
  { id: "sort-az", label: "Sort A→Z", desc: "Alphabetical ascending" },
  { id: "sort-za", label: "Sort Z→A", desc: "Alphabetical descending" },
  { id: "sort-length", label: "By Length ↑", desc: "Shortest first" },
  { id: "sort-length-desc", label: "By Length ↓", desc: "Longest first" },
  { id: "reverse", label: "Reverse", desc: "Flip line order" },
  { id: "shuffle", label: "Shuffle", desc: "Random order" },
  { id: "dedupe", label: "Deduplicate", desc: "Remove duplicate lines" },
  { id: "trim", label: "Trim Whitespace", desc: "Strip leading/trailing spaces" },
  { id: "remove-empty", label: "Remove Empty", desc: "Delete blank lines" },
];

function processLines(input: string, action: Action): { output: string; stats: string } {
  const lines = input.split("\n");
  const originalCount = lines.length;
  let result: string[];

  switch (action) {
    case "sort-az":
      result = [...lines].sort((a, b) => a.localeCompare(b));
      return { output: result.join("\n"), stats: `${originalCount} lines sorted A→Z` };
    case "sort-za":
      result = [...lines].sort((a, b) => b.localeCompare(a));
      return { output: result.join("\n"), stats: `${originalCount} lines sorted Z→A` };
    case "sort-length":
      result = [...lines].sort((a, b) => a.length - b.length);
      return { output: result.join("\n"), stats: `${originalCount} lines sorted by length (shortest first)` };
    case "sort-length-desc":
      result = [...lines].sort((a, b) => b.length - a.length);
      return { output: result.join("\n"), stats: `${originalCount} lines sorted by length (longest first)` };
    case "reverse":
      result = [...lines].reverse();
      return { output: result.join("\n"), stats: `${originalCount} lines reversed` };
    case "shuffle": {
      result = [...lines];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return { output: result.join("\n"), stats: `${originalCount} lines shuffled` };
    }
    case "dedupe": {
      const seen = new Set<string>();
      result = lines.filter((l) => {
        if (seen.has(l)) return false;
        seen.add(l);
        return true;
      });
      const removed = originalCount - result.length;
      return { output: result.join("\n"), stats: `Removed ${removed} duplicate line${removed !== 1 ? "s" : ""} (${result.length} unique)` };
    }
    case "trim":
      result = lines.map((l) => l.trim());
      return { output: result.join("\n"), stats: `${originalCount} lines trimmed` };
    case "remove-empty": {
      result = lines.filter((l) => l.trim() !== "");
      const removed = originalCount - result.length;
      return { output: result.join("\n"), stats: `Removed ${removed} empty line${removed !== 1 ? "s" : ""} (${result.length} remaining)` };
    }
  }
}

const SAMPLE = `banana
apple
cherry
apple
date
banana
fig
cherry`;

export function TextSortTool() {
  useWebMCP({
    name: "sortText",
    description: "Sort lines of text alphabetically and optionally deduplicate",
    inputSchema: {
      type: "object" as const,
      properties: {
      "text": {
            "type": "string",
            "description": "Text with lines to sort"
      },
      "dedupe": {
            "type": "string",
            "description": "Remove duplicates (default false)"
      }
},
      required: ["text"],
    },
    execute: async (params) => {
      let lines = (params.text as string).split("\n"); lines.sort(); if (params.dedupe) lines = [...new Set(lines)]; return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  });

  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState("");
  const [lastAction, setLastAction] = useState<Action | null>(null);

  const apply = useCallback(
    (action: Action) => {
      if (!input.trim()) return;
      const src = output && lastAction ? output : input;
      const { output: out, stats: s } = processLines(src, action);
      setOutput(out);
      setStats(s);
      setLastAction(action);
    },
    [input, output, lastAction]
  );

  const reset = () => {
    setOutput("");
    setStats("");
    setLastAction(null);
  };

  const lineCount = (output || input).split("\n").length;

  return (
    <ToolLayout agentReady
      title="Text Sort & Dedupe"
      description="Sort lines alphabetically, by length, shuffle, deduplicate, trim whitespace, or remove empty lines"
    >
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => apply(a.id)}
            className={`tab-btn ${lastAction === a.id ? "active" : ""}`}
            title={a.desc}
            disabled={!input.trim()}
          >
            {a.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={reset} className="action-btn" disabled={!output}>
            <Trash2 size={13} />
            Reset
          </button>
          <CopyButton text={output || input} />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-3 px-3 py-2 bg-success/10 border border-success/20 rounded-lg text-xs text-success font-mono">
          ✓ {stats}
        </div>
      )}

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">Input ({input.split("\n").length} lines)</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutput(""); setStats(""); setLastAction(null); }}
              placeholder="Paste your text here, one item per line..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              Output {output ? `(${lineCount} lines)` : ""}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Select an action to process your text...
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
            { name: "Case Converter", href: "/case-converter" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Diff Checker", href: "/diff-checker" },
            { name: "Lorem Ipsum", href: "/lorem-ipsum-generator" },
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
