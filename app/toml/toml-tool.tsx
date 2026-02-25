"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

// ── TOML Parser (hand-rolled, covers ~80% of TOML) ───────────────────────────

interface TomlObject { [key: string]: TomlValue }
type TomlArray = Array<TomlValue>;
type TomlValue = string | number | boolean | null | TomlArray | TomlObject;

function parseTOML(src: string): Record<string, TomlValue> {
  const root: Record<string, TomlValue> = {};
  let current = root;
  const lines = src.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum].trim();

    // Strip comments
    const commentIdx = (() => {
      let inStr = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"' && (i === 0 || line[i - 1] !== "\\")) inStr = !inStr;
        if (!inStr && line[i] === "#") return i;
      }
      return -1;
    })();
    if (commentIdx >= 0) line = line.slice(0, commentIdx).trim();
    if (!line) continue;

    // [section] or [[array-of-tables]]
    if (line.startsWith("[[")) {
      const key = line.slice(2, line.indexOf("]]")).trim();
      const parts = key.split(".");
      let obj = root;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]] as Record<string, TomlValue>;
      }
      const last = parts[parts.length - 1];
      if (!Array.isArray(obj[last])) obj[last] = [];
      const newTable: Record<string, TomlValue> = {};
      (obj[last] as TomlValue[]).push(newTable);
      current = newTable;
      continue;
    }

    if (line.startsWith("[")) {
      const key = line.slice(1, line.indexOf("]")).trim();
      const parts = key.split(".");
      let obj = root;
      for (const part of parts) {
        if (!obj[part]) obj[part] = {};
        obj = obj[part] as Record<string, TomlValue>;
      }
      current = obj;
      continue;
    }

    // key = value
    const eqIdx = line.indexOf("=");
    if (eqIdx < 0) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^["']|["']$/g, "");
    const valRaw = line.slice(eqIdx + 1).trim();

    const parts = key.split(".");
    let obj = current;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]] as Record<string, TomlValue>;
    }
    const lastKey = parts[parts.length - 1];
    obj[lastKey] = parseValue(valRaw);
  }

  return root;
}

function parseValue(raw: string): TomlValue {
  const s = raw.trim();

  // Multi-line string (basic)
  if (s.startsWith('"""') && s.endsWith('"""') && s.length >= 6)
    return s.slice(3, -3);

  // Basic string
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2)
    return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');

  // Literal string
  if (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
    return s.slice(1, -1);

  // Boolean
  if (s === "true") return true;
  if (s === "false") return false;

  // Inline array
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner, ",").map((v) => parseValue(v.trim()));
  }

  // Inline table
  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1).trim();
    const obj: Record<string, TomlValue> = {};
    if (!inner) return obj;
    for (const pair of splitTopLevel(inner, ",")) {
      const ei = pair.indexOf("=");
      if (ei < 0) continue;
      obj[pair.slice(0, ei).trim()] = parseValue(pair.slice(ei + 1).trim());
    }
    return obj;
  }

  // Number (int / float)
  if (/^-?[\d_]+$/.test(s)) return parseInt(s.replace(/_/g, ""), 10);
  if (/^-?[\d_]*\.[\d_]+$/.test(s)) return parseFloat(s.replace(/_/g, ""));
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (/^0o[0-7]+$/.test(s)) return parseInt(s.slice(2), 8);
  if (/^0b[01]+$/.test(s)) return parseInt(s.slice(2), 2);

  return s;
}

