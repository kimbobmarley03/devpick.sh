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

      {/* SEO Content */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-3">CSV to JSON converter for APIs, ETL, and frontend apps</h2>
        <p className="text-sm text-text-dimmed leading-relaxed mb-3">
          Use this free CSV to JSON converter to turn spreadsheet exports into clean JSON for REST APIs,
          seed scripts, and frontend mock data. Parsing runs in your browser, so your data stays local.
        </p>
        <ul className="list-disc pl-5 text-sm text-text-dimmed space-y-1">
          <li>Supports quoted fields, escaped quotes, and custom delimiters</li>
          <li>Optional header mapping to create JSON objects by column name</li>
          <li>Auto-detects booleans, numbers, and null values for faster cleanup</li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "How do I convert CSV with headers to JSON objects?",
              a: "Keep 'First row is header' enabled. The first line becomes object keys, and each next row maps to a JSON object.",
            },
            {
              q: "Can this parse semicolon or tab-delimited files?",
              a: "Yes. Switch the delimiter to semicolon, tab, pipe, or comma before converting.",
            },
            {
              q: "Will this tool preserve quoted commas inside fields?",
              a: "Yes. Quoted values like \"New York, NY\" stay as a single field during parsing.",
            },
            {
              q: "Is my CSV uploaded to a server?",
              a: "No. Conversion happens fully client-side in your browser.",
            },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <p className="text-xs text-text-ghost mb-3">
          Continue your data conversion workflow with CSV cleanup, JSON validation, and schema generation tools.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "CSV Formatter", href: "/csv-formatter" },
            { name: "CSV Viewer", href: "/csv-viewer" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON Schema Validator", href: "/json-schema" },
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
