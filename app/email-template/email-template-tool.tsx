"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2, ChevronUp, ChevronDown, Download } from "lucide-react";

// ── Section Types ──────────────────────────────────────────────────────────
type SectionType = "header" | "text" | "image" | "button" | "divider" | "footer";

interface HeaderSection { type: "header"; logo: string; title: string; bgColor: string; textColor: string; }
interface TextSection { type: "text"; content: string; fontSize: number; color: string; align: "left" | "center" | "right"; }
interface ImageSection { type: "image"; src: string; alt: string; width: string; align: "left" | "center" | "right"; }
interface ButtonSection { type: "button"; text: string; url: string; bgColor: string; textColor: string; align: "left" | "center" | "right"; }
interface DividerSection { type: "divider"; color: string; }
interface FooterSection { type: "footer"; content: string; bgColor: string; textColor: string; }

type Section = HeaderSection | TextSection | ImageSection | ButtonSection | DividerSection | FooterSection;

let nextId = 1;
interface SectionWithId { id: number; section: Section; }

// ── HTML export ────────────────────────────────────────────────────────────
function sectionToHtml(s: Section): string {
  switch (s.type) {
    case "header":
      return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${s.bgColor};">
  <tr><td style="padding:32px 24px;text-align:center;">
    ${s.logo ? `<img src="${s.logo}" alt="Logo" style="max-height:48px;display:block;margin:0 auto 12px;" />` : ""}
    <h1 style="margin:0;font-size:28px;font-weight:700;color:${s.textColor};font-family:Arial,sans-serif;">${s.title}</h1>
  </td></tr>
</table>`;
    case "text":
      return `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:16px 24px;text-align:${s.align};">
    <p style="margin:0;font-size:${s.fontSize}px;color:${s.color};font-family:Arial,sans-serif;line-height:1.6;">${s.content.replace(/\n/g, "<br />")}</p>
  </td></tr>
</table>`;
    case "image":
      return `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:16px 24px;text-align:${s.align};">
    <img src="${s.src}" alt="${s.alt}" style="max-width:${s.width || "100%"};display:inline-block;" />
  </td></tr>
</table>`;
    case "button":
      return `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:16px 24px;text-align:${s.align};">
    <a href="${s.url}" style="display:inline-block;background-color:${s.bgColor};color:${s.textColor};font-family:Arial,sans-serif;font-size:16px;font-weight:600;padding:12px 24px;text-decoration:none;border-radius:4px;">${s.text}</a>
  </td></tr>
</table>`;
    case "divider":
      return `<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:8px 24px;">
    <hr style="border:none;border-top:1px solid ${s.color};margin:0;" />
  </td></tr>
</table>`;
    case "footer":
      return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${s.bgColor};">
  <tr><td style="padding:24px;text-align:center;">
    <p style="margin:0;font-size:12px;color:${s.textColor};font-family:Arial,sans-serif;">${s.content.replace(/\n/g, "<br />")}</p>
  </td></tr>
</table>`;
  }
}

