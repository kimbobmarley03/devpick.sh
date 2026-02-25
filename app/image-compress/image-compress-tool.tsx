"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, X } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface CompressedFile {
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressedUrl: string;
  outputName: string;
  width: number;
  height: number;
}

async function compressImage(
  file: File,
  quality: number,
  outputFormat: "image/jpeg" | "image/webp" | "image/png"
): Promise<CompressedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        if (outputFormat === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("Compression failed")); return; }
            const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/webp" ? "webp" : "png";
            const outputName = file.name.replace(/\.[^.]+$/, `.${ext}`);
            resolve({
              originalName: file.name,
              originalSize: file.size,
              compressedSize: blob.size,
              compressedUrl: URL.createObjectURL(blob),
              outputName,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          },
          outputFormat,
          outputFormat === "image/png" ? undefined : quality / 100
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function ImageCompressTool() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/jpeg");
  const [converting, setConverting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
      if (!arr.length) { setErrors(["No image files selected."]); return; }
      setConverting(true);
      setErrors([]);
      const errs: string[] = [];
      const results: CompressedFile[] = [];
      for (const f of arr) {
        try {
          const r = await compressImage(f, quality, outputFormat);
          results.push(r);
        } catch (e) {
          errs.push(`${f.name}: ${(e as Error).message}`);
        }
      }
      setFiles((prev) => [...prev, ...results]);
      setErrors(errs);
      setConverting(false);
    },
    [quality, outputFormat]
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
      URL.revokeObjectURL(prev[idx].compressedUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const downloadAll = () => {
    files.forEach((f) => {
      const a = document.createElement("a");
      a.href = f.compressedUrl;
      a.download = f.outputName;
      a.click();
    });
  };

  const totalOriginal = files.reduce((s, f) => s + f.originalSize, 0);
  const totalCompressed = files.reduce((s, f) => s + f.compressedSize, 0);

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images and reduce file size — runs entirely in your browser, nothing uploaded."
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
            className="w-28"
          />
          <span className="text-text-secondary font-mono text-xs w-8">{quality}%</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-text-dimmed text-xs">Output:</label>
          {([
            { v: "image/jpeg" as const, l: "JPG" },
            { v: "image/webp" as const, l: "WebP" },
            { v: "image/png" as const, l: "PNG" },
          ]).map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setOutputFormat(v)}
              className={`tab-btn text-xs ${outputFormat === v ? "active" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>
        {outputFormat === "image/png" && (
          <span className="text-xs text-text-dimmed">
            PNG is lossless — quality slider has no effect
          </span>
        )}
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
          Drag &amp; drop images here, or{" "}
          <span className="text-accent">click to browse</span>
        </p>
        <p className="text-xs text-text-muted">
          Supports PNG, JPG, WebP • Multiple files • Processed locally
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
          Compressing...
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="text-[var(--dp-error)] text-xs bg-[var(--dp-bg-subtle)] rounded px-3 py-2">
              {e}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-semibold text-text-secondary">
                Compressed Files ({files.length})
              </span>
              {files.length > 1 && (
                <span className="text-xs text-text-dimmed ml-3">
                  Total: {formatBytes(totalOriginal)} →{" "}
                  <span className={totalCompressed < totalOriginal ? "text-green-400" : ""}>
                    {formatBytes(totalCompressed)}
                  </span>
                  {totalCompressed < totalOriginal && (
                    <span className="text-green-400 ml-1">
                      (−{Math.round((1 - totalCompressed / totalOriginal) * 100)}%)
                    </span>
                  )}
                </span>
              )}
            </div>
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

          {files.map((f, i) => {
            const saved = f.originalSize - f.compressedSize;
            const pct = Math.round((saved / f.originalSize) * 100);
            return (
              <div
                key={i}
                className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-text-primary truncate">{f.outputName}</div>
                  <div className="text-xs text-text-dimmed mt-0.5">
                    {f.width}×{f.height}px
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-text-dimmed">
                      {formatBytes(f.originalSize)} →{" "}
                      <span className={f.compressedSize < f.originalSize ? "text-green-400" : "text-[var(--dp-error)]"}>
                        {formatBytes(f.compressedSize)}
                      </span>
                    </div>
                    {saved > 0 ? (
                      <span className="text-xs text-green-400 font-semibold">−{pct}%</span>
                    ) : (
                      <span className="text-xs text-[var(--dp-error)]">+{Math.abs(pct)}%</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1 rounded-full bg-[var(--dp-bg-subtle)] w-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${saved > 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, Math.max(0, 100 - pct))}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={f.compressedUrl}
                    download={f.outputName}
                    className="action-btn text-xs"
                    style={{ padding: "4px 10px" }}
                  >
                    <Download size={12} />
                    Save
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
            );
          })}

          <button
            onClick={() => {
              files.forEach((f) => URL.revokeObjectURL(f.compressedUrl));
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
              q: "What quality level should I use?",
              a: "For photos, 70–85% is usually indistinguishable from the original while reducing size by 30–60%. For images with text or sharp edges, use 85–90%.",
            },
            {
              q: "Is my image uploaded to a server?",
              a: "No. All compression happens in your browser using the HTML5 Canvas API. Your images never leave your device.",
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
            { name: "Image Resize", href: "/image-resize" },
            { name: "PNG to JPG", href: "/png-to-jpg" },
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "Image → Base64", href: "/image-base64" },
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
