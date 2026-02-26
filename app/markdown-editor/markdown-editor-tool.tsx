"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2, Download, Bold, Italic, Heading1, Heading2, Heading3, Link, Code, List, ListOrdered, Quote, Minus } from "lucide-react";

// ── Markdown Renderer (shared with markdown-preview) ──────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inCodeBlock = false;
  let inList = false;
  let listType: "ul" | "ol" | null = null;
  let inBlockquote = false;

  const closeList = () => {
    if (inList) { out.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; listType = null; }
  };
  const closeBlockquote = () => {
    if (inBlockquote) { out.push("</blockquote>"); inBlockquote = false; }
  };
  const processInline = (text: string): string =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  for (const rawLine of lines) {
    const line = rawLine;
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) { out.push("</code></pre>"); inCodeBlock = false; }
      else { closeList(); closeBlockquote(); const lang = line.trim().slice(3).trim(); out.push(`<pre><code${lang ? ` class="language-${lang}"` : ""}>`); inCodeBlock = true; }
      continue;
    }
    if (inCodeBlock) { out.push(escapeHtml(line)); continue; }
    if (/^[-*_]{3,}\s*$/.test(line.trim())) { closeList(); closeBlockquote(); out.push("<hr />"); continue; }
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) { closeList(); closeBlockquote(); const lvl = headerMatch[1].length; out.push(`<h${lvl} id="${headerMatch[2].toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}">${processInline(headerMatch[2])}</h${lvl}>`); continue; }
    const bqMatch = line.match(/^>\s?(.*)/);
    if (bqMatch) { closeList(); if (!inBlockquote) { out.push("<blockquote>"); inBlockquote = true; } out.push(`<p>${processInline(bqMatch[1])}</p>`); continue; }
    closeBlockquote();
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    if (ulMatch) { if (!inList || listType !== "ul") { closeList(); out.push("<ul>"); inList = true; listType = "ul"; } out.push(`<li>${processInline(ulMatch[1])}</li>`); continue; }
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) { if (!inList || listType !== "ol") { closeList(); out.push("<ol>"); inList = true; listType = "ol"; } out.push(`<li>${processInline(olMatch[1])}</li>`); continue; }
    closeList();
    if (!line.trim()) { out.push("<br />"); continue; }
    out.push(`<p>${processInline(line)}</p>`);
  }

  closeList(); closeBlockquote();
  if (inCodeBlock) out.push("</code></pre>");
  return out.join("\n");
}

const PREVIEW_STYLES = `
  .md-preview { color: var(--dp-text-primary, #e5e5e5); font-size: 14px; line-height: 1.8; }
  .md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4,.md-preview h5,.md-preview h6 { color: var(--dp-text-primary); margin: 1.2em 0 0.5em; font-weight: 700; }
  .md-preview h1 { font-size: 1.6em; border-bottom: 1px solid var(--dp-border-subtle, #222); padding-bottom: 0.3em; }
  .md-preview h2 { font-size: 1.3em; border-bottom: 1px solid var(--dp-border-subtle, #1a1a1a); padding-bottom: 0.2em; }
  .md-preview h3 { font-size: 1.1em; }
  .md-preview p { margin: 0.5em 0; }
  .md-preview strong { color: var(--dp-text-primary); font-weight: 700; }
  .md-preview em { font-style: italic; }
  .md-preview code { background: var(--dp-surface-raised, #1a1a1a); border: 1px solid var(--dp-border-subtle, #2a2a2a); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #7dd3fc; }
  .md-preview pre { background: var(--dp-surface-subtle, #111); border: 1px solid var(--dp-border-subtle, #222); border-radius: 8px; padding: 12px; overflow-x: auto; margin: 0.8em 0; }
  .md-preview pre code { background: none; border: none; padding: 0; color: #a3e635; }
  .md-preview a { color: #3b82f6; text-decoration: underline; }
  .md-preview ul,.md-preview ol { padding-left: 1.5em; margin: 0.5em 0; }
  .md-preview li { margin: 0.2em 0; }
  .md-preview blockquote { border-left: 3px solid #3b82f6; margin: 0.8em 0; padding: 4px 12px; background: var(--dp-surface-subtle, #111); border-radius: 0 6px 6px 0; }
  .md-preview blockquote p { margin: 0.2em 0; }
  .md-preview hr { border: none; border-top: 1px solid var(--dp-border-subtle, #333); margin: 1.2em 0; }
  .md-preview br { display: block; margin: 0.2em 0; content: ""; }
`;

