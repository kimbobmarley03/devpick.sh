"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Upload, Trash2 } from "lucide-react";

interface PickedColor {
  hex: string;
  rgb: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      case bn: h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function toHex(n: number) { return n.toString(16).padStart(2, "0"); }

export function ColorFromImageTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedColor | null>(null);
  const [history, setHistory] = useState<PickedColor[]>([]);
  const [dragging, setDragging] = useState(false);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target!.result as string;
      setImageSrc(src);
      setPicked(null);
      setHistory([]);
      // Draw image on canvas
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxW = canvas.parentElement?.clientWidth ?? 600;
        const scale = Math.min(1, maxW / img.naturalWidth);
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadImage(file);
  }, [loadImage]);

  const pickColor = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Scale from display coordinates to canvas pixels
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const ctx = canvas.getContext("2d")!;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const [h, s, l] = rgbToHsl(r, g, b);
    const color: PickedColor = {
      hex, r, g, b,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
    };
    setPicked(color);
    setHistory(prev => {
      if (prev[0]?.hex === color.hex) return prev;
      return [color, ...prev].slice(0, 20);
    });
  }, []);

  const pickFromHistory = (c: PickedColor) => setPicked(c);

  return (
    <ToolLayout
      title="Color Picker from Image"
      description="Upload an image and click anywhere to pick colors — get HEX, RGB, HSL values"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: canvas */}
        <div>
          {!imageSrc ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors
                ${dragging ? "border-accent bg-[var(--dp-bg-subtle)]" : "border-[var(--dp-border)] hover:border-accent hover:bg-[var(--dp-bg-subtle)]"}
              `}
            >
              <Upload size={32} className="mx-auto mb-3 text-text-dimmed" />
              <p className="text-sm text-text-secondary mb-1">
                Drop an image here or <span className="text-accent">click to upload</span>
              </p>
              <p className="text-xs text-text-muted">PNG, JPEG, WebP, GIF</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="relative" ref={containerRef}>
              <div className="relative inline-block w-full">
                <canvas
                  ref={canvasRef}
                  onClick={pickColor}
                  className="w-full rounded-lg border border-[var(--dp-border)] cursor-crosshair block"
                  style={{ maxHeight: "500px", objectFit: "contain" }}
                />
                {crosshair && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: crosshair.x - 8,
                      top: crosshair.y - 8,
                      width: 16,
                      height: 16,
                      border: "2px solid white",
                      borderRadius: "50%",
                      boxShadow: "0 0 0 1px black",
                    }}
                  />
                )}
              </div>
              <button
                onClick={() => { setImageSrc(null); setCrosshair(null); setPicked(null); setHistory([]); }}
                className="mt-2 text-xs text-text-dimmed hover:text-text-secondary"
              >
                Upload different image
              </button>
            </div>
          )}
        </div>

        {/* Right: picked color + history */}
        <div className="flex flex-col gap-4">
          {/* Current picked color */}
          {picked ? (
            <div className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-xl overflow-hidden">
              <div
                className="h-24 w-full"
                style={{ backgroundColor: picked.hex }}
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dimmed font-mono">HEX</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-text-primary">{picked.hex}</span>
                    <CopyButton text={picked.hex} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dimmed font-mono">RGB</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-secondary">{picked.rgb}</span>
                    <CopyButton text={picked.rgb} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dimmed font-mono">HSL</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-secondary">{picked.hsl}</span>
                    <CopyButton text={picked.hsl} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--dp-bg-subtle)] border border-[var(--dp-border)] rounded-xl p-6 text-center text-sm text-text-dimmed">
              {imageSrc ? "Click on the image to pick a color" : "Upload an image to start"}
            </div>
          )}

          {/* Color history */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary">Picked Colors ({history.length})</span>
                <button
                  onClick={() => { setHistory([]); setCrosshair(null); }}
                  className="text-text-dimmed hover:text-[var(--dp-error)] transition-colors"
                  title="Clear history"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((c, i) => (
                  <button
                    key={i}
                    title={`${c.hex}\n${c.rgb}\n${c.hsl}`}
                    onClick={() => pickFromHistory(c)}
                    className="w-8 h-8 rounded-md border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: picked?.hex === c.hex ? "var(--dp-accent)" : "var(--dp-border)",
                    }}
                  />
                ))}
              </div>
              <div className="mt-3">
                <CopyButton
                  text={history.map(c => c.hex).join(", ")}
                />
                <span className="text-xs text-text-dimmed ml-2">Copy all as HEX</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Picker", href: "/color-picker" },
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "Color Palette Generator", href: "/color-palette" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
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
