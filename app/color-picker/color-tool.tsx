"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
    case gn: h = ((bn - rn) / d + 2) / 6; break;
    case bn: h = ((rn - gn) / d + 4) / 6; break;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function ColorTool() {
  const [hex, setHex] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [rgbInput, setRgbInput] = useState({ r: "59", g: "130", b: "246" });
  const [hslInput, setHslInput] = useState({ h: "217", s: "91", l: "60" });
  const [recent, setRecent] = useState<string[]>([]);

  const updateFromHex = useCallback((h: string) => {
    const rgb = hexToRgb(h);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHex(h);
    setHexInput(h);
    setRgbInput({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });
    setHslInput({ h: String(hsl.h), s: String(hsl.s), l: String(hsl.l) });
    setRecent((prev) => {
      const next = [h, ...prev.filter((c) => c !== h)].slice(0, 12);
      return next;
    });
  }, []);

  const handleColorPicker = (v: string) => updateFromHex(v);

  const handleHexInput = (v: string) => {
    setHexInput(v);
    const clean = v.startsWith("#") ? v : `#${v}`;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) updateFromHex(clean);
  };

  const handleRgb = (field: "r" | "g" | "b", v: string) => {
    const next = { ...rgbInput, [field]: v };
    setRgbInput(next);
    const r = parseInt(next.r), g = parseInt(next.g), b = parseInt(next.b);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b) && r <= 255 && g <= 255 && b <= 255) {
      const h = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);
      setHex(h);
      setHexInput(h);
      setHslInput({ h: String(hsl.h), s: String(hsl.s), l: String(hsl.l) });
    }
  };

  const handleHsl = (field: "h" | "s" | "l", v: string) => {
    const next = { ...hslInput, [field]: v };
    setHslInput(next);
    const h = parseInt(next.h), s = parseInt(next.s), l = parseInt(next.l);
    if (!isNaN(h) && !isNaN(s) && !isNaN(l) && h <= 360 && s <= 100 && l <= 100) {
      const hexVal = hslToHex(h, s, l);
      const rgb = hexToRgb(hexVal);
      setHex(hexVal);
      setHexInput(hexVal);
      if (rgb) setRgbInput({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });
    }
  };

  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout
      title="Color Picker"
      description="Pick a color and convert between HEX, RGB, and HSL formats"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: picker + swatch */}
        <div className="flex flex-col gap-4">
          {/* Swatch */}
          <div
            className="rounded-xl border border-card-border flex items-center justify-center"
            style={{ height: "180px", background: hex }}
          >
            <span
              className="font-mono text-lg font-bold px-4 py-2 rounded-lg"
              style={{
                background: "rgba(0,0,0,0.4)",
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {hex.toUpperCase()}
            </span>
          </div>

          {/* Picker */}
          <div className="flex items-center gap-4 bg-card-bg border border-card-border rounded-xl p-4">
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <span className="text-xs text-text-dimmed font-mono">Color Picker</span>
              <input
                type="color"
                value={hex}
                onChange={(e) => handleColorPicker(e.target.value)}
                className="cursor-pointer rounded border-0"
                style={{ width: "60px", height: "40px", padding: "2px", background: "transparent" }}
              />
            </label>
            <div className="flex-1">
              <div className="text-xs text-text-dimmed font-mono mb-1">HEX</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="tool-textarea flex-1"
                  style={{ height: "34px", padding: "6px 10px", resize: "none" }}
                  placeholder="#000000"
                  spellCheck={false}
                />
                <CopyButton text={hex.toUpperCase()} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: RGB + HSL */}
        <div className="flex flex-col gap-4">
          {/* RGB */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">RGB</div>
              <CopyButton text={rgbStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["r", "g", "b"] as const).map((ch) => (
                <div key={ch}>
                  <div className="text-xs text-text-dimmed font-mono mb-1">{ch.toUpperCase()} (0-255)</div>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgbInput[ch]}
                    onChange={(e) => handleRgb(ch, e.target.value)}
                    className="tool-textarea w-full text-center"
                    style={{ height: "34px", padding: "6px 4px", resize: "none" }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 font-mono text-sm text-text-secondary">{rgbStr}</div>
          </div>

          {/* HSL */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">HSL</div>
              <CopyButton text={hslStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-text-dimmed font-mono mb-1">H (0-360)</div>
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={hslInput.h}
                  onChange={(e) => handleHsl("h", e.target.value)}
                  className="tool-textarea w-full text-center"
                  style={{ height: "34px", padding: "6px 4px", resize: "none" }}
                />
              </div>
              <div>
                <div className="text-xs text-text-dimmed font-mono mb-1">S (0-100)</div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hslInput.s}
                  onChange={(e) => handleHsl("s", e.target.value)}
                  className="tool-textarea w-full text-center"
                  style={{ height: "34px", padding: "6px 4px", resize: "none" }}
                />
              </div>
              <div>
                <div className="text-xs text-text-dimmed font-mono mb-1">L (0-100)</div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={hslInput.l}
                  onChange={(e) => handleHsl("l", e.target.value)}
                  className="tool-textarea w-full text-center"
                  style={{ height: "34px", padding: "6px 4px", resize: "none" }}
                />
              </div>
            </div>
            <div className="mt-2 font-mono text-sm text-text-secondary">{hslStr}</div>
          </div>
        </div>
      </div>

      {/* Recent colors */}
      {recent.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Recent Colors</span>
            <button onClick={() => setRecent([])} className="action-btn text-xs">
              <Trash2 size={11} />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((c, i) => (
              <button
                key={i}
                title={c}
                onClick={() => updateFromHex(c)}
                className="rounded-lg border border-border-strong hover:border-border-strong transition-colors"
                style={{ width: "36px", height: "36px", background: c }}
              />
            ))}
          </div>
        </div>
      )}
      {/* FAQ Section */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What is a hex color code?", a: "A hex color code is a 6-digit hexadecimal value (e.g., #3b82f6) that represents a color. The first two digits are red, the next two are green, and the last two are blue, each ranging from 00 to ff." },
            { q: "How do I convert HEX to RGB?", a: "Each pair of hex digits represents a color channel (R, G, B). For example, #3b82f6 converts to rgb(59, 130, 246) — just convert each pair from base-16 to base-10. Our tool does this automatically." },
            { q: "What is HSL?", a: "HSL stands for Hue, Saturation, and Lightness. Hue is the color angle (0-360°), Saturation is the color intensity (0-100%), and Lightness is how light or dark it is (0-100%). It's often more intuitive than RGB for design work." },
            { q: "What is the difference between RGB and RGBA?", a: "RGB defines a color using Red, Green, and Blue channels. RGBA adds a fourth Alpha channel for opacity/transparency, ranging from 0 (fully transparent) to 1 (fully opaque)." },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "Color Palette Generator", href: "/color-palette" },
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