// ── Toolbar Actions ────────────────────────────────────────────────────────

function insertWrap(textarea: HTMLTextAreaElement, before: string, after: string, placeholder = "text") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const replacement = before + selected + after;
  const newValue = textarea.value.slice(0, start) + replacement + textarea.value.slice(end);
  return { newValue, newStart: start + before.length, newEnd: start + before.length + selected.length };
}

function insertLine(textarea: HTMLTextAreaElement, prefix: string, placeholder = "text") {
  const start = textarea.selectionStart;
  const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = textarea.value.indexOf("\n", start);
  const end = lineEnd === -1 ? textarea.value.length : lineEnd;
  const line = textarea.value.slice(lineStart, end);
  const newLine = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + (line || placeholder);
  const newValue = textarea.value.slice(0, lineStart) + newLine + textarea.value.slice(end);
  return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + newLine.length };
}

const SAMPLE_MD = `# Welcome to Markdown Editor

A **fast, live** markdown editor that runs 100% in your browser.

## Features

- Live split-pane preview
- Formatting toolbar
- Export as **.md** file
- Copy as HTML
- **Zero server calls** — your content stays private

## Code Example

\`\`\`javascript
const greeting = "Hello, devpick!";
console.log(greeting);
\`\`\`

## Blockquote

> The best markdown editor is the one that gets out of your way.

---

Start editing above or replace this content entirely!
`;

