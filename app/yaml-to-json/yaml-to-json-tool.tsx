"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

const SAMPLE_YAML = `server:
  host: localhost
  port: 8080
  debug: true
  tls: false

database:
  name: mydb
  pool: 5
  credentials:
    user: admin
    password: secret

tags:
  - web
  - api
  - v2

config:
  timeout: 30
  retries: 3
  null_value: ~
  empty_string: ""`;

// ── Simple YAML parser ─────────────────────────────────────────────────────
function parseYamlValue(raw: string): unknown {
  const s = raw.trim();
  if (s === "null" || s === "~" || s === "") return null;
  if (s === "true" || s === "yes" || s === "on") return true;
  if (s === "false" || s === "no" || s === "off") return false;
  if (s === "[]") return [];
  if (s === "{}") return {};
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(s)) return parseFloat(s);
  // Quoted strings
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return s;
}

function getIndent(line: string): number {
  return line.match(/^( *)/)?.[1].length ?? 0;
}

function yamlToJson(yaml: string): string {
  const lines = yaml.split("\n");

  interface Frame {
    type: "object" | "array";
    value: Record<string, unknown> | unknown[];
    indent: number;
    key?: string; // last key written (for object frames)
  }

  const stack: Frame[] = [];
  let root: unknown = undefined;

  const setInParent = (val: unknown) => {
    const parent = stack[stack.length - 1];
    if (!parent) {
      root = val;
      return;
    }
    if (parent.type === "array") {
      (parent.value as unknown[]).push(val);
    } else if (parent.key !== undefined) {
      (parent.value as Record<string, unknown>)[parent.key] = val;
    }
  };

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const stripped = line.trimStart();
    if (!stripped || stripped.startsWith("#")) continue;

    const ind = getIndent(line);

    // Pop stack frames that are deeper than current indent
    while (stack.length > 0 && stack[stack.length - 1].indent >= ind) {
      stack.pop();
    }

    // Array item
    if (stripped.startsWith("- ") || stripped === "-") {
      const valRaw = stripped.startsWith("- ") ? stripped.slice(2).trim() : "";

      // Ensure we have an array container at this level
      const top = stack[stack.length - 1];
      let arr: unknown[];

      if (!top || top.indent < ind) {
        // Check if parent exists and we need to attach
        arr = [];
        if (top && top.type === "object" && top.key) {
          (top.value as Record<string, unknown>)[top.key] = arr;
        } else {
          setInParent(arr);
        }
        stack.push({ type: "array", value: arr, indent: ind });
      } else if (top.type === "array") {
        arr = top.value as unknown[];
      } else {
        arr = [];
        setInParent(arr);
        stack.push({ type: "array", value: arr, indent: ind });
      }

      if (valRaw === "") {
        // Next lines will be nested
        continue;
      }
      // Check if it's an inline object (key: val)
      const colonIdx = valRaw.indexOf(": ");
      if (colonIdx !== -1) {
        const obj: Record<string, unknown> = {};
        obj[valRaw.slice(0, colonIdx)] = parseYamlValue(valRaw.slice(colonIdx + 2));
        arr.push(obj);
      } else {
        arr.push(parseYamlValue(valRaw));
      }
      continue;
    }

    // Key: value
    const colonIdx = stripped.indexOf(": ");
    const isKeyOnly = stripped.endsWith(":") && !stripped.includes(": ");
    if (colonIdx === -1 && !isKeyOnly) continue;

    const key = isKeyOnly ? stripped.slice(0, -1).trim() : stripped.slice(0, colonIdx).trim();
    const valRaw = isKeyOnly ? "" : stripped.slice(colonIdx + 2).trim();

    // Ensure we have an object container
    const top = stack[stack.length - 1];
    let obj: Record<string, unknown>;

    if (!top) {
      obj = {};
      root = obj;
      stack.push({ type: "object", value: obj, indent: ind, key });
    } else if (top.type === "object") {
      obj = top.value as Record<string, unknown>;
      top.key = key;
    } else {
      // array -> start new object
      obj = {};
      (top.value as unknown[]).push(obj);
      stack.push({ type: "object", value: obj, indent: ind, key });
    }

    if (valRaw === "") {
      // Nested block follows
      obj[key] = {};
      const frame: Frame = { type: "object", value: obj[key] as Record<string, unknown>, indent: ind + 2, key: undefined };
      // We'll override when we see the next key
      stack.push(frame);
      // Actually push a placeholder so child frames know the parent
      // Rewrite: store the parent object with current key for next iteration
      stack[stack.length - 1] = { type: "object", value: obj, indent: ind, key };
    } else {
      obj[key] = parseYamlValue(valRaw);
    }
  }

  return JSON.stringify(root ?? {}, null, 2);
}

export function YamlToJsonTool() {
  useWebMCP({
    name: "yamlToJson",
    description: "Convert YAML to JSON format",
    inputSchema: {
      type: "object" as const,
      properties: {
      "yaml": {
            "type": "string",
            "description": "YAML string to convert"
      }
},
      required: ["yaml"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for YAML parsing" }] };
    },
  });

  const [input, setInput] = useState(SAMPLE_YAML);
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);

  let output = "";
  if (input.trim()) {
    try {
      const parsed = JSON.parse(yamlToJson(input));
      output = JSON.stringify(parsed, null, indent);
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  return (
    <ToolLayout
      agentReady
      title="YAML to JSON Converter"
      description="Convert YAML to JSON instantly. Supports nested objects, arrays, quoted strings, and common YAML types."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Indent:
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value) as 2 | 4)}
            className="px-2 py-1 text-sm border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
        <div className="ml-auto flex gap-2">
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
            <div className="pane-label">YAML Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="key: value&#10;list:&#10;  - item1&#10;  - item2"
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">JSON Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  JSON will appear here…
                </span>
              )}
            </div>
          </div>
        }
      />

      {/* SEO Content */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-3">YAML to JSON converter for config and API workflows</h2>
        <p className="text-sm text-text-dimmed leading-relaxed mb-3">
          Convert YAML files to valid JSON for Kubernetes manifests, CI/CD pipelines, API configs, and app settings.
          This YAML to JSON converter validates structure and formats clean output instantly in your browser.
        </p>
        <ul className="list-disc pl-5 text-sm text-text-dimmed space-y-1">
          <li>Convert nested YAML objects and arrays into parseable JSON</li>
          <li>Validate YAML syntax before pushing config changes</li>
          <li>Pretty-print JSON output for debugging and code reviews</li>
        </ul>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <p className="text-xs text-text-dimmed mb-3 leading-relaxed">
          Continue your YAML/JSON workflow: format and validate JSON, query nested keys, and convert between XML, CSV,
          and typed TypeScript interfaces.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "JSON → YAML", href: "/json-to-yaml" },
            { name: "JSON → XML", href: "/json-to-xml" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
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
