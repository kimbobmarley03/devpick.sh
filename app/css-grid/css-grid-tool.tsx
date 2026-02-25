"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

type TrackValue = { size: string };

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

const COLORS = [
  "rgba(59,130,246,0.25)",
  "rgba(168,85,247,0.25)",
  "rgba(34,197,94,0.25)",
  "rgba(251,191,36,0.25)",
  "rgba(239,68,68,0.25)",
  "rgba(20,184,166,0.25)",
];

export function CssGridTool() {
  const [cols, setCols] = useState<TrackValue[]>([
    { size: "1fr" }, { size: "1fr" }, { size: "1fr" },
  ]);
  const [rows, setRows] = useState<TrackValue[]>([
    { size: "auto" }, { size: "auto" },
  ]);
  const [colGap, setColGap] = useState("16");
  const [rowGap, setRowGap] = useState("16");
  const [justify, setJustify] = useState("stretch");
  const [align, setAlign] = useState("stretch");

  const addCol = () => setCols((cs) => [...cs, { size: "1fr" }]);
  const addRow = () => setRows((rs) => [...rs, { size: "auto" }]);
  const removeCol = (i: number) => cols.length > 1 && setCols((cs) => cs.filter((_, idx) => idx !== i));
  const removeRow = (i: number) => rows.length > 1 && setRows((rs) => rs.filter((_, idx) => idx !== i));
  const updateCol = (i: number, val: string) => setCols((cs) => cs.map((c, idx) => idx === i ? { size: val } : c));
  const updateRow = (i: number, val: string) => setRows((rs) => rs.map((r, idx) => idx === i ? { size: val } : r));

  const gridTemplateColumns = cols.map((c) => c.size).join(" ");
  const gridTemplateRows = rows.map((r) => r.size).join(" ");

  const css = useMemo(() => {
    const lines = [
      ".container {",
      "  display: grid;",
      `  grid-template-columns: ${gridTemplateColumns};`,
      `  grid-template-rows: ${gridTemplateRows};`,
    ];
    const gap = colGap === rowGap ? colGap : `${rowGap} ${colGap}`;
    lines.push(`  gap: ${gap}px;`);
    if (justify !== "stretch") lines.push(`  justify-items: ${justify};`);
    if (align !== "stretch") lines.push(`  align-items: ${align};`);
    lines.push("}");
    return lines.join("\n");
  }, [gridTemplateColumns, gridTemplateRows, colGap, rowGap, justify, align]);

  const totalCells = cols.length * rows.length;

  return (
    <ToolLayout
      title="CSS Grid Generator"
      description="Build CSS Grid layouts visually with columns, rows, gap, and alignment controls"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Columns */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="pane-label" style={{ marginBottom: 0 }}>Columns ({cols.length})</div>
              <button onClick={addCol} className="action-btn" style={{ padding: "4px 10px", fontSize: "11px" }}>+ Add</button>
            </div>
            <div className="flex flex-col gap-2">
              {cols.map((col, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length], border: "1px solid var(--dp-border)" }}
                  />
                  <span className="text-xs font-mono w-16 flex-shrink-0" style={{ color: "var(--dp-text-muted)" }}>Col {i + 1}</span>
                  <select
                    value={["1fr", "2fr", "3fr", "auto", "min-content", "max-content", "minmax(0,1fr)", "100px", "200px", "custom"].includes(col.size) ? col.size : "custom"}
                    onChange={(e) => {
                      if (e.target.value !== "custom") updateCol(i, e.target.value);
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                  >
                    <option value="1fr">1fr</option>
                    <option value="2fr">2fr</option>
                    <option value="3fr">3fr</option>
                    <option value="auto">auto</option>
                    <option value="min-content">min-content</option>
                    <option value="max-content">max-content</option>
                    <option value="minmax(0,1fr)">minmax(0, 1fr)</option>
                    <option value="100px">100px</option>
                    <option value="200px">200px</option>
                  </select>
                  <input
                    type="text"
                    value={col.size}
                    onChange={(e) => updateCol(i, e.target.value)}
                    style={{ ...inputStyle, width: "80px" }}
                    placeholder="1fr"
                  />
                  <button onClick={() => removeCol(i)} className="action-btn" style={{ padding: "4px 6px" }} disabled={cols.length === 1}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="pane-label" style={{ marginBottom: 0 }}>Rows ({rows.length})</div>
              <button onClick={addRow} className="action-btn" style={{ padding: "4px 10px", fontSize: "11px" }}>+ Add</button>
            </div>
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-16 flex-shrink-0" style={{ color: "var(--dp-text-muted)" }}>Row {i + 1}</span>
                  <select
                    value={row.size}
                    onChange={(e) => updateRow(i, e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  >
                    <option value="auto">auto</option>
                    <option value="1fr">1fr</option>
                    <option value="2fr">2fr</option>
                    <option value="100px">100px</option>
                    <option value="150px">150px</option>
                    <option value="200px">200px</option>
                    <option value="min-content">min-content</option>
                    <option value="max-content">max-content</option>
                  </select>
                  <input
                    type="text"
                    value={row.size}
                    onChange={(e) => updateRow(i, e.target.value)}
                    style={{ ...inputStyle, width: "80px" }}
                    placeholder="auto"
                  />
                  <button onClick={() => removeRow(i)} className="action-btn" style={{ padding: "4px 6px" }} disabled={rows.length === 1}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gap & Alignment */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Gap & Alignment</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Column Gap (px)</div>
                <div className="flex gap-2 items-center">
                  <input type="range" min={0} max={64} value={colGap} onChange={(e) => setColGap(e.target.value)} className="flex-1" />
                  <input type="number" min={0} max={64} value={colGap} onChange={(e) => setColGap(e.target.value)} style={{ ...inputStyle, width: "52px", textAlign: "center" }} />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Row Gap (px)</div>
                <div className="flex gap-2 items-center">
                  <input type="range" min={0} max={64} value={rowGap} onChange={(e) => setRowGap(e.target.value)} className="flex-1" />
                  <input type="number" min={0} max={64} value={rowGap} onChange={(e) => setRowGap(e.target.value)} style={{ ...inputStyle, width: "52px", textAlign: "center" }} />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Justify Items</div>
                <select value={justify} onChange={(e) => setJustify(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  {["stretch", "start", "end", "center"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Align Items</div>
                <select value={align} onChange={(e) => setAlign(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  {["stretch", "start", "end", "center", "baseline"].map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="flex flex-col gap-4">
          {/* Grid Preview */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Live Preview</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns,
                gridTemplateRows,
                gap: `${rowGap}px ${colGap}px`,
                justifyItems: justify as React.CSSProperties["justifyItems"],
                alignItems: align as React.CSSProperties["alignItems"],
                minHeight: "200px",
                width: "100%",
              }}
            >
              {Array.from({ length: totalCells }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md flex items-center justify-center text-xs font-mono"
                  style={{
                    background: COLORS[i % COLORS.length],
                    border: `1px solid ${COLORS[i % COLORS.length].replace("0.25", "0.5")}`,
                    color: "var(--dp-text-secondary)",
                    minHeight: "40px",
                    padding: "8px",
                  }}
                >
                  {i + 1}
                </div>
              ))}
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
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Flexbox Playground", href: "/flexbox" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
            { name: "Box Shadow Generator", href: "/css-box-shadow" },
            { name: "Border Radius Generator", href: "/css-border-radius" },
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