export function MarkdownEditorTool() {
  useWebMCP({
    name: "markdownToHtml",
    description: "Convert Markdown to HTML",
    inputSchema: {
      type: "object" as const,
      properties: {
        markdown: { type: "string", description: "Markdown text to render" },
      },
      required: ["markdown"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: renderMarkdown(params.markdown as string) }] };
    },
  });

  const [input, setInput] = useState(SAMPLE_MD);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const html = renderMarkdown(input);

  const applyAction = useCallback((action: (ta: HTMLTextAreaElement) => { newValue: string; newStart: number; newEnd: number }) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { newValue, newStart, newEnd } = action(ta);
    setInput(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }, []);

  const toolbar = [
    { icon: <Bold size={14} />, title: "Bold (⌘B)", action: (ta: HTMLTextAreaElement) => insertWrap(ta, "**", "**", "bold text") },
    { icon: <Italic size={14} />, title: "Italic (⌘I)", action: (ta: HTMLTextAreaElement) => insertWrap(ta, "*", "*", "italic text") },
    { icon: <Code size={14} />, title: "Inline Code", action: (ta: HTMLTextAreaElement) => insertWrap(ta, "`", "`", "code") },
    { separator: true },
    { icon: <Heading1 size={14} />, title: "H1", action: (ta: HTMLTextAreaElement) => insertLine(ta, "# ", "Heading 1") },
    { icon: <Heading2 size={14} />, title: "H2", action: (ta: HTMLTextAreaElement) => insertLine(ta, "## ", "Heading 2") },
    { icon: <Heading3 size={14} />, title: "H3", action: (ta: HTMLTextAreaElement) => insertLine(ta, "### ", "Heading 3") },
    { separator: true },
    { icon: <List size={14} />, title: "Bullet List", action: (ta: HTMLTextAreaElement) => insertLine(ta, "- ", "list item") },
    { icon: <ListOrdered size={14} />, title: "Numbered List", action: (ta: HTMLTextAreaElement) => insertLine(ta, "1. ", "list item") },
    { icon: <Quote size={14} />, title: "Blockquote", action: (ta: HTMLTextAreaElement) => insertLine(ta, "> ", "quote") },
    { icon: <Minus size={14} />, title: "Horizontal Rule", action: (ta: HTMLTextAreaElement) => {
      const pos = ta.selectionStart;
      const nl = ta.value[pos - 1] === "\n" ? "" : "\n";
      const newValue = ta.value.slice(0, pos) + nl + "---\n" + ta.value.slice(pos);
      return { newValue, newStart: pos + nl.length + 4, newEnd: pos + nl.length + 4 };
    }},
    { separator: true },
    { icon: <Link size={14} />, title: "Link", action: (ta: HTMLTextAreaElement) => {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.slice(start, end) || "link text";
      const replacement = `[${selected}](https://url.com)`;
      const newValue = ta.value.slice(0, start) + replacement + ta.value.slice(end);
      return { newValue, newStart: start + selected.length + 3, newEnd: start + selected.length + 3 + "https://url.com".length };
    }},
  ];

  const exportMd = () => {
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  return (
    <ToolLayout
      agentReady
      title="Markdown Editor"
      description="Live Markdown editor with split-pane preview. Write on the left, see rendered output on the right. Export as .md or copy as HTML."
    >
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_STYLES }} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-surface-subtle border border-border-subtle rounded-xl">
        {toolbar.map((item, i) =>
          "separator" in item ? (
            <div key={`sep-${i}`} className="w-px h-5 bg-border-subtle mx-1" />
          ) : (
            <button
              key={i}
              title={item.title}
              onClick={() => "action" in item && applyAction(item.action)}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              {item.icon}
            </button>
          )
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            {wordCount}w · {charCount}c
          </span>
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} /> Clear
          </button>
          <CopyButton text={input} label="Copy MD" />
          <CopyButton text={html} label="Copy HTML" />
          <button onClick={exportMd} className="action-btn primary">
            <Download size={13} /> Export .md
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex flex-col min-h-[450px]">
          <div className="pane-label">Editor</div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start writing Markdown..."
            className="tool-textarea flex-1 font-mono text-[13px]"
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey)) {
                if (e.key === "b") { e.preventDefault(); applyAction((ta) => insertWrap(ta, "**", "**", "bold text")); }
                if (e.key === "i") { e.preventDefault(); applyAction((ta) => insertWrap(ta, "*", "*", "italic text")); }
                if (e.key === "k") { e.preventDefault(); applyAction((ta) => { const start = ta.selectionStart; const end = ta.selectionEnd; const selected = ta.value.slice(start, end) || "link text"; const replacement = `[${selected}](https://url.com)`; const newValue = ta.value.slice(0, start) + replacement + ta.value.slice(end); return { newValue, newStart: start + selected.length + 3, newEnd: start + selected.length + 3 + "https://url.com".length }; }); }
              }
              // Tab inserts 2 spaces
              if (e.key === "Tab") {
                e.preventDefault();
                const ta = e.currentTarget;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const newValue = ta.value.slice(0, start) + "  " + ta.value.slice(end);
                setInput(newValue);
                requestAnimationFrame(() => { ta.setSelectionRange(start + 2, start + 2); });
              }
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-[450px] animate-slide-in">
          <div className="pane-label">Preview</div>
          <div className="output-panel flex-1 overflow-auto">
            <div
              className="md-preview"
              dangerouslySetInnerHTML={{ __html: html || '<span class="text-text-ghost text-sm">Preview will appear here…</span>' }}
            />
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Markdown to HTML", href: "/markdown-to-html" },
            { name: "Markdown to PDF", href: "/markdown-to-pdf" },
            { name: "HTML to Markdown", href: "/html-to-markdown" },
            { name: "Word Counter", href: "/words" },
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
