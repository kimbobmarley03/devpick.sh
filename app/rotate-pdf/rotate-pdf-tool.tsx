"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, FileText, RotateCw, RotateCcw } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "PDF Page Remover", href: "/pdf-page-remover" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
];

type PageRotation = { pageIndex: number; rotation: number };

export function RotatePdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotating, setRotating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [bulkDeg, setBulkDeg] = useState<90 | 180 | 270>(90);
  const [pageRotations, setPageRotations] = useState<PageRotation[]>([]);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setResultUrl(null);
    fileRef.current = file;
    setFileName(file.name);
    setOriginalSize(file.size);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setPageCount(count);
      setPageRotations(
        doc.getPages().map((p, i) => ({ pageIndex: i, rotation: p.getRotation().angle }))
      );
    } catch {
      setPageCount(0);
      setPageRotations([]);
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

  const adjustPage = (pageIndex: number, delta: 90 | -90) => {
    setPageRotations((prev) =>
      prev.map((r) =>
        r.pageIndex === pageIndex
          ? { ...r, rotation: ((r.rotation + delta) % 360 + 360) % 360 }
          : r
      )
    );
  };

  const rotate = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }
    setRotating(true);
    setError(null);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await fileRef.current.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();

      if (mode === "all") {
        pages.forEach((p) => {
          const cur = p.getRotation().angle;
          p.setRotation(degrees((cur + bulkDeg) % 360));
        });
      } else {
        pageRotations.forEach(({ pageIndex, rotation }) => {
          pages[pageIndex].setRotation(degrees(rotation));
        });
      }

      const outBytes = await doc.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError(`Rotation failed: ${(e as Error).message}`);
    } finally {
      setRotating(false);
    }
  };

  return (
    <ToolLayout title="Rotate PDF" description="Rotate PDF pages clockwise, counter-clockwise, or 180°">
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

      {/* Mode */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("all")}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            mode === "all" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          }`}
        >
          All pages
        </button>
        <button
          onClick={() => setMode("custom")}
          disabled={!pageCount}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            mode === "custom" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          } disabled:opacity-40`}
        >
          Per-page
        </button>
      </div>

      {mode === "all" && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {([90, 180, 270] as const).map((deg) => (
            <button
              key={deg}
              onClick={() => setBulkDeg(deg)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-colors ${
                bulkDeg === deg ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
              }`}
            >
              {deg === 90 && <RotateCw size={14} />}
              {deg === 270 && <RotateCcw size={14} />}
              {deg === 180 && "↕"}
              {deg === 90 ? "90° CW" : deg === 270 ? "90° CCW" : "180°"}
            </button>
          ))}
        </div>
      )}

      {mode === "custom" && pageRotations.length > 0 && (
        <div className="mb-4 space-y-1 max-h-64 overflow-y-auto">
          {pageRotations.map(({ pageIndex, rotation }) => (
            <div
              key={pageIndex}
              className="flex items-center gap-3 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <span className="text-xs font-mono text-zinc-500 w-16 shrink-0">Page {pageIndex + 1}</span>
              <span className="text-xs font-mono text-zinc-400 flex-1">{rotation}°</span>
              <button
                onClick={() => adjustPage(pageIndex, -90)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
                title="Rotate -90°"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => adjustPage(pageIndex, 90)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500"
                title="Rotate +90°"
              >
                <RotateCw size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={rotate}
        disabled={rotating || !fileName}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {rotating ? "Rotating…" : "Rotate PDF"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Done! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download={fileName?.replace(/\.pdf$/i, "-rotated.pdf") ?? "rotated.pdf"}
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
