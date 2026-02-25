"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

type PaletteType = "complementary" | "analogous" | "triadic" | "split-complementary" | "monochromatic";

// ─── Color math ─────────────────────────────────────────────────────────────
function hexToHsl(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  function f(n: number) {
    const k = (n + h / 30) % 12;
    const v = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v).toString(16).padStart(2, "0");
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

function mod(n: number, m: number) { return ((n % m) + m) % m; }

function generatePalette(hex: string, type: PaletteType): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [];
  const [h, s, l] = hsl;

  switch (type) {
    case "complementary":
      return [
        hex,
        hslToHex(mod(h + 180, 360), s, l),
        hslToHex(h, s, Math.max(10, l - 20)),
        hslToHex(mod(h + 180, 360), s, Math.min(90, l + 20)),
        hslToHex(h, Math.max(10, s - 30), Math.min(90, l + 30)),
      ];
    case "analogous":
      return [
        hslToHex(mod(h - 30, 360), s, l),
        hslToHex(mod(h - 15, 360), s, l),
        hex,
        hslToHex(mod(h + 15, 360), s, l),
        hslToHex(mod(h + 30, 360), s, l),
      ];
    case "triadic":
      return [
        hex,
        hslToHex(mod(h + 120, 360), s, l),
        hslToHex(mod(h + 240, 360), s, l),
        hslToHex(mod(h + 120, 360), s, Math.min(90, l + 15)),
        hslToHex(mod(h + 240, 360), s, Math.max(10, l - 15)),
      ];
    case "split-complementary":
      return [
        hex,
        hslToHex(mod(h + 150, 360), s, l),
        hslToHex(mod(h + 210, 360), s, l),
        hslToHex(mod(h + 150, 360), s, Math.min(90, l + 20)),
        hslToHex(mod(h + 210, 360), s, Math.max(10, l - 20)),
      ];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(10, l - 15)),
        hex,
        hslToHex(h, s, Math.min(90, l + 15)),
        hslToHex(h, s, Math.min(90, l + 30)),
      ];
  }
}

const PALETTE_TYPES: { value: PaletteType; label: string; desc: string }[] = [
  { value: "complementary", label: "Complementary", desc: "Opposite colors on the wheel" },
  { value: "analogous", label: "Analogous", desc: "Adjacent colors for harmony" },
  { value: "triadic", label: "Triadic", desc: "3 evenly spaced colors" },
  { value: "split-complementary", label: "Split-Comp", desc: "Base + two complement neighbors" },
  { value: "monochromatic", label: "Monochromatic", desc: "Shades of one hue" },
];

function isLight(hex: string): boolean {
  const m = hex.replace("#","").match(/([a-f\d]{2})/gi);
  if (!m) return true;
  const [r,g,b] = m.map(x => parseInt(x,16));
  return (0.299*r + 0.587*g + 0.114*b) > 128;
}

export function ColorPaletteTool() {
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [inputHex, setInputHex] = useState("#3b82f6");
  const [paletteType, setPaletteType] = useState<PaletteType>("complementary");
  const [palette, setPalette] = useState<string[]>([]);

  const generate = useCallback((hex: string, type: PaletteType) => {
    const p = generatePalette(hex, type);
    setPalette(p);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { generate(baseColor, paletteType); }, [baseColor, paletteType, generate]);

  const handleHexInput = (v: string) => {
    setInputHex(v);
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      setBaseColor(v);
    }
  };

  const copyAll = palette.join(", ");

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate harmonious color palettes from any base color"
    >
      {/* Base color input */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-dimmed font-mono">Base color:</label>
          <div className="relative flex items-center gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => { setBaseColor(e.target.value); setInputHex(e.target.value); }}
              className="w-10 h-10 rounded cursor-pointer border border-[var(--dp-border)] bg-transparent"
            />
            <input
              type="text"
              value={inputHex}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#3b82f6"
              className="tool-textarea font-mono"
              style={{ width: "110px", height: "40px", padding: "8px 12px", resize: "none" }}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {hexToHsl(baseColor) && (
            <span className="text-xs text-text-dimmed font-mono">
              hsl({hexToHsl(baseColor)!.join(", ")})
            </span>
          )}
        </div>
      </div>

      {/* Palette type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PALETTE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setPaletteType(t.value)}
            className={`tab-btn ${paletteType === t.value ? "active" : ""}`}
            title={t.desc}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Palette display */}
      {palette.length > 0 && (
        <>
          <div className="grid grid-cols-5 rounded-xl overflow-hidden border border-[var(--dp-border)]" style={{ minHeight: 160 }}>
            {palette.map((color, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-end p-3 gap-1"
                style={{ backgroundColor: color }}
              >
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: isLight(color) ? "#111" : "#fff" }}
                >
                  {color}
                </span>
              </div>
            ))}
          </div>

          {/* Per-color copy */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {palette.map((color, i) => (
              <div key={i} className="flex items-center gap-2 bg-[var(--dp-bg-subtle)] rounded px-2 py-1.5">
                <div className="w-5 h-5 rounded flex-shrink-0 border border-[var(--dp-border)]" style={{ backgroundColor: color }} />
                <span className="font-mono text-xs text-text-secondary flex-1 truncate">{color}</span>
                <CopyButton text={color} />
              </div>
            ))}
          </div>

          {/* Copy all */}
          <div className="mt-3 flex items-center gap-2">
            <CopyButton text={copyAll} />
            <span className="text-xs text-text-dimmed">Copy all HEX values</span>
          </div>

          {/* CSS snippet */}
          <div className="mt-4">
            <div className="text-xs text-text-dimmed font-mono mb-1">CSS Custom Properties</div>
            <div className="relative bg-[var(--dp-bg-output)] rounded-lg p-3 font-mono text-xs text-text-secondary overflow-x-auto">
              <pre>{`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`}</pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Picker", href: "/color-picker" },
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "Color Picker from Image", href: "/color-from-image" },
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
