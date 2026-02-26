import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type DiffType = "added" | "removed" | "changed" | "unchanged";

interface DiffNode {
  key: string;
  type: DiffType;
  left_value?: unknown;
  right_value?: unknown;
  children?: DiffNode[];
}

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function diff(left: unknown, right: unknown, key = "root"): DiffNode {
  if (left === undefined && right !== undefined) return { key, type: "added", right_value: right };
  if (left !== undefined && right === undefined) return { key, type: "removed", left_value: left };
  if (isObj(left) && isObj(right)) {
    const allKeys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
    const children: DiffNode[] = allKeys.map((k) => diff(left[k], right[k], k));
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
  if (JSON.stringify(left) === JSON.stringify(right)) return { key, type: "unchanged", left_value: left };
  return { key, type: "changed", left_value: left, right_value: right };
}

function summarize(node: DiffNode, path = ""): string[] {
  const lines: string[] = [];
  const fullPath = path ? (node.key.startsWith("[") ? path + node.key : `${path}.${node.key}`) : node.key;
  if (node.children) {
    for (const child of node.children) {
      lines.push(...summarize(child, fullPath === "root" ? "" : fullPath));
    }
  } else {
    const p = fullPath === "root" ? "(root)" : fullPath.replace(/^\./, "");
    if (node.type === "added") lines.push(`+ ${p}: ${JSON.stringify(node.right_value)}`);
    else if (node.type === "removed") lines.push(`- ${p}: ${JSON.stringify(node.left_value)}`);
    else if (node.type === "changed") lines.push(`~ ${p}: ${JSON.stringify(node.left_value)} → ${JSON.stringify(node.right_value)}`);
  }
  return lines;
}

export function register(server: McpServer) {
  server.tool(
    "json_diff",
    "Compare two JSON objects and show a structured diff of all changes (added, removed, changed keys)",
    {
      left: z.string().describe("First (original) JSON string"),
      right: z.string().describe("Second (modified) JSON string"),
    },
    async ({ left, right }) => {
      try {
        const leftParsed = JSON.parse(left);
        const rightParsed = JSON.parse(right);
        const result = diff(leftParsed, rightParsed);
        const summary = summarize(result);
        const hasChanges = summary.length > 0;
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              has_changes: hasChanges,
              change_count: summary.length,
              summary: hasChanges ? summary : ["No differences found"],
              diff: result,
            }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
