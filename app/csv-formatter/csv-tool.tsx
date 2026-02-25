"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "csv-to-json" | "json-to-csv";
type Delimiter = "," | "\t" | ";";

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCsv(text: string, delimiter: Delimiter): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        let field = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            field += '"';
            i += 2;
          } else if (line[i] === '"') {
            i++; // skip closing quote
            break;
          } else {
            field += line[i++];
          }
        }
        fields.push(field);
        if (line[i] === delimiter) i++; // skip delimiter
      } else {
        const end = line.indexOf(delimiter, i);
        if (end === -1) {
          fields.push(line.slice(i));
          break;
        } else {
          fields.push(line.slice(i, end));
          i = end + 1;
        }
      }
    }
    return fields;
  };

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    return obj;
  });
}

// ── JSON → CSV serializer ─────────────────────────────────────────────────────
function jsonToCsv(json: string, delimiter: Delimiter): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data) || data.length === 0) return "";

  const escapeField = (val: unknown): string => {
    const s = val == null ? "" : String(val);
    if (s.includes('"') || s.includes(delimiter) || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headers = Object.keys(data[0]);
  const rows = data.map((row: Record<string, unknown>) =>
    headers.map((h) => escapeField(row[h])).join(delimiter)
  );
  return [headers.join(delimiter), ...rows].join("\n");
}

const DELIMITER_LABELS: Record<Delimiter, string> = {
  ",": "Comma",
  "\t": "Tab",
  ";": "Semicolon",
};

export function CsvTool() {
  useWebMCP({
    name: "formatCSV",
    description: "Format and align CSV data",
    inputSchema: {
      type: "object" as const,
      properties: {
      "csv": {
            "type": "string",
            "description": "CSV data"
      }
},
      required: ["csv"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: params.csv as string }] };
    },
  });

  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "csv-to-json") {
        const data = parseCsv(input, delimiter);
        return JSON.stringify(data, null, 2);
      } else {
        return jsonToCsv(input, delimiter);
      }
    } catch (e) {
      return `⚠ ${e instanceof Error ? e.message : "Parse error"}`;
    }
  })();

  const swap = () => {
    setMode(mode === "csv-to-json" ? "json-to-csv" : "csv-to-json");
    setInput(output.startsWith("⚠") ? "" : output);
  };

  return (
    <ToolLayout agentReady
      title="CSV ↔ JSON Converter"
      description="Convert CSV to JSON or JSON back to CSV — handles headers, quoted fields, and multiple delimiters"
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["csv-to-json", "json-to-csv"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn ${mode === m ? "active" : ""}`}
          >
            {m === "csv-to-json" ? "CSV → JSON" : "JSON → CSV"}
          </button>
        ))}

        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-text-dimmed font-mono">Delimiter:</span>
          {(Object.entries(DELIMITER_LABELS) as [Delimiter, string][]).map(([d, label]) => (
            <button
              key={label}
              onClick={() => setDelimiter(d)}
              className={`tab-btn ${delimiter === d ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

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
              {mode === "csv-to-json" ? "CSV Input" : "JSON Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "csv-to-json"
                  ? "name,age,city\nAlice,30,NYC\nBob,25,LA"
                  : '[{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]'
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "csv-to-json" ? "JSON Output" : "CSV Output"}
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
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
            { name: "YAML to JSON", href: "/yaml-formatter" },
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
