"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

interface CornerValues {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

interface EllipticalValues {
  tlH: number; tlV: number;
  trH: number; trV: number;
  brH: number; brV: number;
  blH: number; blV: number;
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
  width: "60px",
  textAlign: "center",
};

export function CssBorderRadiusTool() {
  const [linked, setLinked] = useState(true);
  const [elliptical, setElliptical] = useState(false);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [corners, setCorners] = useState<CornerValues>({ tl: 8, tr: 8, br: 8, bl: 8 });
  const [ell, setEll] = useState<EllipticalValues>({
    tlH: 8, tlV: 8, trH: 8, trV: 8, brH: 8, brV: 8, blH: 8, blV: 8,
  });

  const updateCorner = (key: keyof CornerValues, val: number) => {
    if (linked) {
      setCorners({ tl: val, tr: val, br: val, bl: val });
    } else {
      setCorners((c) => ({ ...c, [key]: val }));
    }
  };

  const updateEll = (key: keyof EllipticalValues, val: number) => {
    if (linked) {
      setEll({ tlH: val, tlV: val, trH: val, trV: val, brH: val, brV: val, blH: val, blV: val });
    } else {
      setEll((e) => ({ ...e, [key]: val }));
    }
  };

  const borderRadiusValue = (() => {
    if (!elliptical) {
      const { tl, tr, br, bl } = corners;
      const u = unit;
      if (tl === tr && tl === br && tl === bl) return `${tl}${u}`;
      if (tl === br && tr === bl) return `${tl}${u} ${tr}${u}`;
      if (tr === bl) return `${tl}${u} ${tr}${u} ${br}${u}`;
      return `${tl}${u} ${tr}${u} ${br}${u} ${bl}${u}`;
    } else {
      const u = unit;
      const h = `${ell.tlH}${u} ${ell.trH}${u} ${ell.brH}${u} ${ell.blH}${u}`;
      const v = `${ell.tlV}${u} ${ell.trV}${u} ${ell.brV}${u} ${ell.blV}${u}`;
      return `${h} / ${v}`;
    }
  })();

  const css = `border-radius: ${borderRadiusValue};`;
  const max = unit === "px" ? 200 : 50;

  return (
    <ToolLayout
      title="CSS Border Radius Generator"
      description="Generate CSS border-radius values with individual corner control and live preview"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Options */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Options</div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2">
                {(["px", "%"] as const).map((u) => (
                  <button key={u} onClick={() => setUnit(u)} className={`tab-btn ${unit === u ? "active" : ""}`}>
                    {u}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-2">
                <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} />
                <span className="text-xs font-mono" style={{ color: "var(--dp-text-dimmed)" }}>Link all corners</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={elliptical} onChange={(e) => setElliptical(e.target.checked)} />
                <span className="text-xs font-mono" style={{ color: "var(--dp-text-dimmed)" }}>Elliptical (H/V)</span>
              </label>
            </div>
          </div>

          {/* Corner inputs */}
          {!elliptical ? (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Corners</div>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { key: "tl" as const, label: "Top Left" },
                  { key: "tr" as const, label: "Top Right" },
                  { key: "bl" as const, label: "Bottom Left" },
                  { key: "br" as const, label: "Bottom Right" },
                ]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={corners[key]}
                        onChange={(e) => updateCorner(key, Number(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={corners[key]}
                        onChange={(e) => updateCorner(key, Number(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Elliptical Corners (Horizontal / Vertical)</div>
              <div className="flex flex-col gap-3">
                {([
                  { hKey: "tlH" as const, vKey: "tlV" as const, label: "Top Left" },
                  { hKey: "trH" as const, vKey: "trV" as const, label: "Top Right" },
                  { hKey: "brH" as const, vKey: "brV" as const, label: "Bottom Right" },
                  { hKey: "blH" as const, vKey: "blV" as const, label: "Bottom Left" },
                ]).map(({ hKey, vKey, label }) => (
                  <div key={hKey}>
                    <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>{label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs mb-1" style={{ color: "var(--dp-text-muted)" }}>Horizontal</div>
                        <div className="flex gap-2 items-center">
                          <input type="range" min={0} max={max} value={ell[hKey]} onChange={(e) => updateEll(hKey, Number(e.target.value))} className="flex-1" />
                          <input type="number" min={0} max={max} value={ell[hKey]} onChange={(e) => updateEll(hKey, Number(e.target.value))} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: "var(--dp-text-muted)" }}>Vertical</div>
                        <div className="flex gap-2 items-center">
                          <input type="range" min={0} max={max} value={ell[vKey]} onChange={(e) => updateEll(vKey, Number(e.target.value))} className="flex-1" />
                          <input type="number" min={0} max={max} value={ell[vKey]} onChange={(e) => updateEll(vKey, Number(e.target.value))} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview + Output */}
        <div className="flex flex-col gap-4">
          {/* Visual corner display */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Live Preview</div>
            <div className="relative w-full flex items-center justify-center" style={{ height: "240px" }}>
              {/* Corner labels */}
              <div className="absolute top-2 left-2 text-xs font-mono" style={{ color: "var(--dp-text-muted)" }}>
                {!elliptical ? `${corners.tl}${unit}` : `${ell.tlH}/${ell.tlV}${unit}`}
              </div>
              <div className="absolute top-2 right-2 text-xs font-mono" style={{ color: "var(--dp-text-muted)" }}>
                {!elliptical ? `${corners.tr}${unit}` : `${ell.trH}/${ell.trV}${unit}`}
              </div>
              <div className="absolute bottom-2 left-2 text-xs font-mono" style={{ color: "var(--dp-text-muted)" }}>
                {!elliptical ? `${corners.bl}${unit}` : `${ell.blH}/${ell.blV}${unit}`}
              </div>
              <div className="absolute bottom-2 right-2 text-xs font-mono" style={{ color: "var(--dp-text-muted)" }}>
                {!elliptical ? `${corners.br}${unit}` : `${ell.brH}/${ell.brV}${unit}`}
              </div>

              <div
                style={{
                  width: "160px",
                  height: "160px",
                  background: "var(--dp-accent-bg)",
                  border: "2px solid var(--dp-accent-border)",
                  borderRadius: borderRadiusValue,
                }}
              />
            </div>
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

          {/* Shorthand info */}
          <div className="rounded-lg border p-3" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Value</div>
            <div className="font-mono text-sm" style={{ color: "var(--dp-text-primary)" }}>
              {borderRadiusValue}
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--dp-text-muted)" }}>
              Shorthand: TL TR BR BL {elliptical ? "/ H V values" : ""}
            </div>
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Box Shadow Generator", href: "/css-box-shadow" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
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
