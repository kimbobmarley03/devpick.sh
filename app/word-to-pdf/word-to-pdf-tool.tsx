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

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const LINE_HEIGHT = 16;
const FONT_SIZE = 12;
const CHARS_PER_LINE = Math.floor((PAGE_WIDTH - MARGIN * 2) / (FONT_SIZE * 0.6));

function wrapLines(text: string): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    if (rawLine.length === 0) { lines.push(""); continue; }
    let remaining = rawLine;
    while (remaining.length > CHARS_PER_LINE) {
      const idx = remaining.lastIndexOf(" ", CHARS_PER_LINE);
      const cutAt = idx > 0 ? idx : CHARS_PER_LINE;
      lines.push(remaining.slice(0, cutAt));
      remaining = remaining.slice(cutAt).trimStart();
    }
    lines.push(remaining);
  }
  return lines;
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
];

export function WordToPdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("Document");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    const isText = file.type.startsWith("text/") || /\.(txt|md|csv|log|json|xml|html|css|js|ts)$/i.test(file.name);
    if (!isText) { setError("Please select a text file (.txt, .md, etc.)"); return; }
    setError(null);
    setResultUrl(null);
    setFileName(file.name);
    setFileSize(file.size);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (e) => setText((e.target?.result as string) ?? "");
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
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
    const content = text.trim();
    if (!content) { setError("Please enter or upload some text."); return; }
    setConverting(true);
    setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Courier);

      pdf.setTitle(title);
      pdf.setCreator("devpick.sh");

      const wrappedLines = wrapLines(content);
      const linesPerPage = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT);

      for (let pageIdx = 0; pageIdx * linesPerPage < wrappedLines.length; pageIdx++) {
        const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: rgb(1, 1, 1) });

        const start = pageIdx * linesPerPage;
        const end = Math.min(start + linesPerPage, wrappedLines.length);
        for (let i = start; i < end; i++) {
          const y = PAGE_HEIGHT - MARGIN - (i - start) * LINE_HEIGHT;
          const lineText = wrappedLines[i];
          if (lineText) {
            page.drawText(lineText, {
              x: MARGIN,
              y,
              size: FONT_SIZE,
              font,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
        }
        // Page number
        page.drawText(`${pageIdx + 1}`, {
          x: PAGE_WIDTH / 2,
          y: MARGIN / 2,
          size: 9,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const outBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    } finally {
      setConverting(false);
    }
  };

  return (
    <ToolLayout title="Text to PDF" description="Convert text files or typed text to a PDF document">
      <div className="mb-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
        🔒 Your files never leave your browser
      </div>

      <div className="mb-4 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-500">
        ℹ️ Supports .txt and plain text files. For Word (.docx) files, save as .txt first.
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
          Drop a text file here or click to browse
        </p>
        <p className="text-xs text-zinc-400 mt-1">Or type/paste text below</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.csv,.log,.json,.xml,.html,.css,.js,.ts,text/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
      </div>

      {/* File info */}
      {fileName && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm">
          <FileText size={16} className="text-zinc-400 shrink-0" />
          <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{fileName}</span>
          <span className="text-zinc-400 text-xs shrink-0">{formatBytes(fileSize)}</span>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-zinc-500 mb-1">Document title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document"
          className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Text area */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-zinc-500 mb-1">
          Text content {text.length > 0 && `· ${text.length.toLocaleString()} chars`}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here..."
          rows={10}
          className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500 resize-y"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={convert}
        disabled={converting || !text.trim()}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {converting ? "Converting…" : "Convert to PDF"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Done! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download={`${title || "document"}.pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono font-semibold transition-colors"
          >
            <Download size={14} /> Download PDF
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
