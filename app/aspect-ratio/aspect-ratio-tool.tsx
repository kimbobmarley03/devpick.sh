"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Lock, Unlock } from "lucide-react";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(w: number, h: number): [number, number] {
  if (!w || !h) return [w, h];
  const g = gcd(Math.round(w), Math.round(h));
  return [Math.round(w) / g, Math.round(h) / g];
}

const PRESETS = [
  { label: "16:9", w: 1920, h: 1080 },
  { label: "4:3", w: 1024, h: 768 },
  { label: "1:1", w: 1080, h: 1080 },
  { label: "9:16", w: 1080, h: 1920 },
  { label: "21:9", w: 2560, h: 1080 },
  { label: "3:2", w: 1500, h: 1000 },
  { label: "5:4", w: 1280, h: 1024 },
  { label: "2:1", w: 2000, h: 1000 },
];

function RatioVisual({ w, h }: { w: number; h: number }) {
  if (!w || !h) return null;
  const ratio = w / h;
  const maxW = 240;
  const maxH = 160;
  let vw: number, vh: number;
  if (ratio >= 1) {
    vw = maxW;
    vh = Math.round(maxW / ratio);
    if (vh > maxH) { vh = maxH; vw = Math.round(maxH * ratio); }
  } else {
    vh = maxH;
    vw = Math.round(maxH * ratio);
    if (vw > maxW) { vw = maxW; vh = Math.round(maxW / ratio); }
  }
  return (
    <div className="flex items-center justify-center" style={{ width: maxW + 32, height: maxH + 32 }}>
      <div
        className="border-2 border-accent bg-[var(--dp-bg-subtle)] rounded flex items-center justify-center text-xs text-text-dimmed font-mono"
        style={{ width: vw, height: vh }}
      >
        {vw}×{vh}
      </div>
    </div>
  );
}

