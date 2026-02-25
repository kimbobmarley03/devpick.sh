"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, Upload, X } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ConvertedFile {
  name: string;
  originalSize: number;
  jpgSize: number;
  jpgUrl: string;
  width: number;
  height: number;
}

async function convertPngToJpg(
  file: File,
  quality: number,
  bgColor: string
): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        // Fill background (for transparent PNGs)
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Conversion failed")); return; }
            const jpgUrl = URL.createObjectURL(blob);
            resolve({
              name: file.name.replace(/\.(png|webp|gif|bmp)$/i, ".jpg"),
              originalSize: file.size,
              jpgSize: blob.size,
              jpgUrl,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          },
          "image/jpeg",
          quality / 100
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function PngToJpgTool() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [quality, setQuality] = useState(90);
  const [bgColor, setBgColor] = useState("#ffffff");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles).filter(
        (f) => f.type.startsWith("image/") || /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(f.name)
      );
      if (!arr.length) { setErrors(["No image files selected."]); return; }
      setConverting(true);
      setErrors([]);
      const errs: string[] = [];
      const results: ConvertedFile[] = [];
      for (const f of arr) {
        try {
          const r = await convertPngToJpg(f, quality, bgColor);
          results.push(r);
        } catch (e) {
          errs.push(`${f.name}: ${(e as Error).message}`);
        }
      }
      setFiles((prev) => [...prev, ...results]);
      setErrors(errs);
      setConverting(false);
    },
    [quality, bgColor]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].jpgUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const downloadAll = () => {
    files.forEach((f) => {
      const a = document.createElement("a");
      a.href = f.jpgUrl;
      a.download = f.name;
      a.click();
    });
  };

  return (
    <ToolLayout
      title="PNG to JPG Converter"
      description="Convert PNG images to JPG/JPEG — transparent areas become white. Runs entirely in your browser."
    >
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-lg bg-[var(--dp-bg-subtle)] text-sm">
        <div className="flex items-center gap-2">
          <label className="text-text-dimmed text-xs">Quality:</label>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-text-secondary font-mono text-xs w-8">{quality}%</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-text-dimmed text-xs">Background:</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-8 h-6 rounded border border-[var(--dp-border)] cursor-pointer"
          />
          <span className="text-text-secondary font-mono text-xs">{bgColor}</span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${dragging
            ? "border-accent bg-[var(--dp-bg-subtle)]"
            : "border-[var(--dp-border)] hover:border-accent hover:bg-[var(--dp-bg-subtle)]"}
        `}
      >
        <Upload size={28} className="mx-auto mb-3 text-text-dimmed" />
        <p className="text-sm text-text-secondary mb-1">
          Drag &amp; drop PNG files here, or{" "}
          <span className="text-accent">click to browse</span>
        </p>
        <p className="text-xs text-text-muted">
          Supports PNG, WebP, GIF, BMP • Processed locally
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {converting && (
        <div className="mt-4 text-center text-sm text-text-secondary animate-pulse">
          Converting...
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((e, i) => (
            <div
              key={i}
              className="text-[var(--dp-error)] text-xs bg-[var(--dp-bg-subtle)] rounded px-3 py-2"
            >
              {e}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-text-secondary">
              Converted Files ({files.length})
            </h2>
            {files.length > 1 && (
              <button
                onClick={downloadAll}
                className="action-btn text-xs"
                style={{ padding: "4px 10px" }}
              >
                <Download size={12} />
                Download All
              </button>
            )}
          </div>

          {files.map((f, i) => (
            <div
              key={i}
              className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-lg p-4 flex items-center gap-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.jpgUrl}
                alt={f.name}
                className="w-16 h-16 object-cover rounded border border-[var(--dp-border)] bg-[var(--dp-bg-subtle)]"
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-text-primary truncate">{f.name}</div>
                <div className="text-xs text-text-dimmed mt-0.5">
                  {f.width}×{f.height}px
                </div>
                <div className="text-xs text-text-dimmed mt-0.5">
                  {formatBytes(f.originalSize)} →{" "}
                  <span
                    className={
                      f.jpgSize < f.originalSize ? "text-green-400" : "text-text-secondary"
                    }
                  >
                    {formatBytes(f.jpgSize)}
                  </span>
                  {f.jpgSize < f.originalSize && (
                    <span className="text-green-400 ml-1">
                      (−{Math.round((1 - f.jpgSize / f.originalSize) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={f.jpgUrl}
                  download={f.name}
                  className="action-btn text-xs"
                  style={{ padding: "4px 10px" }}
                >
                  <Download size={12} />
                  JPG
                </a>
                <button
                  onClick={() => removeFile(i)}
                  className="text-text-dimmed hover:text-[var(--dp-error)] transition-colors"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              files.forEach((f) => URL.revokeObjectURL(f.jpgUrl));
              setFiles([]);
            }}
            className="text-xs text-text-dimmed hover:text-text-secondary mt-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: "Does PNG to JPG conversion lose quality?",
              a: "JPG uses lossy compression, so some quality may be lost. You can set quality (1–100%) above — 80–90% is usually indistinguishable from the original for photos.",
            },
            {
              q: "What happens to transparent backgrounds?",
              a: "JPG doesn't support transparency. This tool fills transparent areas with the background color you choose (white by default).",
            },
            {
              q: "Is my image uploaded anywhere?",
              a: "No. Everything runs in your browser using the HTML5 Canvas API. Your images never leave your device.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="text-xs font-semibold text-text-secondary mb-1">{q}</div>
              <div className="text-xs text-text-dimmed">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "Image Compress", href: "/image-compress" },
            { name: "Image Resize", href: "/image-resize" },
            { name: "SVG to PNG", href: "/svg-to-png" },
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
