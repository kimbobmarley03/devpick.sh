"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, X, GripVertical, FileText } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

const RELATED_TOOLS = [
  { name: "Split PDF", href: "/split-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "PDF Page Remover", href: "/pdf-page-remover" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
];

export function MergePdfTool() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);

  const loadPageCount = useCallback(async (file: File): Promise<number | undefined> => {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      return doc.getPageCount();
    } catch {
      return undefined;
    }
  }, []);

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (!arr.length) { setError("Please select PDF files only."); return; }
      setError(null);
      setResultUrl(null);
      const loaded: PdfFile[] = await Promise.all(
        arr.map(async (f) => ({
          id: `${Date.now()}-${Math.random()}`,
          file: f,
          name: f.name,
          size: f.size,
          pageCount: await loadPageCount(f),
        }))
      );
      setPdfs((prev) => [...prev, ...loaded]);
    },
    [loadPageCount]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const remove = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
    setResultUrl(null);
  };

  const merge = async () => {
    if (pdfs.length < 2) { setError("Add at least 2 PDF files to merge."); return; }
    setMerging(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const item of pdfs) {
        const bytes = await item.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const outBytes = await merged.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError(`Merge failed: ${(e as Error).message}`);
    } finally {
      setMerging(false);
    }
  };

  // Drag-to-reorder
  const onDragStart = (id: string) => { dragItem.current = id; };
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const onDragEnd = () => {
    if (!dragItem.current || !dragOverId || dragItem.current === dragOverId) {
      dragItem.current = null;
      setDragOverId(null);
      return;
    }
    setPdfs((prev) => {
      const from = prev.findIndex((p) => p.id === dragItem.current);
      const to = prev.findIndex((p) => p.id === dragOverId);
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    dragItem.current = null;
    setDragOverId(null);
  };

  return (
    <ToolLayout title="Merge PDF" description="Combine multiple PDF files into one document">
      {/* Privacy badge */}
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
          Drop PDF files here or click to browse
        </p>
        <p className="text-xs text-zinc-400 mt-1">Multiple files supported</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {pdfs.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-mono text-zinc-500 mb-2">
            Drag to reorder · {pdfs.length} file{pdfs.length !== 1 ? "s" : ""} ·{" "}
            {pdfs.reduce((s, p) => s + p.pageCount!, 0) || "?"} total pages
          </p>
          {pdfs.map((p) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => onDragStart(p.id)}
              onDragOver={(e) => onDragOver(e, p.id)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-3 rounded border font-mono text-sm transition-colors ${
                dragOverId === p.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <GripVertical size={16} className="text-zinc-400 cursor-grab shrink-0" />
              <FileText size={16} className="text-zinc-400 shrink-0" />
              <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{p.name}</span>
              <span className="text-zinc-400 text-xs shrink-0">
                {formatBytes(p.size)}{p.pageCount ? ` · ${p.pageCount}p` : ""}
              </span>
              <button
                onClick={() => remove(p.id)}
                className="text-zinc-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X size={14} />
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

      {/* Merge button */}
      <button
        onClick={merge}
        disabled={merging || pdfs.length < 2}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {merging ? "Merging…" : `Merge ${pdfs.length} PDF${pdfs.length !== 1 ? "s" : ""}`}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Merged! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download="merged.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono font-semibold transition-colors"
          >
            <Download size={14} /> Download merged.pdf
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
