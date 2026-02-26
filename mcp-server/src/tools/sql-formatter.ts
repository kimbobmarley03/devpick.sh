import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "EXISTS",
  "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
  "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "FULL OUTER JOIN",
  "CROSS JOIN", "ON", "USING",
  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "DELETE",
  "CREATE TABLE", "CREATE INDEX", "CREATE VIEW", "CREATE DATABASE",
  "ALTER TABLE", "DROP TABLE", "DROP INDEX", "TRUNCATE",
  "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
  "WITH", "AS", "CASE", "WHEN", "THEN", "ELSE", "END",
  "DISTINCT", "ALL", "TOP",
  "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "CONSTRAINT",
  "INDEX", "UNIQUE", "NOT NULL", "DEFAULT", "AUTO_INCREMENT",
  "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION",
];

// Sort by length descending to match longer keywords first
const SORTED_KEYWORDS = [...KEYWORDS].sort((a, b) => b.length - a.length);

const NEWLINE_BEFORE = new Set([
  "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "FULL OUTER JOIN", "CROSS JOIN", "GROUP BY", "ORDER BY",
  "HAVING", "LIMIT", "OFFSET", "UNION", "UNION ALL", "INTERSECT", "EXCEPT",
  "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "WITH",
]);

function tokenizeSql(sql: string): Array<{ type: "keyword" | "string" | "comment" | "other"; value: string }> {
  const tokens: Array<{ type: "keyword" | "string" | "comment" | "other"; value: string }> = [];
  let i = 0;
  const upper = sql.toUpperCase();

  while (i < sql.length) {
    // Line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const comment = end === -1 ? sql.slice(i) : sql.slice(i, end + 1);
      tokens.push({ type: "comment", value: comment });
      i += comment.length;
      continue;
    }

    // Block comment
    if (sql[i] === "/" && sql[i + 1] === "*") {
      const end = sql.indexOf("*/", i + 2);
      const comment = end === -1 ? sql.slice(i) : sql.slice(i, end + 2);
      tokens.push({ type: "comment", value: comment });
      i += comment.length;
      continue;
    }

    // String literals
    if (sql[i] === "'" || sql[i] === '"' || sql[i] === "`") {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === quote && sql[j - 1] !== "\\") break;
        j++;
      }
      tokens.push({ type: "string", value: sql.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Check for keywords
    let foundKeyword = false;
    for (const kw of SORTED_KEYWORDS) {
      if (upper.startsWith(kw, i)) {
        // Ensure it's a whole word
        const after = sql[i + kw.length];
        if (!after || /\W/.test(after)) {
          tokens.push({ type: "keyword", value: kw });
          i += kw.length;
          foundKeyword = true;
          break;
        }
      }
    }
    if (foundKeyword) continue;

    // Whitespace — collect it
    if (/\s/.test(sql[i])) {
      let ws = "";
      while (i < sql.length && /\s/.test(sql[i])) ws += sql[i++];
      tokens.push({ type: "other", value: " " }); // normalize whitespace
      continue;
    }

    // Other characters
    tokens.push({ type: "other", value: sql[i++] });
  }

  return tokens;
}

function formatSql(sql: string, keywordCase: "upper" | "lower", indentSize: number): string {
  const tokens = tokenizeSql(sql.trim());
  const indent = " ".repeat(indentSize);
  let result = "";
  let parenDepth = 0;
  let lastWasNewline = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const value = token.type === "keyword"
      ? (keywordCase === "upper" ? token.value.toUpperCase() : token.value.toLowerCase())
      : token.value;

    if (token.type === "keyword") {
      const kw = token.value.toUpperCase();
      if (NEWLINE_BEFORE.has(kw) && result.trim().length > 0) {
        if (!lastWasNewline) result += "\n";
        result += indent.repeat(parenDepth) + value;
      } else {
        if (lastWasNewline) {
          result += indent.repeat(parenDepth);
        }
        result += value;
      }
      result += " ";
      lastWasNewline = false;
    } else if (token.type === "comment") {
      result += "\n" + indent.repeat(parenDepth) + value.trim() + "\n";
      lastWasNewline = true;
    } else if (token.value === "(") {
      result += "(";
      parenDepth++;
      lastWasNewline = false;
    } else if (token.value === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      result = result.trimEnd() + ")";
      lastWasNewline = false;
    } else if (token.value === ",") {
      result = result.trimEnd() + ",\n" + indent.repeat(parenDepth);
      lastWasNewline = true;
    } else if (token.value === ";") {
      result = result.trimEnd() + ";\n";
      lastWasNewline = true;
    } else if (token.value === " ") {
      if (!lastWasNewline) result += " ";
    } else {
      if (lastWasNewline) result += indent.repeat(parenDepth);
      result += value;
      lastWasNewline = false;
    }
  }

  return result.replace(/\n{3,}/g, "\n\n").trim();
}

export function registerSqlFormatter(server: McpServer) {
  server.tool(
    "format_sql",
    "Format and prettify SQL queries with proper indentation and keyword casing",
    {
      sql: z.string().describe("SQL query to format"),
      keyword_case: z
        .enum(["upper", "lower"])
        .optional()
        .default("upper")
        .describe("Keyword case: upper (SELECT) or lower (select). Default: upper"),
      indent: z.number().optional().default(2).describe("Indent spaces (default 2)"),
    },
    async ({ sql, keyword_case, indent }) => {
      try {
        const result = formatSql(sql, keyword_case, indent);
        return { content: [{ type: "text", text: result }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Formatting failed"}` }],
          isError: true,
        };
      }
    }
  );
}
