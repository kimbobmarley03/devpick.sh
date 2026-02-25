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

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0.5, 0.5, 0.5];
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
  { name: "PDF Page Remover", href: "/pdf-page-remover" },
];

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function PdfWatermarkTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState("#808080");
  const [position, setPosition] = useState<Position>("center");
  const [rotate, setRotate] = useState(true);
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

  const applyWatermark = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }
    if (!watermarkText.trim()) { setError("Enter watermark text."); return; }
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
      const bytes = await fileRef.current.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const [r, g, b] = hexToRgb(color);
      const opacityVal = opacity / 100;

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();

        let x: number, y: number;
        const MARGIN = 30;
        switch (position) {
          case "top-left":    x = MARGIN; y = height - MARGIN - fontSize; break;
          case "top-right":   x = width - MARGIN - font.widthOfTextAtSize(watermarkText, fontSize); y = height - MARGIN - fontSize; break;
          case "bottom-left": x = MARGIN; y = MARGIN; break;
          case "bottom-right":x = width - MARGIN - font.widthOfTextAtSize(watermarkText, fontSize); y = MARGIN; break;
          case "center":
          default:
            x = (width - font.widthOfTextAtSize(watermarkText, fontSize)) / 2;
            y = (height - fontSize) / 2;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacityVal,
          rotate: rotate && position === "center" ? degrees(45) : degrees(0),
        });
      }

      const outBytes = await doc.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      setError(`Failed: ${(e as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  const POSITIONS: { value: Position; label: string }[] = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  return (
    <ToolLayout title="PDF Watermark" description="Add a text watermark to every page of your PDF">
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

      {/* Watermark settings */}
      <div className="mb-4 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-mono text-zinc-500 mb-1">Watermark text</label>
          <input
            type="text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            placeholder="CONFIDENTIAL"
            className="w-full px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Font size: {fontSize}pt</label>
            <input type="range" min={12} max={120} step={4} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-emerald-600" />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Opacity: {opacity}%</label>
            <input type="range" min={5} max={100} step={5} value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-emerald-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-zinc-200 dark:border-zinc-700" />
              <span className="text-sm font-mono text-zinc-500">{color}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-500 mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full px-2 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {position === "center" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)}
              className="accent-emerald-600" />
            <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">Diagonal (45°)</span>
          </label>
        )}
      </div>

      {/* Preview badge */}
      {watermarkText && (
        <div className="mb-4 p-4 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center min-h-16">
          <span
            className="font-mono font-bold select-none"
            style={{
              fontSize: Math.min(fontSize, 40),
              color,
              opacity: opacity / 100,
              transform: rotate && position === "center" ? "rotate(-45deg)" : "none",
            }}
          >
            {watermarkText}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={applyWatermark}
        disabled={processing || !fileName || !watermarkText.trim()}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {processing ? "Adding Watermark…" : "Add Watermark"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Done! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download={fileName?.replace(/\.pdf$/i, "-watermarked.pdf") ?? "watermarked.pdf"}
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