function splitTopLevel(str: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inStr = false;
  let cur = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === '"' && (i === 0 || str[i - 1] !== "\\")) inStr = !inStr;
    if (!inStr) {
      if (c === "[" || c === "{") depth++;
      else if (c === "]" || c === "}") depth--;
    }
    if (!inStr && depth === 0 && c === sep) {
      parts.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

// ── JSON → TOML serialiser ────────────────────────────────────────────────────

function jsonToTOML(obj: Record<string, TomlValue>, prefix = ""): string {
  const scalars: string[] = [];
  const tables: string[] = [];

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val === null) {
      scalars.push(`${key} = "null"`);
    } else if (typeof val === "boolean") {
      scalars.push(`${key} = ${val}`);
    } else if (typeof val === "number") {
      scalars.push(`${key} = ${val}`);
    } else if (typeof val === "string") {
      scalars.push(`${key} = ${JSON.stringify(val)}`);
    } else if (Array.isArray(val)) {
      if (val.every((v) => typeof v !== "object" || v === null)) {
        scalars.push(`${key} = [${val.map((v) => JSON.stringify(v)).join(", ")}]`);
      } else {
        for (const item of val) {
          tables.push(`\n[[${fullKey}]]`);
          if (typeof item === "object" && item !== null && !Array.isArray(item)) {
            tables.push(jsonToTOML(item as Record<string, TomlValue>, "").split("\n").filter(Boolean).join("\n"));
          }
        }
      }
    } else if (typeof val === "object") {
      tables.push(`\n[${fullKey}]`);
      tables.push(jsonToTOML(val as Record<string, TomlValue>, fullKey).split(`\n[`)[0].trim());
    }
  }

  return [...scalars, ...tables].join("\n");
}

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = "toml2json" | "json2toml";

const SAMPLE_TOML = `[server]
host = "localhost"
port = 8080
debug = true

[database]
url = "postgres://localhost/mydb"
max_connections = 10

[features]
tags = ["web", "api", "v2"]
`;

const SAMPLE_JSON = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true
  },
  "database": {
    "url": "postgres://localhost/mydb",
    "max_connections": 10
  },
  "features": {
    "tags": ["web", "api", "v2"]
  }
}`;

export function TomlTool() {
  useWebMCP({
    name: "validateTOML",
    description: "Validate TOML configuration",
    inputSchema: {
      type: "object" as const,
      properties: {
      "toml": {
            "type": "string",
            "description": "TOML content"
      }
},
      required: ["toml"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for TOML validation" }] };
    },
  });

  const [mode, setMode] = useState<Mode>("toml2json");
  const [input, setInput] = useState(mode === "toml2json" ? SAMPLE_TOML : SAMPLE_JSON);

  const switchMode = (m: Mode) => {
    setMode(m);
    setInput(m === "toml2json" ? SAMPLE_TOML : SAMPLE_JSON);
  };

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "toml2json") {
        const parsed = parseTOML(input);
        return JSON.stringify(parsed, null, 2);
      } else {
        const parsed = JSON.parse(input) as Record<string, TomlValue>;
        return jsonToTOML(parsed).trim();
      }
    } catch (e) {
      return `⚠ Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  })();

  const isError = output.startsWith("⚠");

  return (
    <ToolLayout agentReady
      title="TOML ↔ JSON Converter"
      description="Convert TOML to JSON or JSON to TOML — no dependencies, runs client-side"
    >
      <div className="flex items-center gap-2 mb-4">
        {([
          ["toml2json", "TOML → JSON"],
          ["json2toml", "JSON → TOML"],
        ] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`tab-btn ${mode === m ? "active" : ""}`}
          >
            {label}
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
              {mode === "toml2json" ? "TOML Input" : "JSON Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "toml2json" ? "Paste TOML here…" : "Paste JSON here…"}
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "toml2json" ? "JSON Output" : "TOML Output"}
            </div>
            <div
              className={`flex-1 bg-output-bg border rounded-lg overflow-auto p-3 ${
                isError ? "border-red-500/40" : "border-card-border"
              }`}
            >
              {output ? (
                <pre className={`text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all ${isError ? "text-red-400" : "text-text-primary"}`}>
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">Output will appear here…</span>
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
            { name: "YAML to JSON", href: "/yaml-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "XML Formatter", href: "/xml-formatter" },
            { name: "JSON Schema Validator", href: "/json-schema" },
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
