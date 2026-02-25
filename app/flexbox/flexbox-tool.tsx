"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2 } from "lucide-react";

interface FlexItem {
  id: string;
  label: string;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const ITEM_COLORS = [
  "rgba(59,130,246,0.3)",
  "rgba(168,85,247,0.3)",
  "rgba(34,197,94,0.3)",
  "rgba(251,191,36,0.3)",
  "rgba(239,68,68,0.3)",
  "rgba(20,184,166,0.3)",
  "rgba(249,115,22,0.3)",
  "rgba(236,72,153,0.3)",
];

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

function PropSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function defaultItem(n: number): FlexItem {
  return { id: makeId(), label: `Item ${n}`, flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto" };
}

export function FlexboxTool() {
  const [direction, setDirection] = useState("row");
  const [wrap, setWrap] = useState("nowrap");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [alignContent, setAlignContent] = useState("stretch");
  const [gap, setGap] = useState("8");
  const [items, setItems] = useState<FlexItem[]>([
    defaultItem(1), defaultItem(2), defaultItem(3),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addItem = () => {
    const item = defaultItem(items.length + 1);
    setItems((is) => [...is, item]);
    setSelectedId(item.id);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((is) => {
      const remaining = is.filter((i) => i.id !== id);
      if (selectedId === id) setSelectedId(null);
      return remaining;
    });
  };

  const updateItem = (id: string, patch: Partial<FlexItem>) =>
    setItems((is) => is.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const selected = items.find((i) => i.id === selectedId);

  const containerCss = [
    ".container {",
    "  display: flex;",
    `  flex-direction: ${direction};`,
    `  flex-wrap: ${wrap};`,
    `  justify-content: ${justifyContent};`,
    `  align-items: ${alignItems};`,
    alignContent !== "stretch" ? `  align-content: ${alignContent};` : null,
    `  gap: ${gap}px;`,
    "}",
  ].filter(Boolean).join("\n");

  const itemsCss = items
    .map((item, i) => {
      const flex = `${item.flexGrow} ${item.flexShrink} ${item.flexBasis}`;
      const lines = [`/* Item ${i + 1} */`, `.item-${i + 1} {`, `  flex: ${flex};`];
      if (item.alignSelf !== "auto") lines.push(`  align-self: ${item.alignSelf};`);
      lines.push("}");
      return lines.join("\n");
    })
    .join("\n\n");

  const fullCss = `${containerCss}\n\n${itemsCss}`;

  return (
    <ToolLayout
      title="Flexbox Playground"
      description="Interactive CSS Flexbox builder — set container properties, add items, and see live preview"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Container props */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Container Properties</div>
            <div className="grid grid-cols-2 gap-3">
              <PropSelect
                label="flex-direction"
                value={direction}
                options={["row", "row-reverse", "column", "column-reverse"]}
                onChange={setDirection}
              />
              <PropSelect
                label="flex-wrap"
                value={wrap}
                options={["nowrap", "wrap", "wrap-reverse"]}
                onChange={setWrap}
              />
              <PropSelect
                label="justify-content"
                value={justifyContent}
                options={["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"]}
                onChange={setJustifyContent}
              />
              <PropSelect
                label="align-items"
                value={alignItems}
                options={["stretch", "flex-start", "flex-end", "center", "baseline"]}
                onChange={setAlignItems}
              />
              <PropSelect
                label="align-content"
                value={alignContent}
                options={["stretch", "flex-start", "flex-end", "center", "space-between", "space-around"]}
                onChange={setAlignContent}
              />
              <div>
                <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>gap</div>
                <div className="flex gap-2 items-center">
                  <input type="range" min={0} max={48} value={gap} onChange={(e) => setGap(e.target.value)} className="flex-1" />
                  <input type="number" min={0} max={48} value={gap} onChange={(e) => setGap(e.target.value)} style={{ ...inputStyle, width: "52px", textAlign: "center" }} />
                  <span className="text-xs" style={{ color: "var(--dp-text-muted)" }}>px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="pane-label" style={{ marginBottom: 0 }}>Flex Items ({items.length})</div>
              <button onClick={addItem} className="action-btn" style={{ padding: "4px 8px", fontSize: "11px" }}>
                <Plus size={11} />
                Add Item
              </button>
            </div>
            <div className="flex flex-col gap-1 mb-3">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: selectedId === item.id ? "var(--dp-accent-bg)" : "var(--dp-bg-output)",
                    border: `1px solid ${selectedId === item.id ? "var(--dp-accent-border)" : "var(--dp-border)"}`,
                  }}
                >
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: ITEM_COLORS[i % ITEM_COLORS.length] }} />
                  <span className="text-xs font-mono flex-1" style={{ color: "var(--dp-text-primary)" }}>{item.label}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--dp-text-muted)" }}>
                    {item.flexGrow} {item.flexShrink} {item.flexBasis}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="action-btn" style={{ padding: "2px 6px" }} disabled={items.length === 1}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Selected item settings */}
            {selected && (
              <div className="rounded-lg border p-3 mt-2" style={{ background: "var(--dp-bg-output)", borderColor: "var(--dp-border)" }}>
                <div className="text-xs font-semibold mb-3 font-mono" style={{ color: "var(--dp-text-dimmed)" }}>
                  Editing: {selected.label}
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Label</div>
                    <input
                      type="text"
                      value={selected.label}
                      onChange={(e) => updateItem(selected.id, { label: e.target.value })}
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>flex-grow</div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.flexGrow}
                        onChange={(e) => updateItem(selected.id, { flexGrow: Number(e.target.value) })}
                        style={{ ...inputStyle, width: "100%", textAlign: "center" }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>flex-shrink</div>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={selected.flexShrink}
                        onChange={(e) => updateItem(selected.id, { flexShrink: Number(e.target.value) })}
                        style={{ ...inputStyle, width: "100%", textAlign: "center" }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-mono mb-1" style={{ color: "var(--dp-text-dimmed)" }}>flex-basis</div>
                      <input
                        type="text"
                        value={selected.flexBasis}
                        onChange={(e) => updateItem(selected.id, { flexBasis: e.target.value })}
                        style={{ ...inputStyle, width: "100%", textAlign: "center" }}
                        placeholder="auto"
                      />
                    </div>
                  </div>
                  <PropSelect
                    label="align-self"
                    value={selected.alignSelf}
                    options={["auto", "flex-start", "flex-end", "center", "baseline", "stretch"]}
                    onChange={(v) => updateItem(selected.id, { alignSelf: v })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview + Output */}
        <div className="flex flex-col gap-4">
          {/* Preview */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Live Preview</div>
            <div
              style={{
                display: "flex",
                flexDirection: direction as React.CSSProperties["flexDirection"],
                flexWrap: wrap as React.CSSProperties["flexWrap"],
                justifyContent: justifyContent as React.CSSProperties["justifyContent"],
                alignItems: alignItems as React.CSSProperties["alignItems"],
                alignContent: alignContent as React.CSSProperties["alignContent"],
                gap: `${gap}px`,
                minHeight: "180px",
                background: "var(--dp-bg-output)",
                border: "1px solid var(--dp-border)",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              {items.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className="rounded-md flex items-center justify-center text-xs font-mono cursor-pointer transition-all"
                  style={{
                    flex: `${item.flexGrow} ${item.flexShrink} ${item.flexBasis}`,
                    alignSelf: item.alignSelf as React.CSSProperties["alignSelf"],
                    background: ITEM_COLORS[i % ITEM_COLORS.length],
                    border: `2px solid ${selectedId === item.id ? "var(--dp-accent)" : ITEM_COLORS[i % ITEM_COLORS.length].replace("0.3", "0.5")}`,
                    minWidth: "40px",
                    minHeight: "40px",
                    padding: "8px",
                    color: "var(--dp-text-secondary)",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="pane-label">CSS Output</div>
              <CopyButton text={fullCss} />
            </div>
            <div className="output-panel" style={{ maxHeight: "320px" }}>
              <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dp-text-primary)" }}>
                {fullCss}
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
            { name: "CSS Grid Generator", href: "/css-grid" },
            { name: "Box Shadow Generator", href: "/css-box-shadow" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
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
