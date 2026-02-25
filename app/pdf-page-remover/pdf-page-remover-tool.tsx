"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, FileText, X } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Parse "1,3-5,7" into sorted 1-based page numbers */
function parsePageList(str: string, max: number): number[] {
  const nums = new Set<number>();
  for (const part of str.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i++) if (i >= 1 && i <= max) nums.add(i);
    } else {
      const n = Number(part);
      if (n >= 1 && n <= max) nums.add(n);
    }
  }
  return [...nums].sort((a, b) => a - b);
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
];

export function PdfPageRemoverTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [removing, setRemoving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [resultPages, setResultPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [inputMode, setInputMode] = useState<"picker" | "text">("text");
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setResultUrl(null);
    setSelectedPages(new Set());
    setPageInput("");
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

  const togglePage = (n: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const remove = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }

    const toRemove = inputMode === "text"
      ? new Set(parsePageList(pageInput, pageCount))
      : selectedPages;

    if (!toRemove.size) { setError("Select at least one page to remove."); return; }
    if (toRemove.size >= pageCount) { setError("Cannot remove all pages. Keep at least one."); return; }

    setRemoving(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await fileRef.current.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const total = srcDoc.getPageCount();

      // Build indices to keep
      const keepIndices = Array.from({ length: total }, (_, i) => i).filter(
        (i) => !toRemove.has(i + 1)
      );

      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(srcDoc, keepIndices);
      pages.forEach((p) => newDoc.addPage(p));

      const outBytes = await newDoc.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
      setResultPages(keepIndices.length);
    } catch (e) {
      setError(`Failed: ${(e as Error).message}`);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <ToolLayout title="PDF Page Remover" description="Delete specific pages from a PDF file">
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

      {pageCount > 0 && (
        <>
          {/* Mode */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setInputMode("text")}
              className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                inputMode === "text" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
              }`}
            >
              Type page numbers
            </button>
            <button
              onClick={() => setInputMode("picker")}
              className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                inputMode === "picker" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
              }`}
            >
              Click to select
            </button>
          </div>

          {inputMode === "text" ? (
            <div className="mb-4">
              <label className="block text-xs font-mono text-zinc-500 mb-1">
                Pages to remove (e.g. 1,3-5,7) — PDF has {pageCount} pages
              </label>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="1,3-5,7"
                className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
              {pageInput && (
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Pages to remove: {parsePageList(pageInput, pageCount).join(", ") || "none"}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-xs font-mono text-zinc-500 mb-2">
                Click pages to mark for removal ({selectedPages.size} selected)
              </p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => togglePage(n)}
                    className={`relative w-12 h-14 flex flex-col items-center justify-center rounded border text-xs font-mono transition-colors ${
                      selectedPages.has(n)
                        ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                    }`}
                  >
                    {selectedPages.has(n) && (
                      <X size={10} className="absolute top-0.5 right-0.5 text-red-500" />
                    )}
                    <span className="text-xs">{n}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={remove}
        disabled={removing || !fileName}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {removing ? "Removing…" : "Remove Pages"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Done! {resultPages} page{resultPages !== 1 ? "s" : ""} remaining · {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download={fileName?.replace(/\.pdf$/i, "-edited.pdf") ?? "edited.pdf"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono font-semibold transition-colors"
          >
            <Download size={14} /> Download
          </a>
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
