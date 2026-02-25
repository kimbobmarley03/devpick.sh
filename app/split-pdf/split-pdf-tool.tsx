"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, FileText } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Parse a range string like "1-3,5,7-9" into 0-based page indices */
function parseRanges(rangeStr: string, maxPage: number): number[] {
  const indices: number[] = [];
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i++) {
        if (i >= 1 && i <= maxPage) indices.push(i - 1);
      }
    } else {
      const n = Number(part);
      if (n >= 1 && n <= maxPage) indices.push(n - 1);
    }
  }
  return [...new Set(indices)].sort((a, b) => a - b);
}

interface SplitResult {
  name: string;
  url: string;
  size: number;
  pages: string;
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "PDF Page Remover", href: "/pdf-page-remover" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
];

export function SplitPdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitting, setSplitting] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"all" | "range">("all");
  const [rangeStr, setRangeStr] = useState("");
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setResults([]);
    fileRef.current = file;
    setFileName(file.name);
    setOriginalSize(file.size);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      setPageCount(0);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const split = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }
    setSplitting(true);
    setError(null);
    setResults([]);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await fileRef.current.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = srcDoc.getPageCount();
      const baseName = (fileRef.current.name).replace(/\.pdf$/i, "");

      if (mode === "all") {
        // Split each page into its own PDF
        const newResults: SplitResult[] = [];
        for (let i = 0; i < total; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const outBytes = await newDoc.save();
          const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
          newResults.push({
            name: `${baseName}-page-${i + 1}.pdf`,
            url: URL.createObjectURL(blob),
            size: blob.size,
            pages: `Page ${i + 1}`,
          });
        }
        setResults(newResults);
      } else {
        // Custom range — extract those pages into a single PDF
        const indices = parseRanges(rangeStr, total);
        if (!indices.length) { setError("No valid pages in range. Example: 1-3,5,7"); setSplitting(false); return; }
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const outBytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
        setResults([{
          name: `${baseName}-extracted.pdf`,
          url: URL.createObjectURL(blob),
          size: blob.size,
          pages: rangeStr,
        }]);
      }
    } catch (e) {
      setError(`Split failed: ${(e as Error).message}`);
    } finally {
      setSplitting(false);
    }
  };

  return (
    <ToolLayout title="Split PDF" description="Split a PDF into individual pages or extract custom page ranges">
      <div className="mb-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
        🔒 Your files never leave your browser
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
          dragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 bg-zinc-50 dark:bg-zinc-800"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Upload className="mx-auto mb-2 text-zinc-400" size={32} />
        <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
          Drop a PDF here or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
      </div>

      {/* File info */}
      {fileName && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm">
          <FileText size={16} className="text-zinc-400 shrink-0" />
          <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{fileName}</span>
          <span className="text-zinc-400 text-xs shrink-0">
            {formatBytes(originalSize)}{pageCount ? ` · ${pageCount} pages` : ""}
          </span>
        </div>
      )}

      {/* Mode selector */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("all")}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            mode === "all"
              ? "bg-emerald-600 text-white"
              : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          }`}
        >
          Split all pages
        </button>
        <button
          onClick={() => setMode("range")}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            mode === "range"
              ? "bg-emerald-600 text-white"
              : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          }`}
        >
          Extract page range
        </button>
      </div>

      {mode === "range" && (
        <div className="mb-4">
          <label className="block text-xs font-mono text-zinc-500 mb-1">
            Page range (e.g. 1-3,5,7-9){pageCount ? ` — ${pageCount} total pages` : ""}
          </label>
          <input
            type="text"
            value={rangeStr}
            onChange={(e) => setRangeStr(e.target.value)}
            placeholder="1-3,5,7-9"
            className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={split}
        disabled={splitting || !fileName}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {splitting ? "Splitting…" : "Split PDF"}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-mono text-zinc-500 mb-2">
            {results.length} file{results.length !== 1 ? "s" : ""} ready
          </p>
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.url}
                className="flex items-center gap-3 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <FileText size={16} className="text-zinc-400 shrink-0" />
                <span className="flex-1 text-sm font-mono truncate text-zinc-700 dark:text-zinc-300">{r.name}</span>
                <span className="text-xs font-mono text-zinc-400 shrink-0">{formatBytes(r.size)}</span>
                <a
                  href={r.url}
                  download={r.name}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold transition-colors shrink-0"
                >
                  <Download size={12} /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-xs font-mono text-zinc-500 mb-3">Related PDF Tools</p>
        <div className="flex flex-wrap gap-2">
          {RELATED_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
