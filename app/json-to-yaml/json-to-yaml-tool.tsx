"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, ArrowLeftRight } from "lucide-react";

type Mode = "json-to-yaml" | "yaml-to-json";

// ── JSON → YAML ────────────────────────────────────────────────────────────
function jsonToYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (value === null) return "null";
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") {
    // Quote strings that need it
    if (
      value === "" ||
      /[:#\[\]{},&*?|<>=!%@`]/.test(value) ||
      /^(true|false|null|yes|no|on|off)$/i.test(value) ||
      /^\s|\s$/.test(value) ||
      /^\d/.test(value)
    ) {
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        const rendered = jsonToYaml(item, indent + 1);
        if (typeof item === "object" && item !== null) {
          return `${pad}- ${rendered.trimStart()}`;
        }
        return `${pad}- ${rendered}`;
      })
      .join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const key = /[:#\[\]{},&*?|<>=!%@`\s]/.test(k) ? `"${k}"` : k;
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          return `${pad}${key}:\n${jsonToYaml(v, indent + 1)}`;
        }
        if (Array.isArray(v)) {
          if (v.length === 0) return `${pad}${key}: []`;
          return `${pad}${key}:\n${jsonToYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${jsonToYaml(v, indent)}`;
      })
      .join("\n");
  }

  return String(value);
}

// ── YAML → JSON (simple parser for common cases) ────────────────────────────
function parseYamlValue(raw: string): unknown {
  const s = raw.trim();
  if (s === "null" || s === "~") return null;
  if (s === "true" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "no" || s === "off") return false;
  if (s === "[]") return [];
  if (s === "{}") return {};
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return Number(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return s;
}

function yamlToJson(yaml: string): string {
  const lines = yaml.split("\n");
  // Simple state-machine parser
  interface Frame {
    obj: Record<string, unknown> | unknown[];
    indent: number;
    lastKey?: string;
  }

  function getIndent(line: string) {
    return line.match(/^(\s*)/)?.[1].length ?? 0;
  }

  const stack: Frame[] = [];
  let root: unknown = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.trimStart();
    if (!stripped || stripped.startsWith("#")) continue;

    const ind = getIndent(line);

    // Pop stack to correct indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= ind) {
      stack.pop();
    }

    const top = stack[stack.length - 1];

    if (stripped.startsWith("- ")) {
      // Array item
      const valRaw = stripped.slice(2).trim();
      let val: unknown;
      if (!valRaw || valRaw === "") {
        val = null;
      } else {
        val = parseYamlValue(valRaw);
      }

      if (!top || ind > (top?.indent ?? -1)) {
        const arr: unknown[] = [val];
        if (top) {
          if (Array.isArray(top.obj) && top.lastKey === undefined) {
            (top.obj as unknown[]).push(val);
            continue;
          }
          if (!Array.isArray(top.obj) && top.lastKey) {
            (top.obj as Record<string, unknown>)[top.lastKey] = arr;
          }
        }
        stack.push({ obj: arr, indent: ind });
        if (root === undefined) root = arr;
      } else if (Array.isArray(top.obj)) {
        (top.obj as unknown[]).push(val);
      }
      continue;
    }

    const colonIdx = stripped.indexOf(": ");
    const isKeyOnly = stripped.endsWith(":") && !stripped.includes(": ");
    if (colonIdx !== -1 || isKeyOnly) {
      const key = colonIdx !== -1 ? stripped.slice(0, colonIdx) : stripped.slice(0, -1);
      const valRaw = colonIdx !== -1 ? stripped.slice(colonIdx + 2).trim() : "";

      let obj: Record<string, unknown>;
      if (!top || ind === 0) {
        if (root === undefined) {
          root = {};
          stack.push({ obj: root as Record<string, unknown>, indent: -1 });
        }
        obj = root as Record<string, unknown>;
      } else {
        obj = top.obj as Record<string, unknown>;
      }

      if (valRaw === "" || valRaw === null) {
        // Nested object/array follows
        obj[key] = {};
        stack.push({ obj: obj, indent: ind, lastKey: key });
      } else {
        obj[key] = parseYamlValue(valRaw);
        if (top) top.lastKey = key;
      }
    }
  }

  return JSON.stringify(root ?? {}, null, 2);
}

const SAMPLE_JSON = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true
  },
  "database": {
    "name": "mydb",
    "pool": 5
  },
  "tags": ["web", "api", "v2"]
}`;

export function JsonToYamlTool() {
  const [mode, setMode] = useState<Mode>("json-to-yaml");
  const [input, setInput] = useState(SAMPLE_JSON);
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      if (mode === "json-to-yaml") {
        const parsed = JSON.parse(input);
        output = jsonToYaml(parsed);
      } else {
        output = yamlToJson(input);
      }
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  const swap = () => {
    setInput(output || input);
    setMode((m) => (m === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml"));
    setError("");
  };

  return (
    <ToolLayout
      title="JSON ↔ YAML Converter"
      description="Convert between JSON and YAML — bidirectional, runs entirely in your browser."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {([
            { value: "json-to-yaml" as Mode, label: "JSON → YAML" },
            { value: "yaml-to-json" as Mode, label: "YAML → JSON" },
          ]).map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setError(""); }}
              className={`tab-btn ${mode === m.value ? "active" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={swap} className="action-btn" disabled={!output}>
            <ArrowLeftRight size={13} />
            Swap
          </button>
          <button onClick={() => { setInput(""); setError(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">{mode === "json-to-yaml" ? "JSON Input" : "YAML Input"}</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder={mode === "json-to-yaml" ? '{"key": "value"}' : "key: value"}
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">{mode === "json-to-yaml" ? "YAML Output" : "JSON Output"}</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
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
            { name: "YAML to JSON", href: "/yaml-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "TOML to JSON", href: "/toml" },
            { name: "XML to JSON", href: "/xml-to-json" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
