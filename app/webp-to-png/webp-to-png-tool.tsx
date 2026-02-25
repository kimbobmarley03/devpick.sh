"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, Upload, X } from "lucide-react";

interface ConvertedFile {
  name: string;
  originalSize: number;
  pngSize: number;
  pngUrl: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertWebpToPng(file: File): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          const pngUrl = URL.createObjectURL(blob);
          resolve({
            name: file.name.replace(/\.webp$/i, ".png"),
            originalSize: file.size,
            pngSize: blob.size,
            pngUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }, "image/png");
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target!.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function WebpToPngTool() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f =>
      f.type === "image/webp" || f.name.toLowerCase().endsWith(".webp")
    );
    if (!arr.length) { setErrors(["No WebP files selected."]); return; }
    setConverting(true);
    setErrors([]);
    const errs: string[] = [];
    const results: ConvertedFile[] = [];
    for (const f of arr) {
      try {
        const r = await convertWebpToPng(f);
        results.push(r);
      } catch (e) {
        errs.push(`${f.name}: ${(e as Error).message}`);
      }
    }
    setFiles(prev => [...prev, ...results]);
    setErrors(errs);
    setConverting(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const removeFile = (idx: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[idx].pngUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const downloadAll = () => {
    files.forEach(f => {
      const a = document.createElement("a");
      a.href = f.pngUrl;
      a.download = f.name;
      a.click();
    });
  };

  return (
    <ToolLayout
      title="WebP to PNG Converter"
      description="Convert WebP images to PNG format — runs entirely in your browser"
    >
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${dragging
            ? "border-accent bg-[var(--dp-bg-subtle)]"
            : "border-[var(--dp-border)] hover:border-accent hover:bg-[var(--dp-bg-subtle)]"
          }
        `}
      >
        <Upload size={28} className="mx-auto mb-3 text-text-dimmed" />
        <p className="text-sm text-text-secondary mb-1">
          Drag &amp; drop WebP files here, or <span className="text-accent">click to browse</span>
        </p>
        <p className="text-xs text-text-muted">Supports multiple files • Processed locally</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/webp,.webp"
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
            <div key={i} className="text-[var(--dp-error)] text-xs bg-[var(--dp-bg-subtle)] rounded px-3 py-2">{e}</div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-text-secondary">Converted Files ({files.length})</h2>
            {files.length > 1 && (
              <button onClick={downloadAll} className="action-btn text-xs" style={{ padding: "4px 10px" }}>
                <Download size={12} />
                Download All
              </button>
            )}
          </div>

          {files.map((f, i) => (
            <div key={i} className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-lg p-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.pngUrl}
                alt={f.name}
                className="w-16 h-16 object-cover rounded border border-[var(--dp-border)] bg-[var(--dp-bg-subtle)]"
                style={{ imageRendering: "auto" }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-text-primary truncate">{f.name}</div>
                <div className="text-xs text-text-dimmed mt-0.5">
                  {f.width}×{f.height}px · {formatBytes(f.originalSize)} → {formatBytes(f.pngSize)}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={f.pngUrl}
                  download={f.name}
                  className="action-btn text-xs"
                  style={{ padding: "4px 10px" }}
                >
                  <Download size={12} />
                  PNG
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
            onClick={() => { files.forEach(f => URL.revokeObjectURL(f.pngUrl)); setFiles([]); }}
            className="text-xs text-text-dimmed hover:text-text-secondary mt-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Image → Base64", href: "/image-base64" },
            { name: "Favicon Generator", href: "/favicon-generator" },
            { name: "Color Picker from Image", href: "/color-from-image" },
            { name: "QR Code Generator", href: "/qr-code-generator" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
