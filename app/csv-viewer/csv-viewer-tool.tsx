"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Trash2, ArrowUpDown } from "lucide-react";

const SAMPLE_CSV = `name,role,salary,department,active
Alice Johnson,Engineer,95000,Engineering,true
Bob Smith,Designer,85000,Design,true
Carol White,Manager,110000,Engineering,false
Dave Brown,Analyst,78000,Finance,true
Eve Davis,Engineer,92000,Engineering,true`;

function parseCsv(raw: string): { headers: string[]; rows: string[][] } {
  const lines = raw.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function isNumeric(s: string) {
  return s !== "" && !isNaN(Number(s));
}

export function CsvViewerTool() {
  useWebMCP({
    name: "viewCSV",
    description: "Parse and display CSV as a table",
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
      const lines = (params.csv as string).trim().split("\n"); const headers = lines[0].split(","); return { content: [{ type: "text", text: "Columns: " + headers.join(", ") + "\nRows: " + (lines.length - 1) }] };
    },
  });

  const [raw, setRaw] = useState(SAMPLE_CSV);
  const [tab, setTab] = useState<"input" | "table">("table");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { headers, rows } = parseCsv(raw);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setRaw(e.target?.result as string ?? "");
      setTab("table");
      setSortCol(null);
    };
    reader.readAsText(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const toggleSort = (i: number) => {
    if (sortCol === i) setSortAsc((a) => !a);
    else { setSortCol(i); setSortAsc(true); }
  };

  const lowerFilter = filter.toLowerCase();
  let displayRows = rows.filter((r) =>
    !filter || r.some((c) => c.toLowerCase().includes(lowerFilter))
  );
  if (sortCol !== null) {
    displayRows = [...displayRows].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      let cmp = 0;
      if (isNumeric(av) && isNumeric(bv)) {
        cmp = Number(av) - Number(bv);
      } else {
        cmp = av.localeCompare(bv);
      }
      return sortAsc ? cmp : -cmp;
    });
  }

  return (
    <ToolLayout agentReady
      title="CSV Viewer"
      description="Paste or upload CSV data to view as a sortable, filterable table. Runs entirely in your browser."
    >
      {/* Tabs + actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {(["table", "input"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn ${tab === t ? "active" : ""}`}
            >
              {t === "table" ? "Table View" : "Edit CSV"}
            </button>
          ))}
        </div>
        {tab === "table" && headers.length > 0 && (
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter rows…"
            className="px-2 py-1 text-sm border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-48"
          />
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="action-btn"
          >
            <Upload size={13} />
            Upload CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            onClick={() => {
              setRaw("");
              setSortCol(null);
              setFilter("");
            }}
            className="action-btn"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {tab === "input" ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative"
        >
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste CSV here or drag & drop a file…"
            className="tool-textarea w-full"
            rows={16}
            spellCheck={false}
          />
          <p className="text-xs text-text-ghost mt-1">Tip: drag & drop a .csv file here</p>
        </div>
      ) : headers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-4 py-20 border-2 border-dashed border-border-subtle rounded-lg cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={32} className="text-text-ghost" />
          <p className="text-text-secondary text-sm">Paste CSV above or drop a file here</p>
          <button className="action-btn" onClick={() => setTab("input")}>
            Edit CSV
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs text-text-ghost mb-2">
            {displayRows.length} of {rows.length} rows · {headers.length} columns
            {sortCol !== null && ` · sorted by "${headers[sortCol]}" ${sortAsc ? "↑" : "↓"}`}
          </div>
          <div className="overflow-auto rounded-lg border border-border-subtle max-h-[60vh]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 sticky top-0 z-10">
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      onClick={() => toggleSort(i)}
                      className="text-left px-3 py-2 font-semibold text-text-secondary cursor-pointer select-none whitespace-nowrap border-b border-border-subtle hover:text-text-primary group"
                    >
                      <span className="flex items-center gap-1">
                        {h}
                        <ArrowUpDown
                          size={11}
                          className={`opacity-40 group-hover:opacity-100 transition-opacity ${
                            sortCol === i ? "opacity-100 text-accent" : ""
                          }`}
                        />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border-subtle last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    {headers.map((_, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 font-mono text-xs text-text-primary whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis"
                        title={row[ci] ?? ""}
                      >
                        {row[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "CSV to JSON", href: "/csv-to-json" },
            { name: "CSV to SQL", href: "/csv-to-sql" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "XML to CSV", href: "/xml-to-csv" },
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
