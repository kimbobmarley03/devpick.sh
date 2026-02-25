"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, Download } from "lucide-react";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee>
    <id>1</id>
    <name>Alice Johnson</name>
    <email>alice@example.com</email>
    <department>Engineering</department>
    <salary>95000</salary>
  </employee>
  <employee>
    <id>2</id>
    <name>Bob Smith</name>
    <email>bob@example.com</email>
    <department>Design</department>
    <salary>85000</salary>
  </employee>
  <employee>
    <id>3</id>
    <name>Carol White</name>
    <email>carol@example.com</email>
    <department>Engineering</department>
    <salary>110000</salary>
  </employee>
</employees>`;

function xmlToCsv(xml: string): { csv: string; rows: number; cols: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error(parseError.textContent ?? "XML parse error");

  const root = doc.documentElement;

  // Find repeated child elements (rows)
  const childTagCounts: Record<string, number> = {};
  for (const child of Array.from(root.children)) {
    childTagCounts[child.tagName] = (childTagCounts[child.tagName] ?? 0) + 1;
  }

  // Find the most repeated child tag — that's our row element
  const rowTag = Object.entries(childTagCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
  if (!rowTag) throw new Error("Could not detect row elements");

  const rowElements = Array.from(root.querySelectorAll(rowTag));

  // Collect all column paths (recursively flatten)
  function getLeafPaths(el: Element, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    const children = Array.from(el.children);

    if (children.length === 0) {
      // Leaf node — include attributes + text content
      const path = prefix || el.tagName;
      result[path] = el.textContent?.trim() ?? "";
    } else {
      // Recurse
      const tagCount: Record<string, number> = {};
      for (const child of children) {
        tagCount[child.tagName] = (tagCount[child.tagName] ?? 0) + 1;
      }
      const usedCount: Record<string, number> = {};
      for (const child of children) {
        const isRepeated = tagCount[child.tagName] > 1;
        usedCount[child.tagName] = (usedCount[child.tagName] ?? 0);
        const childPrefix = prefix
          ? `${prefix}.${child.tagName}${isRepeated ? `[${usedCount[child.tagName]}]` : ""}`
          : child.tagName;
        usedCount[child.tagName]++;
        const sub = getLeafPaths(child, childPrefix);
        Object.assign(result, sub);
      }
    }

    // Include attributes
    for (const attr of Array.from(el.attributes)) {
      const path = prefix ? `${prefix}@${attr.name}` : `@${attr.name}`;
      result[path] = attr.value;
    }

    return result;
  }

  // Build column set (ordered, preserving first-seen order)
  const colSet = new Set<string>();
  const rowData: Record<string, string>[] = rowElements.map((el) => {
    const paths = getLeafPaths(el);
    Object.keys(paths).forEach((k) => colSet.add(k));
    return paths;
  });

  const cols = Array.from(colSet);

  // Build CSV
  function escapeCsv(val: string): string {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }

  const header = cols.map(escapeCsv).join(",");
  const rows = rowData.map((row) => cols.map((col) => escapeCsv(row[col] ?? "")).join(","));

  return { csv: [header, ...rows].join("\n"), rows: rowData.length, cols: cols.length };
}

export function XmlToCsvTool() {
  const [input, setInput] = useState(SAMPLE_XML);
  const [error, setError] = useState("");

  let output = "";
  let rowCount = 0;
  let colCount = 0;

  if (input.trim()) {
    try {
      const result = xmlToCsv(input);
      output = result.csv;
      rowCount = result.rows;
      colCount = result.cols;
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  const downloadCsv = () => {
    const blob = new Blob([output], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="XML to CSV Converter"
      description="Paste XML data and get a flattened CSV with auto-detected columns. Handles nested elements and attributes."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {output && (
          <span className="text-xs text-text-ghost font-mono">
            {rowCount} rows × {colCount} columns
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setInput(""); setError(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <button onClick={downloadCsv} disabled={!output} className="action-btn" title="Download CSV">
            <Download size={13} />
            Download
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">XML Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Paste XML here…"
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">CSV Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  CSV will appear here…
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
            { name: "XML to JSON", href: "/xml-to-json" },
            { name: "CSV to JSON", href: "/csv-to-json" },
            { name: "CSV to SQL", href: "/csv-to-sql" },
            { name: "CSV Viewer", href: "/csv-viewer" },
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
