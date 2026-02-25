"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

const SAMPLE_MD = `# Hello, Markdown!

Welcome to the **Markdown Preview** tool. Write markdown on the left, see the rendered output on the right.

## Features

- **Bold text** with double asterisks
- *Italic text* with single asterisks
- \`inline code\` with backticks
- [Links](https://devpick.sh) with brackets

## Code Block

\`\`\`
const hello = "world";
console.log(hello);
\`\`\`

## Blockquote

> This is a blockquote. Great for highlighting important notes.

---

## Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item
  - Nested item

## Table-less formatting

Use **bold** for emphasis and *italic* for style.
`;

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
    if (inList) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
      listType = null;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
  };

  const processInline = (text: string): string => {
    return text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  };

  for (const rawLine of lines) {
    const line = rawLine;

    // Code fence
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        out.push("</code></pre>");
        inCodeBlock = false;
      } else {
        closeList();
        closeBlockquote();
        out.push('<pre><code>');
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      out.push(escapeHtml(line));
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      out.push("<hr />");
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      closeList();
      closeBlockquote();
      const level = headerMatch[1].length;
      out.push(`<h${level}>${processInline(headerMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^>\s?(.*)/);
    if (bqMatch) {
      closeList();
      if (!inBlockquote) {
        out.push("<blockquote>");
        inBlockquote = true;
      }
      out.push(`<p>${processInline(bqMatch[1])}</p>`);
      continue;
    }
    closeBlockquote();

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        out.push("<ul>");
        inList = true;
        listType = "ul";
      }
      out.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        out.push("<ol>");
        inList = true;
        listType = "ol";
      }
      out.push(`<li>${processInline(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    // Empty line
    if (!line.trim()) {
      out.push("<br />");
      continue;
    }

    // Paragraph
    out.push(`<p>${processInline(line)}</p>`);
  }

  closeList();
  closeBlockquote();
  if (inCodeBlock) out.push("</code></pre>");

  return out.join("\n");
}

const PREVIEW_STYLES = `
  .md-preview { color: #e5e5e5; font-size: 14px; line-height: 1.7; }
  .md-preview h1, .md-preview h2, .md-preview h3,
  .md-preview h4, .md-preview h5, .md-preview h6 {
    color: #f5f5f5; margin: 1.2em 0 0.5em; font-weight: 700;
  }
  .md-preview h1 { font-size: 1.6em; border-bottom: 1px solid #222; padding-bottom: 0.3em; }
  .md-preview h2 { font-size: 1.3em; border-bottom: 1px solid #1a1a1a; padding-bottom: 0.2em; }
  .md-preview h3 { font-size: 1.1em; }
  .md-preview p { margin: 0.5em 0; }
  .md-preview strong { color: #f5f5f5; font-weight: 700; }
  .md-preview em { color: #a3a3a3; font-style: italic; }
  .md-preview code {
    background: #1a1a1a; border: 1px solid #2a2a2a;
    padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;
    color: #7dd3fc;
  }
  .md-preview pre {
    background: #111; border: 1px solid #222; border-radius: 8px;
    padding: 12px; overflow-x: auto; margin: 0.8em 0;
  }
  .md-preview pre code { background: none; border: none; padding: 0; color: #a3e635; }
  .md-preview a { color: #3b82f6; text-decoration: underline; }
  .md-preview a:hover { color: #60a5fa; }
  .md-preview ul, .md-preview ol { padding-left: 1.5em; margin: 0.5em 0; }
  .md-preview li { margin: 0.2em 0; }
  .md-preview blockquote {
    border-left: 3px solid #3b82f6; margin: 0.8em 0;
    padding: 4px 12px; color: #888; background: #111; border-radius: 0 6px 6px 0;
  }
  .md-preview blockquote p { margin: 0.2em 0; }
  .md-preview hr { border: none; border-top: 1px solid #333; margin: 1.2em 0; }
  .md-preview br { display: block; margin: 0.2em 0; content: ""; }
`;

export function MarkdownTool() {
  const [input, setInput] = useState(SAMPLE_MD);

  const html = renderMarkdown(input);

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write Markdown and see the rendered output live"
    >
      <style dangerouslySetInnerHTML={{ __html: PREVIEW_STYLES }} />

      <div className="flex items-center gap-2 mb-4 justify-end">
        <button onClick={() => setInput("")} className="action-btn">
          <Trash2 size={13} />
          Clear
        </button>
        <CopyButton text={input} label="Copy MD" />
        <CopyButton text={html} label="Copy HTML" />
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">Markdown</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your Markdown here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">Preview</div>
            <div className="output-panel flex-1" style={{ padding: "16px" }}>
              {input ? (
                <div
                  className="md-preview"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Preview will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Word Counter", href: "/character-counter" },
            { name: "HTML to Markdown", href: "/html-to-markdown" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "Slug Generator", href: "/slug-generator" },
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
