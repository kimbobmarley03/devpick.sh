"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, Type } from "lucide-react";

type Mode = "image" | "text";
const SIZES = [16, 32, 48, 180] as const;
type FavSize = typeof SIZES[number];

interface FaviconPreview {
  size: FavSize;
  dataUrl: string;
}

function renderFaviconFromImage(img: HTMLImageElement, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL("image/png");
}

function renderFaviconFromText(text: string, bg: string, fg: string, size: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Background
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();
  // Text / emoji
  const fontSize = Math.floor(size * 0.6);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fg;
  ctx.fillText(text.slice(0, 2), size / 2, size / 2 + size * 0.04);
  return canvas.toDataURL("image/png");
}

export function FaviconTool() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("🚀");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [previews, setPreviews] = useState<FaviconPreview[]>([]);
  const [dragging, setDragging] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromText = useCallback(() => {
    if (!text) return;
    const favs: FaviconPreview[] = SIZES.map(size => ({
      size,
      dataUrl: renderFaviconFromText(text, bgColor, fgColor, size),
    }));
    setPreviews(favs);
  }, [text, bgColor, fgColor]);

  const generateFromImage = useCallback((src: string) => {
    const img = new Image();
    img.onload = () => {
      const favs: FaviconPreview[] = SIZES.map(size => ({
        size,
        dataUrl: renderFaviconFromImage(img, size),
      }));
      setPreviews(favs);
    };
    img.src = src;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === "text") generateFromText();
    else if (imageSrc) generateFromImage(imageSrc);
  }, [mode, generateFromText, generateFromImage, imageSrc]);

  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target!.result as string;
      setImageSrc(src);
      generateFromImage(src);
    };
    reader.readAsDataURL(file);
  }, [generateFromImage]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadFile(file);
  }, [loadFile]);

  const downloadAll = () => {
    previews.forEach((p) => {
      const a = document.createElement("a");
      a.href = p.dataUrl;
      a.download = `favicon-${p.size}x${p.size}.png`;
      a.click();
    });
  };

  const sizeLabel = (size: FavSize) => {
    if (size === 180) return "Apple Touch";
    return `${size}px`;
  };

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Create favicons from images or text/emoji — preview and download at all sizes"
    >
      {/* Mode tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setMode("text")} className={`tab-btn ${mode === "text" ? "active" : ""}`}>
          <Type size={12} className="inline mr-1" />
          Text / Emoji
        </button>
        <button onClick={() => setMode("image")} className={`tab-btn ${mode === "image" ? "active" : ""}`}>
          <Upload size={12} className="inline mr-1" />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          {mode === "text" ? (
            <>
              <div>
                <label className="text-xs text-text-dimmed block mb-1">Text or Emoji</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="🚀 or AB"
                  className="tool-textarea w-full"
                  style={{ height: "44px", padding: "8px 12px", resize: "none", fontSize: "1.5rem" }}
                />
                <p className="text-xs text-text-muted mt-1">Up to 2 characters or 1 emoji</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-[var(--dp-border)]"
                    />
                    <span className="font-mono text-xs text-text-secondary">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-dimmed block mb-1">Foreground</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-[var(--dp-border)]"
                    />
                    <span className="font-mono text-xs text-text-secondary">{fgColor}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
                ${dragging ? "border-accent bg-[var(--dp-bg-subtle)]" : "border-[var(--dp-border)] hover:border-accent hover:bg-[var(--dp-bg-subtle)]"}
              `}
            >
              <Upload size={28} className="mx-auto mb-3 text-text-dimmed" />
              <p className="text-sm text-text-secondary mb-1">
                Drop image here or <span className="text-accent">click to upload</span>
              </p>
              <p className="text-xs text-text-muted">PNG, JPEG, WebP, SVG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </div>
          )}

          {/* HTML snippet */}
          {previews.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-text-dimmed font-mono mb-1">HTML — paste in &lt;head&gt;</div>
              <pre className="bg-[var(--dp-bg-output)] rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap">
{`<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`}
              </pre>
            </div>
          )}
        </div>

        {/* Right: previews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">Preview</h2>
            {previews.length > 0 && (
              <button onClick={downloadAll} className="action-btn text-xs" style={{ padding: "4px 10px" }}>
                <Download size={12} />
                Download All
              </button>
            )}
          </div>

          <div className="space-y-3">
            {previews.map((p) => (
              <div key={p.size} className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-lg p-3 flex items-center gap-4">
                {/* Preview on light bg */}
                <div className="bg-white rounded p-2 border border-[var(--dp-border)] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.dataUrl}
                    alt={`${p.size}x${p.size} favicon preview`}
                    width={Math.max(p.size, 32)}
                    height={Math.max(p.size, 32)}
                    style={{ imageRendering: p.size <= 32 ? "pixelated" : "auto", display: "block" }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-mono text-text-primary">{sizeLabel(p.size)}</div>
                  <div className="text-xs text-text-dimmed">{p.size}×{p.size} px</div>
                </div>
                <a
                  href={p.dataUrl}
                  download={`favicon-${p.size}x${p.size}.png`}
                  className="action-btn text-xs"
                  style={{ padding: "4px 10px" }}
                >
                  <Download size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Image → Base64", href: "/image-base64" },
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "Color Picker from Image", href: "/color-from-image" },
            { name: "Meta Tag Generator", href: "/meta-tags" },
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
