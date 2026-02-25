"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2 } from "lucide-react";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const inputStyle: React.CSSProperties = {
  background: "var(--dp-bg-output)",
  border: "1px solid var(--dp-border)",
  borderRadius: "6px",
  color: "var(--dp-text-primary)",
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: "12px",
  padding: "5px 8px",
  outline: "none",
};

export function CssGradientTool() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [radialShape, setRadialShape] = useState<"ellipse" | "circle">("ellipse");
  const [stops, setStops] = useState<ColorStop[]>([
    { id: makeId(), color: "#3b82f6", position: 0 },
    { id: makeId(), color: "#8b5cf6", position: 100 },
  ]);

  const sorted = [...stops].sort((a, b) => a.position - b.position);

  const gradient = (() => {
    const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
    if (type === "radial") return `radial-gradient(${radialShape} at center, ${stopsStr})`;
    return `conic-gradient(from ${angle}deg, ${stopsStr})`;
  })();

  const css = `background: ${gradient};`;

  const updateStop = (id: string, patch: Partial<ColorStop>) =>
    setStops((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStop = () =>
    setStops((ss) => [
      ...ss,
      { id: makeId(), color: "#22c55e", position: Math.round((ss[ss.length - 1]?.position ?? 50) / 2 + 50) },
    ]);

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((ss) => ss.filter((s) => s.id !== id));
  };

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Create linear, radial, and conic CSS gradients with custom color stops"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Type */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Gradient Type</div>
            <div className="flex gap-2 flex-wrap">
              {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`tab-btn capitalize ${type === t ? "active" : ""}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Direction / Angle */}
          {(type === "linear" || type === "conic") && (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Angle: {angle}°</div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <button key={a} onClick={() => setAngle(a)} className={`tab-btn ${angle === a ? "active" : ""}`} style={{ padding: "3px 8px", fontSize: "11px" }}>
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Radial Shape */}
          {type === "radial" && (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Shape</div>
              <div className="flex gap-2">
                {(["ellipse", "circle"] as const).map((s) => (
                  <button key={s} onClick={() => setRadialShape(s)} className={`tab-btn capitalize ${radialShape === s ? "active" : ""}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="pane-label" style={{ marginBottom: 0 }}>Color Stops</div>
              <button onClick={addStop} className="action-btn" style={{ padding: "4px 8px", fontSize: "11px" }}>
                <Plus size={11} />
                Add Stop
              </button>
            </div>

            {/* Gradient bar */}
            <div
              className="w-full h-8 rounded-lg mb-4"
              style={{ background: gradient, border: "1px solid var(--dp-border)" }}
            />

            <div className="flex flex-col gap-2">
              {stops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                    style={{ width: "36px", height: "28px", border: "1px solid var(--dp-border)", borderRadius: "4px", cursor: "pointer", padding: "2px", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                    style={{ ...inputStyle, width: "90px" }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(stop.id, { position: Number(e.target.value) })}
                    style={{ ...inputStyle, width: "52px", textAlign: "center" }}
                  />
                  <span style={{ color: "var(--dp-text-muted)", fontSize: "11px" }}>%</span>
                  <button onClick={() => removeStop(stop.id)} className="action-btn" style={{ padding: "4px 8px" }} disabled={stops.length <= 2}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="flex flex-col gap-4">
          {/* Preview */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Live Preview</div>
            <div
              className="w-full rounded-xl"
              style={{ height: "220px", background: gradient, border: "1px solid var(--dp-border)" }}
            />
          </div>

          {/* CSS Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="pane-label">CSS Output</div>
              <CopyButton text={css} />
            </div>
            <div className="output-panel">
              <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dp-text-primary)" }}>
                {css}
              </pre>
            </div>
          </div>

          {/* Full gradient string */}
          <div className="flex flex-col gap-2">
            <div className="pane-label">Gradient Value</div>
            <div className="output-panel">
              <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-all" style={{ color: "var(--dp-text-primary)" }}>
                {gradient}
              </pre>
            </div>
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Color Picker", href: "/color-picker" },
            { name: "Hex ↔ RGB", href: "/hex-rgb" },
            { name: "Color Palette Generator", href: "/color-palette" },
            { name: "Box Shadow Generator", href: "/css-box-shadow" },
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
