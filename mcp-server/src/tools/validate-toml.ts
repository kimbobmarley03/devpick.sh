import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Basic TOML validator — covers common TOML constructs
type TomlValue = string | number | boolean | null | Date | TomlValue[] | TomlTable;
type TomlTable = { [key: string]: TomlValue };

function parseTomlValue(raw: string): TomlValue {
  const s = raw.trim();
  if (s === "true") return true;
  if (s === "false") return false;

  // Integer / float
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+(?:[eE][+-]?\d+)?$/.test(s)) return parseFloat(s);

  // Quoted strings
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);

  // Inline arrays
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseTomlValue(item.trim()));
  }

  // Dates (ISO 8601)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);

  throw new Error(`Cannot parse TOML value: ${s}`);
}

function parseToml(text: string): TomlTable {
  const result: TomlTable = {};
  let current: TomlTable = result;
  let currentPath: string[] = [];

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    // Strip comments
    const line = lines[i].replace(/#.*$/, "").trim();
    if (!line) continue;

    // Table header [section] or [[array of tables]]
    if (line.startsWith("[[") && line.endsWith("]]")) {
      const key = line.slice(2, -2).trim();
      currentPath = key.split(".");
      // Navigate to parent
      let parent: TomlTable = result;
      for (let j = 0; j < currentPath.length - 1; j++) {
        const k = currentPath[j];
        if (!parent[k]) parent[k] = {};
        parent = parent[k] as TomlTable;
      }
      const lastKey = currentPath[currentPath.length - 1];
      if (!Array.isArray(parent[lastKey])) parent[lastKey] = [];
      const newTable: TomlTable = {};
      (parent[lastKey] as TomlValue[]).push(newTable);
      current = newTable;
      continue;
    }

    if (line.startsWith("[") && line.endsWith("]")) {
      const key = line.slice(1, -1).trim();
      currentPath = key.split(".");
      current = result;
      for (const k of currentPath) {
        if (!current[k]) current[k] = {};
        current = current[k] as TomlTable;
      }
      continue;
    }

    // Key = value
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) throw new Error(`Invalid TOML at line ${i + 1}: ${line}`);
    const key = line.slice(0, eqIdx).trim();
    const valRaw = line.slice(eqIdx + 1).trim();
    current[key] = parseTomlValue(valRaw);
  }

  return result;
}

export function register(server: McpServer) {
  server.tool(
    "validate_toml",
    "Validate TOML and report any syntax errors",
    {
      toml: z.string().describe("TOML string to validate"),
    },
    async ({ toml }) => {
      try {
        const parsed = parseToml(toml);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ valid: true, parsed }, null, 2),
          }],
        };
      } catch (e) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ valid: false, error: e instanceof Error ? e.message : "Invalid TOML" }),
          }],
        };
      }
    }
  );
}
