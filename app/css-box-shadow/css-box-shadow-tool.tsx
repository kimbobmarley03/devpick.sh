"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
  enabled: boolean;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
}

function defaultLayer(): ShadowLayer {
  return { id: makeId(), x: 0, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 0.15, inset: false, enabled: true };
}

const inputStyle: React.CSSProperties = {
  background: "var(--dp-bg-output)",
  border: "1px solid var(--dp-border)",
  borderRadius: "6px",
  color: "var(--dp-text-primary)",
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: "12px",
  padding: "4px 8px",
  outline: "none",
};

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
}

function SliderRow({ label, value, min, max, onChange, unit = "px", step = 1 }: SliderRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-xs font-mono flex-shrink-0" style={{ color: "var(--dp-text-dimmed)" }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...inputStyle, width: "52px", textAlign: "center" }}
      />
      <span className="text-xs font-mono w-6" style={{ color: "var(--dp-text-muted)" }}>{unit}</span>
    </div>
  );
}

export function CssBoxShadowTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([defaultLayer()]);
  const [selectedId, setSelectedId] = useState<string>(layers[0].id);
  const [bgColor, setBgColor] = useState("#ffffff");

  const update = (id: string, patch: Partial<ShadowLayer>) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addLayer = () => {
    const layer = defaultLayer();
    setLayers((ls) => [...ls, layer]);
    setSelectedId(layer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    setLayers((ls) => {
      const remaining = ls.filter((l) => l.id !== id);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? "");
      return remaining;
    });
  };

  const selected = layers.find((l) => l.id === selectedId) ?? layers[0];

  const shadowValue = layers
    .filter((l) => l.enabled)
    .map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`)
    .join(",\n             ");

  const css = `box-shadow: ${shadowValue};`;

  return (
    <ToolLayout
      title="CSS Box Shadow Generator"
      description="Create multi-layer box shadows with sliders for offset, blur, spread, color, and opacity"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Layer list */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="pane-label" style={{ marginBottom: 0 }}>Shadow Layers</div>
              <button onClick={addLayer} className="action-btn" style={{ padding: "4px 8px", fontSize: "11px" }}>
                <Plus size={11} />
                Add Layer
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {layers.map((layer, i) => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedId(layer.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: selectedId === layer.id ? "var(--dp-accent-bg)" : "var(--dp-bg-output)",
                    border: `1px solid ${selectedId === layer.id ? "var(--dp-accent-border)" : "var(--dp-border)"}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ background: hexToRgba(layer.color, layer.opacity), border: "1px solid var(--dp-border)" }}
                  />
                  <span className="text-xs font-mono flex-1" style={{ color: "var(--dp-text-primary)" }}>
                    Layer {i + 1} {layer.inset ? "(inset)" : ""}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); update(layer.id, { enabled: !layer.enabled }); }}
                    className="action-btn"
                    style={{ padding: "2px 6px" }}
                  >
                    {layer.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                    className="action-btn"
                    style={{ padding: "2px 6px" }}
                    disabled={layers.length === 1}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected layer controls */}
          {selected && (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Layer Settings</div>
              <div className="flex flex-col gap-3">
                <SliderRow label="X Offset" value={selected.x} min={-100} max={100} onChange={(v) => update(selected.id, { x: v })} />
                <SliderRow label="Y Offset" value={selected.y} min={-100} max={100} onChange={(v) => update(selected.id, { y: v })} />
                <SliderRow label="Blur" value={selected.blur} min={0} max={100} onChange={(v) => update(selected.id, { blur: v })} />
                <SliderRow label="Spread" value={selected.spread} min={-50} max={50} onChange={(v) => update(selected.id, { spread: v })} />
                <SliderRow label="Opacity" value={Math.round(selected.opacity * 100)} min={0} max={100} onChange={(v) => update(selected.id, { opacity: v / 100 })} unit="%" />

                <div className="flex items-center gap-3 mt-1">
                  <span className="w-14 text-xs font-mono flex-shrink-0" style={{ color: "var(--dp-text-dimmed)" }}>Color</span>
                  <input
                    type="color"
                    value={selected.color}
                    onChange={(e) => update(selected.id, { color: e.target.value })}
                    style={{ width: "36px", height: "28px", border: "1px solid var(--dp-border)", borderRadius: "4px", cursor: "pointer", padding: "2px", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={selected.color}
                    onChange={(e) => update(selected.id, { color: e.target.value })}
                    style={{ ...inputStyle, width: "90px" }}
                  />
                  <label className="flex items-center gap-2 cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={selected.inset}
                      onChange={(e) => update(selected.id, { inset: e.target.checked })}
                    />
                    <span className="text-xs font-mono" style={{ color: "var(--dp-text-dimmed)" }}>Inset</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Preview bg */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Preview Background</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: "36px", height: "28px", border: "1px solid var(--dp-border)", borderRadius: "4px", cursor: "pointer", padding: "2px", background: "transparent" }}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ ...inputStyle, width: "90px" }}
              />
            </div>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="flex flex-col gap-4">
          {/* Preview */}
          <div
            className="rounded-xl flex items-center justify-center"
            style={{ background: bgColor, border: "1px solid var(--dp-border)", height: "280px" }}
          >
            <div
              className="rounded-xl"
              style={{
                width: "140px",
                height: "140px",
                background: "var(--dp-bg-card)",
                boxShadow: layers.filter((l) => l.enabled)
                  .map((l) => `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`)
                  .join(", "),
              }}
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
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "CSS Gradient Generator", href: "/css-gradient" },
            { name: "Border Radius Generator", href: "/css-border-radius" },
            { name: "Color Picker", href: "/color-picker" },
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
