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

interface JpgResult {
  name: string;
  url: string;
  size: number;
  page: number;
}

const RELATED_TOOLS = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "PDF Page Remover", href: "/pdf-page-remover" },
];

export function PdfToJpgTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<JpgResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
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
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);
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

  const convert = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }
    setConverting(true);
    setError(null);
    setResults([]);
    setProgress(0);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = await fileRef.current.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      const baseName = fileRef.current.name.replace(/\.pdf$/i, "");
      const newResults: JpgResult[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d")!;
        // White background for JPG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("Canvas toBlob failed"))),
            "image/jpeg",
            quality / 100
          )
        );
        newResults.push({
          name: `${baseName}-page-${i}.jpg`,
          url: URL.createObjectURL(blob),
          size: blob.size,
          page: i,
        });
        setProgress(Math.round((i / total) * 100));
      }
      setResults(newResults);
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    } finally {
      setConverting(false);
    }
  };

  const downloadAll = () => {
    results.forEach((r, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = r.url;
        a.download = r.name;
        a.click();
      }, idx * 200);
    });
  };

  return (
    <ToolLayout title="PDF to JPG" description="Convert each PDF page to a JPG image">
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

      {/* Options */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-1">
            JPG Quality: {quality}%
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-1">
            Scale / DPI: {scale}x ({Math.round(scale * 96)} DPI)
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.5}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={convert}
        disabled={converting || !fileName}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {converting ? `Converting… ${progress}%` : "Convert to JPG"}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-zinc-500">
              {results.length} image{results.length !== 1 ? "s" : ""} ready
            </p>
            {results.length > 1 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold transition-colors"
              >
                <Download size={12} /> Download All
              </button>
            )}
          </div>
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.url}
                className="flex items-center gap-3 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={`Page ${r.page}`} className="w-12 h-16 object-cover rounded border border-zinc-200 dark:border-zinc-700 shrink-0" />
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
