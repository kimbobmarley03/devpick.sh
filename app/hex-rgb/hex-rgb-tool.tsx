"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

// ── Conversions ──────────────────────────────────────────────────────────────

function expandHex(raw: string): string | null {
  let h = raw.trim().replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = expandHex(hex);
  if (!h) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    default:  h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function clamp(n: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, n)); }

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = "hex" | "rgb";

export function HexRgbTool() {
  useWebMCP({
    name: "convertHexRgb",
    description: "Convert between hex and RGB color values",
    inputSchema: {
      type: "object" as const,
      properties: {
      "color": {
            "type": "string",
            "description": "Hex (#ff0000) or RGB (255,0,0)"
      }
},
      required: ["color"],
    },
    execute: async (params) => {
      const c = (params.color as string).trim(); if (c.startsWith("#")) { const r = parseInt(c.slice(1,3),16); const g = parseInt(c.slice(3,5),16); const b = parseInt(c.slice(5,7),16); return { content: [{ type: "text", text: `rgb(${r}, ${g}, ${b})` }] }; } else { const m = c.match(/(\d+)/g); if (m && m.length >= 3) return { content: [{ type: "text", text: "#" + m.slice(0,3).map(n => parseInt(n).toString(16).padStart(2,"0")).join("") }] }; return { content: [{ type: "text", text: "Error: Invalid color" }] }; }
    },
  });

  const [mode, setMode] = useState<Mode>("hex");

  // Hex mode state
  const [hexInput, setHexInput] = useState("#ff5733");

  // RGB mode state
  const [r, setR] = useState(255);
  const [g, setG] = useState(87);
  const [b, setB] = useState(51);

  // ── Derived values ────────────────────────────────────────────────────────

  const fromHex = useCallback(() => {
    const rgb = hexToRgb(hexInput);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { ...rgb, hsl };
  }, [hexInput]);

  const fromRgb = useCallback(() => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    return { hex, hsl };
  }, [r, g, b]);

  // ── Render ────────────────────────────────────────────────────────────────

  const result = mode === "hex" ? fromHex() : fromRgb();

  const previewColor =
    mode === "hex"
      ? result
        ? `rgb(${(result as { r: number; g: number; b: number }).r},${(result as { r: number; g: number; b: number }).g},${(result as { r: number; g: number; b: number }).b})`
        : "transparent"
      : `rgb(${r},${g},${b})`;

  // hex→rgb result
  const hxResult = mode === "hex" ? (result as { r: number; g: number; b: number; hsl: { h: number; s: number; l: number } } | null) : null;
  // rgb→hex result
  const rgResult = mode === "rgb" ? (result as { hex: string; hsl: { h: number; s: number; l: number } } | null) : null;

  return (
    <ToolLayout agentReady
      title="Hex ↔ RGB Converter"
      description="Convert hex color codes to RGB and HSL — or go the other way"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(["hex", "rgb"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn uppercase ${mode === m ? "active" : ""}`}
          >
            {m === "hex" ? "Hex → RGB" : "RGB → Hex"}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => {
              if (mode === "hex") setHexInput("#ff5733");
              else { setR(255); setG(87); setB(51); }
            }}
            className="action-btn"
          >
            <Trash2 size={13} />
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Input panel */}
        <div className="flex-1 space-y-4">
          {mode === "hex" ? (
            <div className="space-y-2">
              <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
                Hex Color
              </label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                placeholder="#ff5733 or fff"
                className="tool-textarea w-full font-mono"
                style={{ height: "44px", resize: "none" }}
                spellCheck={false}
              />
              {hexInput && !hxResult && (
                <p className="text-xs text-red-400 font-mono">Invalid hex color</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {([
                { label: "R", val: r, set: setR },
                { label: "G", val: g, set: setG },
                { label: "B", val: b, set: setB },
              ] as { label: string; val: number; set: (v: number) => void }[]).map(({ label, val, set }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-text-dimmed">
                    <span>{label}</span>
                    <span>{val}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={val}
                    onChange={(e) => set(clamp(parseInt(e.target.value), 0, 255))}
                    className="w-full accent-blue-500"
                  />
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={val}
                    onChange={(e) => set(clamp(parseInt(e.target.value) || 0, 0, 255))}
                    className="tool-textarea font-mono text-center"
                    style={{ width: "80px", height: "34px", padding: "6px 8px", resize: "none" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Color preview */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-40 h-40 rounded-xl border border-border-strong shadow-lg"
            style={{ backgroundColor: previewColor }}
          />
          <span className="text-xs text-text-dimmed font-mono">{previewColor}</span>
        </div>

        {/* Output panel */}
        <div className="flex-1 space-y-3">
          {mode === "hex" && hxResult && (
            <>
              <OutputRow label="RGB" value={`rgb(${hxResult.r}, ${hxResult.g}, ${hxResult.b})`} />
              <OutputRow label="R" value={String(hxResult.r)} />
              <OutputRow label="G" value={String(hxResult.g)} />
              <OutputRow label="B" value={String(hxResult.b)} />
              <OutputRow label="HSL" value={`hsl(${hxResult.hsl.h}, ${hxResult.hsl.s}%, ${hxResult.hsl.l}%)`} />
              <OutputRow label="Hex (normalized)" value={`#${expandHex(hexInput)!}`} />
            </>
          )}
          {mode === "rgb" && rgResult && (
            <>
              <OutputRow label="Hex" value={rgResult.hex} />
              <OutputRow label="RGB" value={`rgb(${r}, ${g}, ${b})`} />
              <OutputRow label="HSL" value={`hsl(${rgResult.hsl.h}, ${rgResult.hsl.s}%, ${rgResult.hsl.l}%)`} />
              <OutputRow label="CSS rgba" value={`rgba(${r}, ${g}, ${b}, 1)`} />
            </>
          )}
          {!result && <p className="text-sm text-text-muted font-mono">Enter a valid color above</p>}
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Picker", href: "/color-picker" },
            { name: "Color Palette Generator", href: "/color-palette" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
            { name: "Color Picker from Image", href: "/color-from-image" },
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

function OutputRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-card-bg border border-card-border rounded-lg px-3 py-2">
      <span className="text-xs text-text-dimmed font-mono w-24 shrink-0">{label}</span>
      <span className="font-mono text-sm text-text-primary flex-1 truncate">{value}</span>
      <CopyButton text={value} />
    </div>
  );
}
