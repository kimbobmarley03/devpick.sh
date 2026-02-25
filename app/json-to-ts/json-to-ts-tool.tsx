"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

function toInterfaceName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function getType(value: unknown, name: string, interfaces: Map<string, string>): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
  if (typeof value === "string") return "string";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemType = getType(value[0], name + "Item", interfaces);
    return `${itemType}[]`;
  }

  if (typeof value === "object") {
    const ifaceName = toInterfaceName(name);
    buildInterface(value as Record<string, unknown>, ifaceName, interfaces);
    return ifaceName;
  }

  return "unknown";
}

function buildInterface(
  obj: Record<string, unknown>,
  name: string,
  interfaces: Map<string, string>
): void {
  if (interfaces.has(name)) return;

  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    const childName = toInterfaceName(name + "_" + key);
    const type = getType(value, childName, interfaces);
    lines.push(`  ${safeKey}: ${type};`);
  }

  interfaces.set(name, `interface ${name} {\n${lines.join("\n")}\n}`);
}

function jsonToTs(json: string, rootName: string): string {
  const parsed = JSON.parse(json);
  const interfaces = new Map<string, string>();

  const safeName = toInterfaceName(rootName) || "Root";

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      return `type ${safeName} = unknown[];`;
    }
    buildInterface(parsed[0] as Record<string, unknown>, safeName + "Item", interfaces);
    interfaces.set("__root__", `type ${safeName} = ${safeName}Item[];`);
  } else if (typeof parsed === "object" && parsed !== null) {
    buildInterface(parsed as Record<string, unknown>, safeName, interfaces);
  } else {
    return `type ${safeName} = ${typeof parsed};`;
  }

  // Root type alias last, others first
  const rootAlias = interfaces.get("__root__");
  interfaces.delete("__root__");

  const parts = Array.from(interfaces.values());
  if (rootAlias) parts.push(rootAlias);
  return parts.join("\n\n");
}

const EXAMPLE = `{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "active": true,
  "score": 98.5,
  "tags": ["admin", "user"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  }
}`;

export function JsonToTsTool() {
  useWebMCP({
    name: "jsonToTS",
    description: "Generate TypeScript types from JSON",
    inputSchema: {
      type: "object" as const,
      properties: {
      "json": {
            "type": "string",
            "description": "JSON to convert"
      }
},
      required: ["json"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for type generation" }] };
    },
  });

  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");

  const { output, error } = (() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: jsonToTs(input.trim(), rootName || "Root"), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  })();

  return (
    <ToolLayout agentReady
      title="JSON → TypeScript"
      description="Convert JSON to TypeScript interfaces — handles nested objects, arrays, and primitives"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider whitespace-nowrap">
            Root name
          </label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="tool-textarea text-sm font-mono"
            style={{ width: "140px", height: "34px", padding: "6px 10px", resize: "none" }}
            placeholder="Root"
            spellCheck={false}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setInput(EXAMPLE)} className="action-btn">
            Example
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
              JSON Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              TypeScript Output
            </div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[#ef4444] font-mono text-[13px]">⚠ {error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  TypeScript interfaces will appear here...
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
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "CSV to JSON", href: "/csv-formatter" },
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
