"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseInline(text: string): string {
  let s = text;
  // Code spans
  s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  // Bold+italic
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
  // Italic
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  // Strikethrough
  s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Images
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  return s;
}

function markdownToHtml(md: string): string {
  if (!md.trim()) return "";
  const lines = md.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeContent: string[] = [];
  let inList = false;
  let listType = "";
  let inBlockquote = false;

  const closeList = () => {
    if (inList) {
      html.push(`</${listType}>`);
      inList = false;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push("</blockquote>");
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        closeBlockquote();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeContent = [];
      } else {
        inCodeBlock = false;
        const lang = codeLang ? ` class="language-${codeLang}"` : "";
        html.push(`<pre><code${lang}>${escapeHtml(codeContent.join("\n"))}</code></pre>`);
        codeLang = "";
        codeContent = [];
      }
      continue;
    }
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Horizontal rule
    if (/^([-*_]){3,}\s*$/.test(line)) {
      closeList();
      closeBlockquote();
      html.push("<hr>");
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      closeList();
      closeBlockquote();
      const level = hMatch[1].length;
      html.push(`<h${level}>${parseInline(hMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      closeList();
      if (!inBlockquote) {
        html.push("<blockquote>");
        inBlockquote = true;
      }
      html.push(`<p>${parseInline(line.slice(2))}</p>`);
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^[\-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        html.push("<ul>");
        inList = true;
        listType = "ul";
      }
      html.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        html.push("<ol>");
        inList = true;
        listType = "ol";
      }
      html.push(`<li>${parseInline(olMatch[1])}</li>`);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      closeList();
      continue;
    }

    // Table
    if (line.includes("|")) {
      closeList();
      // Simple table detection: line with pipes
      const tableLines: string[] = [line];
      while (i + 1 < lines.length && lines[i + 1].includes("|")) {
        i++;
        tableLines.push(lines[i]);
      }
      if (tableLines.length >= 2) {
        const [header, separator, ...bodyLines] = tableLines;
        const _ = separator; void _;
        const headers = header.split("|").map((c) => c.trim()).filter(Boolean);
        html.push('<table><thead><tr>');
        headers.forEach((h) => html.push(`<th>${parseInline(h)}</th>`));
        html.push('</tr></thead><tbody>');
        for (const row of bodyLines) {
          const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
          html.push("<tr>");
          cells.forEach((c) => html.push(`<td>${parseInline(c)}</td>`));
          html.push("</tr>");
        }
        html.push("</tbody></table>");
        continue;
      }
    }

    // Paragraph
    closeList();
    html.push(`<p>${parseInline(line)}</p>`);
  }

  closeList();
  closeBlockquote();

  return html.join("\n");
}

const SAMPLE = `# Markdown to HTML

Convert **Markdown** to *HTML* with ease.

## Features

- Headings (h1–h6)
- **Bold** and *italic* text
- \`inline code\` and code blocks
- [Links](https://devpick.sh) and images
- Ordered and unordered lists
- Blockquotes and tables

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));
\`\`\`

> This is a blockquote with **bold** text.

| Name  | Role    |
|-------|---------|
| Alice | Admin   |
| Bob   | Editor  |`;

export function MarkdownToHtmlTool() {
  const [input, setInput] = useState(SAMPLE);
  const [view, setView] = useState<"html" | "preview">("html");

  const output = markdownToHtml(input);

  return (
    <ToolLayout
      title="Markdown to HTML"
      description="Convert Markdown to HTML — supports headings, lists, code blocks, tables, and more. Client-side."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => setView("html")}
            className={`tab-btn ${view === "html" ? "active" : ""}`}
          >
            HTML Source
          </button>
          <button
            onClick={() => setView("preview")}
            className={`tab-btn ${view === "preview" ? "active" : ""}`}
          >
            Preview
          </button>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">Markdown Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="# Hello World&#10;&#10;Type **Markdown** here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {view === "html" ? "HTML Output" : "Preview"}
            </div>
            <div className="output-panel flex-1 overflow-auto">
              {view === "html" ? (
                output ? (
                  <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                    {output}
                  </pre>
                ) : (
                  <span className="text-text-ghost font-mono text-[13px]">
                    Output will appear here...
                  </span>
                )
              ) : (
                <div
                  className="prose prose-invert max-w-none text-sm text-text-primary"
                  dangerouslySetInnerHTML={{ __html: output }}
                  style={{
                    lineHeight: "1.7",
                  }}
                />
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
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "HTML to Markdown", href: "/html-to-markdown" },
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "HTML Entities", href: "/html-entities" },
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
