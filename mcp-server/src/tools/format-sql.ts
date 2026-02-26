import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

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

const SORTED_KEYWORDS = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);

const NEWLINE_CLAUSES = [
  "SELECT", "FROM", "WHERE",
  "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN", "CROSS JOIN", "JOIN",
  "ON", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
  "UNION ALL", "UNION", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
];

function capitalizeKeywords(sql: string): string {
  let result = sql;
  for (const kw of SORTED_KEYWORDS) {
    const escaped = kw.replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(?<![\\w.])${escaped}(?![\\w])`, "gi");
    result = result.replace(regex, kw);
  }
  return result;
}

function formatSQL(raw: string): string {
  if (!raw.trim()) return "";
  let sql = raw.replace(/\s+/g, " ").trim();
  sql = capitalizeKeywords(sql);
  for (const clause of NEWLINE_CLAUSES) {
    const escaped = clause.replace(/\s+/g, "\\s+");
    const regex = new RegExp(`(?<![\\w.])${escaped}(?![\\w])`, "g");
    sql = sql.replace(regex, `\n${clause}`);
  }
  const lines = sql.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    const isTopLevel = NEWLINE_CLAUSES.some((cl) => {
      const escaped = cl.replace(/\s+/g, "\\s+");
      return new RegExp(`^${escaped}(?![\\w])`, "i").test(line);
    });
    return isTopLevel ? line : "  " + line;
  }).join("\n");
}

function minifySQL(raw: string): string {
  if (!raw.trim()) return "";
  return raw
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function register(server: McpServer) {
  server.tool(
    "format_sql",
    "Format and prettify SQL queries with keyword capitalization and proper indentation",
    {
      sql: z.string().describe("SQL query to format"),
      minify: z.boolean().optional().default(false).describe("If true, minify instead of format"),
    },
    async ({ sql, minify }) => {
      try {
        const output = minify ? minifySQL(sql) : formatSQL(sql);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
