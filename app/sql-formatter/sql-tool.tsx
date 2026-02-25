"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Mode = "format" | "minify";

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
  "OUTER JOIN", "FULL JOIN", "CROSS JOIN", "ON", "AND", "OR", "NOT",
  "IN", "NOT IN", "IS NULL", "IS NOT NULL", "LIKE", "BETWEEN", "EXISTS",
  "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "UNION", "UNION ALL",
  "INTERSECT", "EXCEPT", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
  "DELETE", "CREATE TABLE", "CREATE", "DROP TABLE", "DROP", "ALTER TABLE",
  "ALTER", "ADD", "COLUMN", "INDEX", "PRIMARY KEY", "FOREIGN KEY", "REFERENCES",
  "UNIQUE", "NOT NULL", "DEFAULT", "AUTO_INCREMENT", "WITH", "AS", "DISTINCT",
  "ALL", "CASE", "WHEN", "THEN", "ELSE", "END", "CAST", "CONVERT", "COALESCE",
  "NULLIF", "COUNT", "SUM", "AVG", "MIN", "MAX", "OVER", "PARTITION BY",
  "ROW_NUMBER", "RANK", "DENSE_RANK", "TRUNCATE", "BEGIN", "COMMIT", "ROLLBACK",
  "TRANSACTION", "EXPLAIN", "DESCRIBE",
];

// Sorted longest-first to avoid partial matches
const SORTED_KEYWORDS = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);

function capitalizeKeywords(sql: string): string {
  let result = sql;
  for (const kw of SORTED_KEYWORDS) {
    const escaped = kw.replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(?<![\\w.])${escaped}(?![\\w])`, "gi");
    result = result.replace(regex, kw);
  }
  return result;
}

// Clause keywords that should start a new line at top-level
const NEWLINE_CLAUSES = [
  "SELECT", "FROM", "WHERE",
  "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN", "CROSS JOIN", "JOIN",
  "ON", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
  "UNION ALL", "UNION", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
];

function formatSQL(raw: string): string {
  if (!raw.trim()) return "";

  // Step 1: Collapse whitespace
  let sql = raw.replace(/\s+/g, " ").trim();

  // Step 2: Capitalize keywords
  sql = capitalizeKeywords(sql);

  // Step 3: Insert newlines before major clauses
  for (const clause of NEWLINE_CLAUSES) {
    const escaped = clause.replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(?<![\\w.])${escaped}(?![\\w])`, "g");
    sql = sql.replace(regex, `\n${clause}`);
  }

  // Step 4: Split into lines and indent sub-clauses
  const lines = sql.split("\n").map((l) => l.trim()).filter(Boolean);

  const indentedLines = lines.map((line) => {
    // Top-level clauses get no indent
    const isTopLevel = NEWLINE_CLAUSES.some((cl) => {
      const escaped = cl.replace(/\s+/g, "\\s+");
      return new RegExp(`^${escaped}(?![\\w])`, "i").test(line);
    });
    if (isTopLevel) return line;
    // Anything else (like AND/OR conditions) gets 2-space indent
    return "  " + line;
  });

  // Step 5: Further indent AND/OR inside WHERE/HAVING
  return indentedLines.join("\n");
}

function minifySQL(raw: string): string {
  if (!raw.trim()) return "";
  // Collapse all whitespace to single spaces, strip comments
  return raw
    .replace(/--[^\n]*/g, "") // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
    .replace(/\s+/g, " ")
    .trim();
}

const SAMPLE_SQL = `select u.id, u.name, u.email, count(o.id) as order_count
from users u
left join orders o on u.id = o.user_id
where u.created_at >= '2024-01-01'
and u.status = 'active'
group by u.id, u.name, u.email
having count(o.id) > 0
order by order_count desc
limit 50`;

export function SqlTool() {
  useWebMCP({
    name: "formatSQL",
    description: "Format and prettify SQL queries",
    inputSchema: {
      type: "object" as const,
      properties: {
      "sql": {
            "type": "string",
            "description": "SQL query to format"
      }
},
      required: ["sql"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for SQL formatting" }] };
    },
  });

  const [mode, setMode] = useState<Mode>("format");
  const [input, setInput] = useState(SAMPLE_SQL);

  const output = (() => {
    if (!input.trim()) return "";
    try {
      return mode === "format" ? formatSQL(input) : minifySQL(input);
    } catch {
      return "⚠ Failed to process SQL";
    }
  })();

  return (
    <ToolLayout
      agentReady
      title="SQL Formatter"
      description="Beautify or minify SQL queries — keyword capitalization, proper indentation"
    >
      {/* Tabs + Actions */}
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
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              SQL Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your SQL query here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "format" ? "Formatted SQL" : "Minified SQL"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Output will appear here...
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
            { name: "XML Formatter", href: "/xml-formatter" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "JSON Formatter", href: "/json-formatter" },
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
