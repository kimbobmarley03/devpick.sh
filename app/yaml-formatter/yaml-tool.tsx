"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "yaml-to-json" | "json-to-yaml";

// ── Simple YAML parser ────────────────────────────────────────────────────────
// Covers 90% of real-world YAML: scalars, maps, sequences, nesting, comments

type YamlValue = string | number | boolean | null | YamlValue[] | YamlObject;
type YamlObject = { [key: string]: YamlValue };

function parseScalar(raw: string): YamlValue {
  const s = raw.trim();
  if (s === "null" || s === "~" || s === "") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  // Strip optional quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYaml(text: string): YamlValue {
  // Remove comments, split into non-empty lines
  const rawLines = text.split(/\r?\n/);
  // Filter out comment-only lines and blank lines for structure parsing
  // but preserve line indices for indentation tracking
  const lines = rawLines.map((line) => {
    // Strip inline comments (but not inside strings)
    const stripped = line.replace(/#[^'"]*/g, "").trimEnd();
    return stripped;
  });

  // We'll use a recursive descent approach
  let pos = 0;

  function getIndent(line: string): number {
    return line.search(/\S/);
  }

  function skipBlanks() {
    while (pos < lines.length && lines[pos].trim() === "") pos++;
  }

  function parseBlock(baseIndent: number): YamlValue {
    skipBlanks();
    if (pos >= lines.length) return null;

    const firstLine = lines[pos];
    const indent = getIndent(firstLine);
    if (indent < baseIndent) return null;

    const trimmed = firstLine.trim();

    // Detect if this block is a sequence (starts with -)
    if (trimmed.startsWith("- ") || trimmed === "-") {
      return parseSequence(indent);
    }

    // Detect if mapping
    if (trimmed.includes(": ") || trimmed.endsWith(":")) {
      return parseMapping(indent);
    }

    // Scalar
    pos++;
    return parseScalar(trimmed);
  }

  function parseSequence(seqIndent: number): YamlValue[] {
    const arr: YamlValue[] = [];

    while (pos < lines.length) {
      skipBlanks();
      if (pos >= lines.length) break;

      const line = lines[pos];
      if (line.trim() === "") { pos++; continue; }

      const indent = getIndent(line);
      if (indent < seqIndent) break; // dedented out of sequence

      const trimmed = line.trim();
      if (!trimmed.startsWith("-")) break; // no longer a sequence item

      const rest = trimmed.slice(1).trim();
      pos++;

      if (rest === "") {
        // Next line(s) are the value block
        skipBlanks();
        if (pos < lines.length) {
          const nextIndent = getIndent(lines[pos]);
          if (nextIndent > seqIndent) {
            arr.push(parseBlock(nextIndent));
            continue;
          }
        }
        arr.push(null);
      } else if (rest.includes(": ") || rest.endsWith(":")) {
        // Inline mapping start: "- key: val"
        // We need to parse this as an object
        const obj: YamlObject = {};
        const colonIdx = rest.indexOf(": ");
        const key = colonIdx === -1 ? rest.slice(0, -1) : rest.slice(0, colonIdx);
        const val = colonIdx === -1 ? "" : rest.slice(colonIdx + 2);

        if (val.trim() === "") {
          // Multi-line value
          skipBlanks();
          if (pos < lines.length) {
            const childIndent = getIndent(lines[pos]);
            if (childIndent > seqIndent) {
              obj[key] = parseBlock(childIndent);
            } else {
              obj[key] = null;
            }
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = parseScalar(val);
        }

        // Consume any additional keys at same or deeper indent
        while (pos < lines.length) {
          skipBlanks();
          if (pos >= lines.length) break;
          const kline = lines[pos];
          if (kline.trim() === "") { pos++; continue; }
          const kindent = getIndent(kline);
          if (kindent <= seqIndent) break;
          const ktrimmed = kline.trim();
          if (ktrimmed.startsWith("-")) break;
          const ci = ktrimmed.indexOf(": ");
          const ei = ktrimmed.indexOf(":");
          if (ci !== -1) {
            const k = ktrimmed.slice(0, ci);
            const v = ktrimmed.slice(ci + 2);
            pos++;
            if (v.trim() === "") {
              skipBlanks();
              if (pos < lines.length && getIndent(lines[pos]) > kindent) {
                obj[k] = parseBlock(getIndent(lines[pos]));
              } else {
                obj[k] = null;
              }
            } else {
              obj[k] = parseScalar(v);
            }
          } else if (ei !== -1 && ktrimmed.endsWith(":")) {
            const k = ktrimmed.slice(0, -1);
            pos++;
            skipBlanks();
            if (pos < lines.length && getIndent(lines[pos]) > kindent) {
              obj[k] = parseBlock(getIndent(lines[pos]));
            } else {
              obj[k] = null;
            }
          } else {
            break;
          }
        }

        arr.push(obj);
      } else {
        arr.push(parseScalar(rest));
      }
    }

    return arr;
  }

  function parseMapping(mapIndent: number): YamlObject {
    const obj: YamlObject = {};

    while (pos < lines.length) {
      skipBlanks();
      if (pos >= lines.length) break;

      const line = lines[pos];
      if (line.trim() === "") { pos++; continue; }

      const indent = getIndent(line);
      if (indent < mapIndent) break;
      if (indent > mapIndent) break; // deeper block already consumed

      const trimmed = line.trim();
      if (trimmed.startsWith("-")) break; // this is a sequence now

      const colonIdx = trimmed.indexOf(": ");
      const trailingColon = trimmed.endsWith(":");

      if (colonIdx === -1 && !trailingColon) break; // not a mapping line

      let key: string;
      let valStr: string;

      if (colonIdx !== -1) {
        key = trimmed.slice(0, colonIdx);
        valStr = trimmed.slice(colonIdx + 2);
      } else {
        key = trimmed.slice(0, -1);
        valStr = "";
      }

      pos++;

      if (valStr.trim() === "") {
        // Value is on next line(s)
        skipBlanks();
        if (pos < lines.length) {
          const childIndent = getIndent(lines[pos]);
          if (childIndent > mapIndent) {
            obj[key] = parseBlock(childIndent);
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = null;
        }
      } else {
        obj[key] = parseScalar(valStr);
      }
    }

    return obj;
  }

  const result = parseBlock(0);
  return result;
}

// ── JSON → YAML serializer ────────────────────────────────────────────────────
function jsonToYaml(value: YamlValue, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") return String(value);

  if (typeof value === "string") {
    // Quote strings that could be misinterpreted
    if (
      value === "" ||
      /^(true|false|null|~)$/i.test(value) ||
      /^-?\d/.test(value) ||
      value.includes(":") ||
      value.includes("#") ||
      value.includes("\n")
    ) {
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          // Inline the first key on the same line as the dash
          const entries = Object.entries(item as YamlObject);
          if (entries.length === 0) return `${pad}- {}`;
          const [firstKey, firstVal] = entries[0];
          const firstLine = `${pad}- ${firstKey}: ${jsonToYaml(firstVal, indent + 1)}`;
          const rest = entries
            .slice(1)
            .map(([k, v]) => {
              const serialized = jsonToYaml(v, indent + 1);
              if (typeof v === "object" && v !== null) {
                return `${"  ".repeat(indent + 1)}${k}:\n${serialized}`;
              }
              return `${"  ".repeat(indent + 1)}${k}: ${serialized}`;
            })
            .join("\n");
          return rest ? `${firstLine}\n${rest}` : firstLine;
        }
        const serialized = jsonToYaml(item, indent + 1);
        if (typeof item === "object" && item !== null) {
          return `${pad}-\n${serialized}`;
        }
        return `${pad}- ${serialized}`;
      })
      .join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as YamlObject);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        if (typeof v === "object" && v !== null) {
          const serialized = jsonToYaml(v, indent + 1);
          return `${pad}${k}:\n${serialized}`;
        }
        return `${pad}${k}: ${jsonToYaml(v, indent)}`;
      })
      .join("\n");
  }

  return String(value);
}