function generateHtml(sections: SectionWithId[], bgColor: string): string {
  const body = sections.map((s) => sectionToHtml(s.section)).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:${bgColor};">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor};">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td>
${body}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Default sections ───────────────────────────────────────────────────────
const DEFAULT_SECTIONS: SectionWithId[] = [
  {
    id: nextId++,
    section: {
      type: "header",
      logo: "",
      title: "Welcome to Our Newsletter",
      bgColor: "#3b82f6",
      textColor: "#ffffff",
    },
  },
  {
    id: nextId++,
    section: {
      type: "text",
      content: "Hi there,\n\nThank you for subscribing to our newsletter. We're excited to share our latest updates with you.",
      fontSize: 16,
      color: "#374151",
      align: "left",
    },
  },
  {
    id: nextId++,
    section: {
      type: "button",
      text: "Get Started",
      url: "https://example.com",
      bgColor: "#3b82f6",
      textColor: "#ffffff",
      align: "center",
    },
  },
  {
    id: nextId++,
    section: {
      type: "divider",
      color: "#e5e7eb",
    },
  },
  {
    id: nextId++,
    section: {
      type: "footer",
      content: "© 2025 Your Company. All rights reserved.\nYou received this email because you subscribed.",
      bgColor: "#f9fafb",
      textColor: "#6b7280",
    },
  },
];

// ── Section editor component ───────────────────────────────────────────────
interface SectionEditorProps {
  item: SectionWithId;
  onChange: (id: number, s: Section) => void;
  onRemove: (id: number) => void;
  onMove: (id: number, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}

function SectionEditor({ item, onChange, onRemove, onMove, isFirst, isLast }: SectionEditorProps) {
  const { id, section: s } = item;
  const update = (patch: Partial<Section>) => onChange(id, { ...s, ...patch } as Section);

  const typeLabel: Record<SectionType, string> = {
    header: "Header",
    text: "Text",
    image: "Image",
    button: "Button",
    divider: "Divider",
    footer: "Footer",
  };

  return (
    <div className="border border-[var(--dp-border)] rounded-lg p-3 bg-[var(--dp-bg-card)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          {typeLabel[s.type]}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => onMove(id, -1)}
            disabled={isFirst}
            className="action-btn p-0.5"
            style={{ padding: "2px 4px" }}
          >
            <ChevronUp size={12} />
          </button>
          <button
            onClick={() => onMove(id, 1)}
            disabled={isLast}
            className="action-btn p-0.5"
            style={{ padding: "2px 4px" }}
          >
            <ChevronDown size={12} />
          </button>
          <button
            onClick={() => onRemove(id)}
            className="action-btn p-0.5 hover:text-[var(--dp-error)]"
            style={{ padding: "2px 4px" }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Field editors */}
      <div className="space-y-2">
        {s.type === "header" && (
          <>
            <InputRow label="Title">
              <input type="text" value={s.title} onChange={(e) => update({ title: e.target.value })} className="tool-textarea w-full text-xs" style={{ height: "28px", padding: "4px 8px" }} />
            </InputRow>
            <InputRow label="Logo URL">
              <input type="text" value={s.logo} onChange={(e) => update({ logo: e.target.value })} placeholder="https://..." className="tool-textarea w-full text-xs" style={{ height: "28px", padding: "4px 8px" }} />
            </InputRow>
            <div className="flex gap-3">
              <ColorInput label="Background" value={s.bgColor} onChange={(v) => update({ bgColor: v })} />
              <ColorInput label="Text" value={s.textColor} onChange={(v) => update({ textColor: v })} />
            </div>
          </>
        )}

        {s.type === "text" && (
          <>
            <InputRow label="Content">
              <textarea value={s.content} onChange={(e) => update({ content: e.target.value })} className="tool-textarea w-full text-xs" style={{ minHeight: "64px", padding: "4px 8px" }} />
            </InputRow>
            <div className="flex gap-3 flex-wrap">
              <InputRow label="Size">
                <input type="number" value={s.fontSize} onChange={(e) => update({ fontSize: Number(e.target.value) })} className="tool-textarea text-xs" style={{ height: "28px", padding: "4px 8px", width: "60px" }} />
              </InputRow>
              <InputRow label="Align">
                <AlignSelect value={s.align} onChange={(v) => update({ align: v as "left" | "center" | "right" })} />
              </InputRow>
              <ColorInput label="Color" value={s.color} onChange={(v) => update({ color: v })} />
            </div>
          </>
        )}

        {s.type === "image" && (
          <>
            <InputRow label="URL">
              <input type="text" value={s.src} onChange={(e) => update({ src: e.target.value })} placeholder="https://..." className="tool-textarea w-full text-xs" style={{ height: "28px", padding: "4px 8px" }} />
            </InputRow>
            <div className="flex gap-3">
              <InputRow label="Alt text">
                <input type="text" value={s.alt} onChange={(e) => update({ alt: e.target.value })} className="tool-textarea text-xs" style={{ height: "28px", padding: "4px 8px", width: "120px" }} />
              </InputRow>
              <InputRow label="Max width">
                <input type="text" value={s.width} onChange={(e) => update({ width: e.target.value })} placeholder="100%" className="tool-textarea text-xs" style={{ height: "28px", padding: "4px 8px", width: "80px" }} />
              </InputRow>
              <InputRow label="Align">
                <AlignSelect value={s.align} onChange={(v) => update({ align: v as "left" | "center" | "right" })} />
              </InputRow>
            </div>
          </>
        )}

        {s.type === "button" && (
          <>
            <InputRow label="Text">
              <input type="text" value={s.text} onChange={(e) => update({ text: e.target.value })} className="tool-textarea text-xs" style={{ height: "28px", padding: "4px 8px", width: "150px" }} />
            </InputRow>
            <InputRow label="URL">
              <input type="text" value={s.url} onChange={(e) => update({ url: e.target.value })} placeholder="https://..." className="tool-textarea w-full text-xs" style={{ height: "28px", padding: "4px 8px" }} />
            </InputRow>
            <div className="flex gap-3 flex-wrap">
              <ColorInput label="Background" value={s.bgColor} onChange={(v) => update({ bgColor: v })} />
              <ColorInput label="Text" value={s.textColor} onChange={(v) => update({ textColor: v })} />
              <InputRow label="Align">
                <AlignSelect value={s.align} onChange={(v) => update({ align: v as "left" | "center" | "right" })} />
              </InputRow>
            </div>
          </>
        )}

        {s.type === "divider" && (
          <ColorInput label="Color" value={s.color} onChange={(v) => update({ color: v })} />
        )}

        {s.type === "footer" && (
          <>
            <InputRow label="Content">
              <textarea value={s.content} onChange={(e) => update({ content: e.target.value })} className="tool-textarea w-full text-xs" style={{ minHeight: "56px", padding: "4px 8px" }} />
            </InputRow>
            <div className="flex gap-3">
              <ColorInput label="Background" value={s.bgColor} onChange={(v) => update({ bgColor: v })} />
              <ColorInput label="Text" value={s.textColor} onChange={(v) => update({ textColor: v })} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-text-dimmed w-16 flex-shrink-0 pt-1">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-text-dimmed">{label}:</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded border border-[var(--dp-border)] cursor-pointer" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="tool-textarea text-xs font-mono" style={{ height: "24px", padding: "2px 6px", width: "72px" }} />
    </div>
  );
}

function AlignSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="tool-textarea text-xs" style={{ height: "28px", padding: "2px 6px" }}>
      <option value="left">Left</option>
      <option value="center">Center</option>
      <option value="right">Right</option>
    </select>
  );
}

// ── Main tool ──────────────────────────────────────────────────────────────
const SECTION_DEFAULTS: Record<SectionType, Section> = {
  header: { type: "header", logo: "", title: "Your Title", bgColor: "#3b82f6", textColor: "#ffffff" },
  text: { type: "text", content: "Your text here...", fontSize: 16, color: "#374151", align: "left" },
  image: { type: "image", src: "", alt: "Image", width: "100%", align: "center" },
  button: { type: "button", text: "Click Here", url: "https://example.com", bgColor: "#3b82f6", textColor: "#ffffff", align: "center" },
  divider: { type: "divider", color: "#e5e7eb" },
  footer: { type: "footer", content: "© 2025 Company. All rights reserved.", bgColor: "#f9fafb", textColor: "#6b7280" },
};

export function EmailTemplateTool() {
  const [sections, setSections] = useState<SectionWithId[]>(DEFAULT_SECTIONS);
  const [bgColor, setBgColor] = useState("#f3f4f6");
  const [view, setView] = useState<"editor" | "html">("editor");

  const html = generateHtml(sections, bgColor);

  const addSection = (type: SectionType) => {
    setSections((prev) => [
      ...prev,
      { id: nextId++, section: { ...SECTION_DEFAULTS[type] } },
    ]);
  };

  const updateSection = useCallback((id: number, s: Section) => {
    setSections((prev) => prev.map((item) => item.id === id ? { ...item, section: s } : item));
  }, []);

  const removeSection = useCallback((id: number) => {
    setSections((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const moveSection = useCallback((id: number, dir: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "email-template.html";
    a.click();
  };

  return (
    <ToolLayout
      title="Email Template Builder"
      description="Build HTML email templates visually — add sections, live preview, export as HTML."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          <button onClick={() => setView("editor")} className={`tab-btn ${view === "editor" ? "active" : ""}`}>
            Editor
          </button>
          <button onClick={() => setView("html")} className={`tab-btn ${view === "html" ? "active" : ""}`}>
            HTML Source
          </button>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-text-dimmed">Email BG:</span>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded border border-[var(--dp-border)] cursor-pointer" />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={downloadHtml} className="action-btn">
            <Download size={13} />
            Download HTML
          </button>
          <CopyButton text={html} />
        </div>
      </div>

      {view === "html" ? (
        <div className="output-panel min-h-[500px]">
          <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
            {html}
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: editor */}
          <div className="space-y-3">
            <div className="pane-label">Sections</div>
            {sections.map((item, idx) => (
              <SectionEditor
                key={item.id}
                item={item}
                onChange={updateSection}
                onRemove={removeSection}
                onMove={moveSection}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
              />
            ))}

            {/* Add section buttons */}
            <div className="pt-2">
              <div className="text-xs text-text-dimmed mb-2">Add section:</div>
              <div className="flex flex-wrap gap-2">
                {(["header", "text", "image", "button", "divider", "footer"] as SectionType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => addSection(t)}
                    className="action-btn text-xs"
                    style={{ padding: "4px 10px" }}
                  >
                    <Plus size={11} />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div>
            <div className="pane-label mb-2">Live Preview</div>
            <div className="rounded-lg overflow-hidden border border-[var(--dp-border)] bg-white">
              <iframe
                srcDoc={html}
                title="Email Preview"
                className="w-full"
                style={{ height: "600px", border: "none" }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "Open Graph Preview", href: "/og-preview" },
            { name: "CSS Formatter", href: "/css-formatter" },
            { name: "Markdown to HTML", href: "/markdown-to-html" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
