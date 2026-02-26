import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type DiffLineType = "added" | "removed" | "unchanged";

interface DiffLine {
  type: DiffLineType;
  text: string;
  line_number?: number;
}

// LCS-based line diff
function computeDiff(oldLines: string[], newLines: string[]): { left: DiffLine[]; right: DiffLine[] } {
  const m = oldLines.length;
  const n = newLines.length;

  // Build DP table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = oldLines[i] === newLines[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let i = 0, j = 0, leftNum = 1, rightNum = 1;

  while (i < m || j < n) {
    if (i < m && j < n && oldLines[i] === newLines[j]) {
      left.push({ type: "unchanged", text: oldLines[i], line_number: leftNum++ });
      right.push({ type: "unchanged", text: newLines[j], line_number: rightNum++ });
      i++; j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      left.push({ type: "added", text: "" });
      right.push({ type: "added", text: newLines[j], line_number: rightNum++ });
      j++;
    } else {
      left.push({ type: "removed", text: oldLines[i], line_number: leftNum++ });
      right.push({ type: "removed", text: "" });
      i++;
    }
  }

  return { left, right };
}

export function register(server: McpServer) {
  server.tool(
    "text_diff",
    "Compare two text strings line-by-line and show added, removed, and unchanged lines",
    {
      text1: z.string().describe("First (original) text"),
      text2: z.string().describe("Second (modified) text"),
      unified: z.boolean().optional().default(true).describe("If true, return unified diff format; otherwise return structured diff"),
    },
    async ({ text1, text2, unified }) => {
      const oldLines = text1.split("\n");
      const newLines = text2.split("\n");
      const { left, right } = computeDiff(oldLines, newLines);

      const added = right.filter((l) => l.type === "added" && l.text !== "").length;
      const removed = left.filter((l) => l.type === "removed" && l.text !== "").length;
      const unchanged = left.filter((l) => l.type === "unchanged").length;

      if (unified) {
        // Build unified diff output
        const lines: string[] = [];
        for (let k = 0; k < left.length; k++) {
          const l = left[k];
          const r = right[k];
          if (l.type === "unchanged") {
            lines.push(`  ${l.text}`);
          } else if (l.type === "removed" && l.text !== "") {
            lines.push(`- ${l.text}`);
          }
          if (r.type === "added" && r.text !== "") {
            lines.push(`+ ${r.text}`);
          }
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              summary: { added, removed, unchanged },
              diff: lines.join("\n"),
            }, null, 2),
          }],
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            summary: { added, removed, unchanged },
            left,
            right,
          }, null, 2),
        }],
      };
    }
  );
}
