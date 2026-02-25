"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface OriginalImage {
  file: File;
  width: number;
  height: number;
  dataUrl: string;
}

interface ResizedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

export function ImageResizeTool() {
  const [original, setOriginal] = useState<OriginalImage | null>(null);
  const [resized, setResized] = useState<ResizedImage | null>(null);
  const [mode, setMode] = useState<"dimensions" | "percentage">("dimensions");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginal({
          file,
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataUrl: e.target!.result as string,
        });
        setWidth(String(img.naturalWidth));
        setHeight(String(img.naturalHeight));
        setResized(null);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) loadImage(file);
  };

  const handleWidthChange = (v: string) => {
    setWidth(v);
    if (keepAspect && original && v) {
      const ratio = original.height / original.width;
      setHeight(String(Math.round(Number(v) * ratio)));
    }
  };

  const handleHeightChange = (v: string) => {
    setHeight(v);
    if (keepAspect && original && v) {
      const ratio = original.width / original.height;
      setWidth(String(Math.round(Number(v) * ratio)));
    }
  };

  const resize = async () => {
    if (!original) return;
    setProcessing(true);
    try {
      let targetW: number, targetH: number;
      if (mode === "percentage") {
        const pct = Number(percent) / 100;
        targetW = Math.round(original.width * pct);
        targetH = Math.round(original.height * pct);
      } else {
        targetW = Number(width) || original.width;
        targetH = Number(height) || original.height;
      }

      const img = new Image();
      await new Promise<void>((res) => {
        img.onload = () => res();
        img.src = original.dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
        const name = original.file.name.replace(/\.[^.]+$/, `.${ext}`);
        setResized({
          url: URL.createObjectURL(blob),
          width: targetW,
          height: targetH,
          size: blob.size,
          name,
        });
        setProcessing(false);
      }, format, 0.92);
    } catch {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Image Resize"
      description="Resize images by dimensions or percentage — runs in your browser, nothing uploaded."
    >
      {!original ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
            ${dragging
              ? "border-accent bg-[var(--dp-bg-subtle)]"
              : "border-[var(--dp-border)] hover:border-accent hover:bg-[var(--dp-bg-subtle)]"}
          `}
        >
          <Upload size={28} className="mx-auto mb-3 text-text-dimmed" />
          <p className="text-sm text-text-secondary mb-1">
            Drag &amp; drop an image, or <span className="text-accent">click to browse</span>
          </p>
          <p className="text-xs text-text-muted">PNG, JPG, WebP, GIF, SVG • Processed locally</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Original info */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--dp-bg-subtle)] border border-[var(--dp-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={original.dataUrl}
              alt="Original"
              className="w-20 h-20 object-cover rounded border border-[var(--dp-border)]"
            />
            <div className="flex-1">
              <div className="text-sm font-mono text-text-primary">{original.file.name}</div>
              <div className="text-xs text-text-dimmed mt-1">
                {original.width} × {original.height}px · {formatBytes(original.file.size)}
              </div>
              <button
                onClick={() => { setOriginal(null); setResized(null); }}
                className="text-xs text-accent hover:underline mt-2"
              >
                Change image
              </button>
            </div>
          </div>

          {/* Resize options */}
          <div className="p-4 rounded-lg bg-[var(--dp-bg-card)] border border-[var(--dp-border)] space-y-4">
            <div className="flex gap-2">
              {(["dimensions", "percentage"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
                >
                  {m === "dimensions" ? "Exact Dimensions" : "By Percentage"}
                </button>
              ))}
            </div>

            {mode === "dimensions" ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-dimmed">Width:</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="tool-textarea w-20 text-xs"
                    min={1}
                  />
                  <span className="text-xs text-text-dimmed">px</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-dimmed">Height:</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="tool-textarea w-20 text-xs"
                    min={1}
                  />
                  <span className="text-xs text-text-dimmed">px</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(e) => setKeepAspect(e.target.checked)}
                    className="accent-[var(--dp-accent)]"
                  />
                  Lock aspect ratio
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="text-xs text-text-dimmed">Scale:</label>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="w-32"
                />
                <input
                  type="number"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="tool-textarea w-16 text-xs"
                  min={1}
                  max={200}
                />
                <span className="text-xs text-text-dimmed">%</span>
                <span className="text-xs text-text-dimmed">
                  → {Math.round(original.width * Number(percent) / 100)} × {Math.round(original.height * Number(percent) / 100)}px
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="text-xs text-text-dimmed">Output format:</label>
              {([
                { v: "image/png", l: "PNG" },
                { v: "image/jpeg", l: "JPG" },
                { v: "image/webp", l: "WebP" },
              ] as const).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFormat(v)}
                  className={`tab-btn text-xs ${format === v ? "active" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={resize}
              disabled={processing}
              className="action-btn"
            >
              {processing ? "Resizing..." : "Resize Image"}
            </button>
          </div>

          {/* Result */}
          {resized && (
            <div className="p-4 rounded-lg bg-[var(--dp-bg-card)] border border-[var(--dp-border)] flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resized.url}
                alt="Resized"
                className="w-20 h-20 object-cover rounded border border-[var(--dp-border)]"
              />
              <div className="flex-1">
                <div className="text-sm font-mono text-text-primary">{resized.name}</div>
                <div className="text-xs text-text-dimmed mt-1">
                  {resized.width} × {resized.height}px · {formatBytes(resized.size)}
                </div>
              </div>
              <a
                href={resized.url}
                download={resized.name}
                className="action-btn"
              >
                <Download size={13} />
                Download
              </a>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: "Does resizing reduce quality?",
              a: "Downscaling preserves quality well. Upscaling uses bilinear interpolation and may look slightly blurry. Always start from the original.",
            },
            {
              q: "Is my image uploaded anywhere?",
              a: "No. Everything runs in your browser using the HTML5 Canvas API. Your images are never uploaded or transmitted.",
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
            { name: "Image Compress", href: "/image-compress" },
            { name: "PNG to JPG", href: "/png-to-jpg" },
            { name: "WebP to PNG", href: "/webp-to-png" },
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
