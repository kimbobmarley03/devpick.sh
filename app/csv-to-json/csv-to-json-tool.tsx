"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

function parseCSVRow(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (ch === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = "";
      i++;
    } else {
      current += ch;
      i++;
    }
  }
  fields.push(current.trim());
  return fields;
}

function csvToJson(csv: string, delimiter: string, hasHeader: boolean): string {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return "[]";

  if (!hasHeader) {
    const rows = lines.map((l) => parseCSVRow(l, delimiter));
    return JSON.stringify(rows, null, 2);
  }

  const headers = parseCSVRow(lines[0], delimiter);
  const result = lines.slice(1).map((line) => {
    const fields = parseCSVRow(line, delimiter);
    const obj: Record<string, string | number | boolean | null> = {};
    headers.forEach((h, i) => {
      const val = fields[i] ?? "";
      // Auto-type: number, boolean, null
      if (val === "") obj[h] = null;
      else if (val === "true") obj[h] = true;
      else if (val === "false") obj[h] = false;
      else if (/^-?\d+(\.\d+)?$/.test(val)) obj[h] = Number(val);
      else obj[h] = val;
    });
    return obj;
  });

  return JSON.stringify(result, null, 2);
}

const SAMPLE = `id,name,email,age,active
1,Alice Johnson,alice@example.com,28,true
2,Bob Smith,bob@example.com,34,true
3,Carol White,carol@example.com,22,false`;

export function CsvToJsonTool() {
  useWebMCP({
    name: "csvToJson",
    description: "Convert CSV to JSON",
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
      const lines = (params.csv as string).trim().split("\n"); const headers = lines[0].split(",").map(h => h.trim()); const rows = lines.slice(1).map(l => { const vals = l.split(","); return Object.fromEntries(headers.map((h,i) => [h, vals[i]?.trim() || ""])); }); return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
    },
  });

  const [input, setInput] = useState(SAMPLE);
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      output = csvToJson(input, delimiter || ",", hasHeader);
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  return (
    <ToolLayout agentReady
      title="CSV to JSON"
      description="Convert CSV data to JSON — handles quoted fields, custom delimiters, and auto-typing. Client-side."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Delimiter selector */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Delimiter:</span>
          {[",", ";", "\t", "|"].map((d) => (
            <button
              key={d}
              onClick={() => setDelimiter(d)}
              className={`tab-btn ${delimiter === d ? "active" : ""}`}
            >
              {d === "\t" ? "Tab" : d}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer ml-2">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="accent-[var(--dp-accent)]"
          />
          First row is header
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
            <div className="pane-label">CSV Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Paste CSV data here..."
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
            { name: "JSON to CSV", href: "/csv-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "XML to JSON", href: "/xml-to-json" },
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