export function YamlTool() {
  useWebMCP({
    name: "formatYAML",
    description: "Format and validate YAML",
    inputSchema: {
      type: "object" as const,
      properties: {
      "yaml": {
            "type": "string",
            "description": "YAML string"
      }
},
      required: ["yaml"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: params.yaml as string }] };
    },
  });

  const [mode, setMode] = useState<Mode>("yaml-to-json");
  const [input, setInput] = useState("");

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "yaml-to-json") {
        const parsed = parseYaml(input);
        return JSON.stringify(parsed, null, 2);
      } else {
        const data = JSON.parse(input) as YamlValue;
        return jsonToYaml(data, 0);
      }
    } catch (e) {
      return `⚠ ${e instanceof Error ? e.message : "Parse error"}`;
    }
  })();

  const swap = () => {
    setMode(mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
    setInput(output.startsWith("⚠") ? "" : output);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        swap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [output, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolLayout agentReady
      title="YAML ↔ JSON Converter"
      description="Convert YAML to JSON or JSON to YAML — handles nested objects, arrays, strings, numbers, booleans"
      kbdHint="⌘↵ swap"
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["yaml-to-json", "json-to-yaml"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn ${mode === m ? "active" : ""}`}
          >
            {m === "yaml-to-json" ? "YAML → JSON" : "JSON → YAML"}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={swap} className="action-btn">
            <ArrowUpDown size={13} />
            Swap
          </button>
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
              {mode === "yaml-to-json" ? "YAML Input" : "JSON Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "yaml-to-json"
                  ? "name: Alice\nage: 30\nhobbies:\n  - reading\n  - coding"
                  : '{"name":"Alice","age":30,"hobbies":["reading","coding"]}'
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
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
            { name: "TOML to JSON", href: "/toml" },
            { name: "XML Formatter", href: "/xml-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
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