export function AspectRatioTool() {
  useWebMCP({
    name: "calculateAspectRatio",
    description: "Calculate aspect ratio from dimensions",
    inputSchema: {
      type: "object" as const,
      properties: {
      "width": {
            "type": "string",
            "description": "Width"
      },
      "height": {
            "type": "string",
            "description": "Height"
      }
},
      required: ["width", "height"],
    },
    execute: async (params) => {
      const w = Number(params.width); const h = Number(params.height); const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a; const d = gcd(w, h); return { content: [{ type: "text", text: `${w/d}:${h/d}` }] };
    },
  });

  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("1080");
  const [locked, setLocked] = useState(false);
  const [scaleWidth, setScaleWidth] = useState<string>("");
  const [scaleHeight, setScaleHeight] = useState<string>("");

  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  const [rw, rh] = w && h ? simplifyRatio(w, h) : [0, 0];
  const ratioStr = rw && rh ? `${rw}:${rh}` : "—";
  const decimalRatio = w && h ? (w / h).toFixed(4) : "—";
  const percent = w && h ? `${((h / w) * 100).toFixed(2)}%` : "—";

  const handleWidth = useCallback((val: string) => {
    setWidth(val);
    if (locked && h) {
      const nw = parseFloat(val) || 0;
      setHeight(nw && h ? String(Math.round(nw * (h / w) * 10) / 10) : height);
    }
  }, [locked, w, h, height]);

  const handleHeight = useCallback((val: string) => {
    setHeight(val);
    if (locked && w) {
      const nh = parseFloat(val) || 0;
      setWidth(nh && w ? String(Math.round(nh * (w / h) * 10) / 10) : width);
    }
  }, [locked, w, h, width]);

  const handleScaleWidth = (val: string) => {
    setScaleWidth(val);
    const sw = parseFloat(val);
    if (sw && w && h) {
      setScaleHeight(String(Math.round(sw * (h / w) * 10) / 10));
    } else {
      setScaleHeight("");
    }
  };

  const handleScaleHeight = (val: string) => {
    setScaleHeight(val);
    const sh = parseFloat(val);
    if (sh && w && h) {
      setScaleWidth(String(Math.round(sh * (w / h) * 10) / 10));
    } else {
      setScaleWidth("");
    }
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    setScaleWidth("");
    setScaleHeight("");
  };

  return (
    <ToolLayout agentReady
      title="Aspect Ratio Calculator"
      description="Calculate aspect ratios, lock dimensions, and scale to any size"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Left: inputs */}
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <div className="text-xs text-text-dimmed mb-2">Common Presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`tab-btn ${ratioStr === p.label ? "active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* W × H inputs with lock */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-text-dimmed block mb-1">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidth(e.target.value)}
                min={1}
                className="tool-textarea w-full font-mono"
                style={{ height: "44px", padding: "8px 12px", resize: "none" }}
              />
            </div>
            <div className="mt-5">
              <button
                onClick={() => setLocked(l => !l)}
                title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                className={`p-2 rounded-lg border transition-colors ${locked ? "border-accent text-accent bg-[var(--dp-bg-subtle)]" : "border-[var(--dp-border)] text-text-dimmed hover:border-accent hover:text-accent"}`}
              >
                {locked ? <Lock size={18} /> : <Unlock size={18} />}
              </button>
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-dimmed block mb-1">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeight(e.target.value)}
                min={1}
                className="tool-textarea w-full font-mono"
                style={{ height: "44px", padding: "8px 12px", resize: "none" }}
              />
            </div>
          </div>

          {locked && (
            <p className="text-xs text-accent -mt-3">🔒 Aspect ratio locked — change one side to scale the other</p>
          )}

          {/* Results */}
          {w > 0 && h > 0 && (
            <div className="bg-[var(--dp-bg-card)] border border-[var(--dp-border)] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dimmed">Aspect Ratio</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-text-primary">{ratioStr}</span>
                  <CopyButton text={ratioStr} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dimmed">Decimal Ratio</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-text-secondary">{decimalRatio}</span>
                  <CopyButton text={decimalRatio} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dimmed">CSS padding-top (ratio trick)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-text-secondary">{percent}</span>
                  <CopyButton text={percent} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dimmed">Dimensions</span>
                <span className="font-mono text-sm text-text-secondary">{Math.round(w)} × {Math.round(h)}</span>
              </div>
            </div>
          )}

          {/* Scale section */}
          {w > 0 && h > 0 && (
            <div>
              <div className="text-xs text-text-dimmed mb-2">Scale to new size (maintains ratio)</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-text-dimmed block mb-1">New Width</label>
                  <input
                    type="number"
                    value={scaleWidth}
                    onChange={(e) => handleScaleWidth(e.target.value)}
                    placeholder="e.g. 1280"
                    min={1}
                    className="tool-textarea w-full font-mono"
                    style={{ height: "40px", padding: "8px 12px", resize: "none" }}
                  />
                </div>
                <span className="mt-4 text-text-dimmed">→</span>
                <div className="flex-1">
                  <label className="text-xs text-text-dimmed block mb-1">New Height</label>
                  <input
                    type="number"
                    value={scaleHeight}
                    onChange={(e) => handleScaleHeight(e.target.value)}
                    placeholder="e.g. 720"
                    min={1}
                    className="tool-textarea w-full font-mono"
                    style={{ height: "40px", padding: "8px 12px", resize: "none" }}
                  />
                </div>
              </div>
              {scaleWidth && scaleHeight && (
                <div className="mt-2 text-xs text-[var(--dp-success)] font-mono">
                  ✓ {Math.round(parseFloat(scaleWidth))} × {Math.round(parseFloat(scaleHeight))} maintains {ratioStr}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: visual */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs text-text-dimmed">Visual Preview</div>
          <RatioVisual w={w} h={h} />
          {ratioStr !== "—" && (
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-text-primary">{ratioStr}</div>
              <div className="text-xs text-text-dimmed mt-0.5">{w > h ? "Landscape" : w < h ? "Portrait" : "Square"}</div>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Favicon Generator", href: "/favicon-generator" },
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "CSS Grid Generator", href: "/css-grid" },
            { name: "Flexbox Playground", href: "/flexbox" },
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
