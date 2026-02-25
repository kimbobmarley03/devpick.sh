"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, X, GripVertical } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string;
  width?: number;
  height?: number;
}

const RELATED_TOOLS = [
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
];

export function JpgToPdfTool() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [fitMode, setFitMode] = useState<"fit" | "fill">("fit");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<string | null>(null);

  const loadImageDimensions = (file: File, previewUrl: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = previewUrl;
    });

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(
      (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.name)
    );
    if (!arr.length) { setError("Please select image files."); return; }
    setError(null);
    setResultUrl(null);
    const loaded: ImageFile[] = await Promise.all(
      arr.map(async (f) => {
        const previewUrl = URL.createObjectURL(f);
        const { width, height } = await loadImageDimensions(f, previewUrl);
        return { id: `${Date.now()}-${Math.random()}`, file: f, name: f.name, size: f.size, previewUrl, width, height };
      })
    );
    setImages((prev) => [...prev, ...loaded]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const remove = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setResultUrl(null);
  };

  // Drag-to-reorder
  const onDragStart = (id: string) => { dragItem.current = id; };
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const onDragEnd = () => {
    if (!dragItem.current || !dragOverId || dragItem.current === dragOverId) {
      dragItem.current = null; setDragOverId(null); return;
    }
    setImages((prev) => {
      const from = prev.findIndex((i) => i.id === dragItem.current);
      const to = prev.findIndex((i) => i.id === dragOverId);
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    dragItem.current = null; setDragOverId(null);
  };

  const convert = async () => {
    if (!images.length) { setError("Add at least one image."); return; }
    setConverting(true);
    setError(null);
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (const img of images) {
        const bytes = await img.file.arrayBuffer();
        const isJpeg = img.file.type === "image/jpeg" || /\.(jpg|jpeg)$/i.test(img.file.name);
        let pdfImage;
        if (isJpeg) {
          pdfImage = await pdf.embedJpg(bytes);
        } else {
          // Convert to PNG for embedding
          const pngBlob = await new Promise<Blob>((res, rej) => {
            const image = new Image();
            image.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(image, 0, 0);
              canvas.toBlob((b) => (b ? res(b) : rej(new Error("PNG conversion failed"))), "image/png");
            };
            image.onerror = () => rej(new Error("Image load failed"));
            image.src = img.previewUrl;
          });
          const pngBytes = await pngBlob.arrayBuffer();
          pdfImage = await pdf.embedPng(pngBytes);
        }

        const imgW = pdfImage.width;
        const imgH = pdfImage.height;

        let pageW: number, pageH: number;
        if (fitMode === "fit") {
          // Use image dimensions directly (72 DPI)
          pageW = imgW;
          pageH = imgH;
        } else {
          // A4 page (595 x 842 pts)
          pageW = 595;
          pageH = 842;
        }

        const page = pdf.addPage([pageW, pageH]);

        let drawX = 0, drawY = 0, drawW = pageW, drawH = pageH;
        if (fitMode === "fit") {
          drawW = imgW;
          drawH = imgH;
        } else {
          // Scale to fit inside A4, centered
          const scale = Math.min(pageW / imgW, pageH / imgH);
          drawW = imgW * scale;
          drawH = imgH * scale;
          drawX = (pageW - drawW) / 2;
          drawY = (pageH - drawH) / 2;
        }

        // White background
        page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: rgb(1, 1, 1) });
        page.drawImage(pdfImage, { x: drawX, y: drawY, width: drawW, height: drawH });
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
    <ToolLayout title="JPG to PDF" description="Convert images to a PDF document">
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
          Drop images here or click to browse
        </p>
        <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WebP, GIF supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-mono text-zinc-500 mb-2">Drag to reorder · {images.length} image{images.length !== 1 ? "s" : ""}</p>
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(img.id)}
              onDragOver={(e) => onDragOver(e, img.id)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-3 rounded border font-mono text-sm transition-colors ${
                dragOverId === img.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              <GripVertical size={16} className="text-zinc-400 cursor-grab shrink-0" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt={img.name} className="w-10 h-10 object-cover rounded shrink-0" />
              <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{img.name}</span>
              <span className="text-zinc-400 text-xs shrink-0">
                {formatBytes(img.size)}{img.width ? ` · ${img.width}×${img.height}` : ""}
              </span>
              <button onClick={() => remove(img.id)} className="text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFitMode("fit")}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            fitMode === "fit" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          }`}
        >
          Match image size
        </button>
        <button
          onClick={() => setFitMode("fill")}
          className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
            fitMode === "fill" ? "bg-emerald-600 text-white" : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500"
          }`}
        >
          Fit to A4
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={convert}
        disabled={converting || !images.length}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {converting ? "Converting…" : `Convert ${images.length} image${images.length !== 1 ? "s" : ""} to PDF`}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Done! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download="images.pdf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono font-semibold transition-colors"
          >
            <Download size={14} /> Download images.pdf
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
