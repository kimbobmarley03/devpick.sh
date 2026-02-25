"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

type DiffType = "added" | "removed" | "unchanged";

interface DiffLine {
  type: DiffType;
  text: string;
  lineNum?: number;
}

// Simple LCS-based line diff
function computeDiff(oldLines: string[], newLines: string[]): { left: DiffLine[]; right: DiffLine[] } {
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const left: DiffLine[] = [];
  const right: DiffLine[] = [];

  let i = 0, j = 0;
  let leftLineNum = 1, rightLineNum = 1;

  while (i < m || j < n) {
    if (i < m && j < n && oldLines[i] === newLines[j]) {
      // Unchanged
      left.push({ type: "unchanged", text: oldLines[i], lineNum: leftLineNum++ });
      right.push({ type: "unchanged", text: newLines[j], lineNum: rightLineNum++ });
      i++;
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      // Added in new
      left.push({ type: "added", text: "" }); // placeholder on left side
      right.push({ type: "added", text: newLines[j], lineNum: rightLineNum++ });
      j++;
    } else {
      // Removed from old
      left.push({ type: "removed", text: oldLines[i], lineNum: leftLineNum++ });
      right.push({ type: "removed", text: "" }); // placeholder on right side
      i++;
    }
  }

  return { left, right };
}

const LINE_COLORS: Record<DiffType, string> = {
  added: "bg-green-500/10 text-green-300 border-l-2 border-green-500/50",
  removed: "bg-red-500/10 text-red-300 border-l-2 border-red-500/50",
  unchanged: "text-text-dimmed",
};

const PLACEHOLDER_COLORS: Record<DiffType, string> = {
  added: "bg-green-500/5 border-l-2 border-green-500/20",
  removed: "bg-red-500/5 border-l-2 border-red-500/20",
  unchanged: "",
};

function DiffPanel({ lines, side }: { lines: DiffLine[]; side: "left" | "right" }) {
  return (
    <div className="output-panel flex-1">
      {lines.length === 0 ? (
        <span className="text-text-ghost p-3 block">
          {side === "left" ? "Original text..." : "Modified text..."}
        </span>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const isPlaceholder = line.text === "" && line.type !== "unchanged";
              return (
                <tr key={idx} className={isPlaceholder ? PLACEHOLDER_COLORS[line.type] : LINE_COLORS[line.type]}>
                  <td className="w-10 text-right pr-3 pl-2 py-0.5 text-text-muted select-none border-r border-border-subtle shrink-0">
                    {line.lineNum ?? ""}
                  </td>
                  <td className="px-3 py-0.5 whitespace-pre-wrap break-all">
                    {isPlaceholder ? "\u00A0" : line.text || "\u00A0"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const SAMPLE_LEFT = `function greet(name) {
  console.log("Hello, " + name);
  return name;
}

const result = greet("World");
console.log(result);`;

const SAMPLE_RIGHT = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
  return \`\${greeting}, \${name}!\`;
}

const result = greet("World", "Hi");
console.log("Result:", result);`;

export function DiffTool() {
  const [leftText, setLeftText] = useState(SAMPLE_LEFT);
  const [rightText, setRightText] = useState(SAMPLE_RIGHT);
  const [showInputs, setShowInputs] = useState(true);

  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");

  const { left, right } = useMemo(
    () => computeDiff(leftLines, rightLines),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leftText, rightText]
  );

  const added = right.filter((l) => l.type === "added" && l.text !== "").length;
  const removed = left.filter((l) => l.type === "removed" && l.text !== "").length;
  const unchanged = left.filter((l) => l.type === "unchanged").length;

  return (
    <ToolLayout
      title="Diff Checker"
      description="Compare two texts side by side — highlights added, removed, and unchanged lines"
    >
      {/* Stats + Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-3 text-sm font-mono">
          <span className="text-green-400">+{added} added</span>
          <span className="text-red-400">−{removed} removed</span>
          <span className="text-text-dimmed">{unchanged} unchanged</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowInputs(!showInputs)}
            className="action-btn"
          >
            {showInputs ? "Hide" : "Show"} Inputs
          </button>
          <button
            onClick={() => { setLeftText(""); setRightText(""); }}
            className="action-btn"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Input textareas */}
      {showInputs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Original</div>
            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder="Paste original text here..."
              className="tool-textarea"
              style={{ minHeight: "160px" }}
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Modified</div>
            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder="Paste modified text here..."
              className="tool-textarea"
              style={{ minHeight: "160px" }}
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Diff output */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Diff View</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col min-h-[300px]">
          <div className="text-xs text-text-dimmed mb-2 font-mono flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500/60" />
            Original
          </div>
          <DiffPanel lines={left} side="left" />
        </div>
        <div className="flex flex-col min-h-[300px]">
          <div className="text-xs text-text-dimmed mb-2 font-mono flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500/60" />
            Modified
          </div>
          <DiffPanel lines={right} side="right" />
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "Text Sort & Dedupe", href: "/text-sort" },
            { name: "Markdown Preview", href: "/markdown-preview" },
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
