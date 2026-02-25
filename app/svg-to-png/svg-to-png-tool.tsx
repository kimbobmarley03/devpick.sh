"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ConvertedSvg {
  name: string;
  originalSize: number;
  pngSize: number;
  pngUrl: string;
  width: number;
  height: number;
}

async function svgToPng(
  svgContent: string,
  targetWidth: number,
  targetHeight: number,
  originalName: string,
  originalSize: number
): Promise<ConvertedSvg> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const w = targetWidth || img.naturalWidth || 512;
      const h = targetHeight || img.naturalHeight || 512;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) { reject(new Error("Conversion failed")); return; }
        resolve({
          name: originalName.replace(/\.svg$/i, ".png"),
          originalSize,
          pngSize: pngBlob.size,
          pngUrl: URL.createObjectURL(pngBlob),
          width: w,
          height: h,
        });
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to render SVG")); };
    img.src = url;
  });
}

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#3b82f6" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">SVG</text>
</svg>`;

export function SvgToPngTool() {
  const [svgText, setSvgText] = useState(SAMPLE_SVG);
  const [file, setFile] = useState<File | null>(null);
  const [converted, setConverted] = useState<ConvertedSvg | null>(null);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSvgText(e.target!.result as string);
      setConverted(null);
    };
    reader.readAsText(f);
  }, []);

  const convert = async () => {
    const content = svgText.trim();
    if (!content) return;
    setConverting(true);
    setError("");
    try {
      const w = Number(customWidth) || 0;
      const h = Number(customHeight) || 0;
      const result = await svgToPng(
        content,
        w,
        h,
        file?.name ?? "image.svg",
        file?.size ?? new Blob([content]).size
      );
      setConverted(result);
    } catch (e) {
      setError((e as Error).message);
    }
    setConverting(false);
  };

  return (
    <ToolLayout
      title="SVG to PNG"
      description="Convert SVG files to PNG at any resolution — runs entirely in your browser using the Canvas API."
    >
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMode("text")}
          className={`tab-btn ${inputMode === "text" ? "active" : ""}`}
        >
          Paste SVG
        </button>
        <button
          onClick={() => setInputMode("file")}
          className={`tab-btn ${inputMode === "file" ? "active" : ""}`}
        >
          Upload File
        </button>
      </div>

      {inputMode === "text" ? (
        <div className="space-y-4">
          <div>
            <div className="pane-label">SVG Code</div>
            <textarea
              value={svgText}
              onChange={(e) => { setSvgText(e.target.value); setConverted(null); setFile(null); }}
              placeholder="Paste SVG code here..."
              className="tool-textarea w-full"
              style={{ minHeight: "200px" }}
              spellCheck={false}
            />
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f?.name.endsWith(".svg") || f?.type === "image/svg+xml") loadFile(f);
            else setError("Please drop an SVG file.");
          }}
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
          <p className="text-sm text-text-secondary">
            {file ? file.name : "Drop SVG file or click to browse"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Options */}
      <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[var(--dp-bg-subtle)]">
        <span className="text-xs text-text-dimmed">Output size:</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={customWidth}
            onChange={(e) => setCustomWidth(e.target.value)}
            placeholder="auto"
            className="tool-textarea text-xs"
            style={{ width: "70px", height: "30px", padding: "4px 8px" }}
          />
          <span className="text-xs text-text-dimmed">×</span>
          <input
            type="number"
            value={customHeight}
            onChange={(e) => setCustomHeight(e.target.value)}
            placeholder="auto"
            className="tool-textarea text-xs"
            style={{ width: "70px", height: "30px", padding: "4px 8px" }}
          />
          <span className="text-xs text-text-dimmed">px (leave blank to use SVG dimensions)</span>
        </div>
      </div>

      <button
        onClick={convert}
        disabled={!svgText.trim() || converting}
        className="action-btn mt-4"
      >
        {converting ? "Converting..." : "Convert to PNG"}
      </button>

      {error && (
        <div className="mt-3 text-[var(--dp-error)] text-xs font-mono">{error}</div>
      )}

      {converted && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--dp-bg-card)] border border-[var(--dp-border)] flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={converted.pngUrl}
            alt={converted.name}
            className="w-20 h-20 object-contain rounded border border-[var(--dp-border)] bg-[var(--dp-bg-subtle)]"
          />
          <div className="flex-1">
            <div className="font-mono text-sm text-text-primary">{converted.name}</div>
            <div className="text-xs text-text-dimmed mt-1">
              {converted.width}×{converted.height}px · {formatBytes(converted.pngSize)}
            </div>
          </div>
          <a
            href={converted.pngUrl}
            download={converted.name}
            className="action-btn"
          >
            <Download size={13} />
            Download PNG
          </a>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "PNG to JPG", href: "/png-to-jpg" },
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "Image Resize", href: "/image-resize" },
            { name: "Favicon Generator", href: "/favicon-generator" },
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
