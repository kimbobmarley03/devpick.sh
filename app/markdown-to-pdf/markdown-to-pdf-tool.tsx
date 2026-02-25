"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, Eye, Code } from "lucide-react";

const SAMPLE_MD = `# Introduction to TypeScript

TypeScript is a **strongly typed** programming language that builds on JavaScript.

## Key Features

- **Static typing** — catch errors at compile time
- **Interfaces** — define contracts for objects
- **Generics** — reusable type-safe code
- **Enums** — named constant values

## Basic Example

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

## Why TypeScript?

TypeScript helps teams build *large-scale* applications with confidence. The type system acts as documentation and enables better IDE tooling.

> "Any application that can be written in JavaScript, will eventually be written in JavaScript." — Atwood's Law

## Getting Started

1. Install TypeScript: \`npm install -g typescript\`
2. Create a \`tsconfig.json\` file
3. Write \`.ts\` files and compile with \`tsc\`

---

Happy coding! 🚀`;

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`
  );

  // Inline code (before other processing)
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // Headers
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // HR
  html = html.replace(/^---+$/gm, "<hr>");

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Unordered lists
  html = html.replace(/((?:^[*-] .+\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) =>
      `<li>${l.replace(/^[*-] /, "")}</li>`
    ).join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split("\n").map((l) =>
      `<li>${l.replace(/^\d+\. /, "")}</li>`
    ).join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (double newlines)
  html = html.replace(/\n\n(?!<[uo]l|<h\d|<hr|<pre|<blockquote)/g, "</p><p>");
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs and nested p tags around block elements
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-6]>)/g, "$1");
  html = html.replace(/<\/h[1-6]><\/p>/g, (m) => m.replace("</p>", ""));
  html = html.replace(/<p>(<(?:ul|ol|pre|hr|blockquote))/g, "$1");
  html = html.replace(/(<\/(?:ul|ol|pre|blockquote)>)<\/p>/g, "$1");

  return html;
}


export function MarkdownToPdfTool() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [docTitle, setDocTitle] = useState("My Document");
  const [downloading, setDownloading] = useState(false);

  const htmlContent = markdownToHtml(markdown);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const PAGE_W = 595;
      const PAGE_H = 842;
      const MARGIN = 50;
      const maxWidth = PAGE_W - MARGIN * 2;

      let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      function newPage() {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
      }

      function checkY(needed: number) {
        if (y - needed < MARGIN) newPage();
      }

      function drawText(text: string, { size = 11, isBold = false, color = rgb(0.1, 0.1, 0.1), indent = 0 } = {}) {
        const f = isBold ? boldFont : font;
        const lineHeight = size * 1.5;
        const words = text.split(" ");
        let line = "";

        const lineWidth = maxWidth - indent;

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const tw = f.widthOfTextAtSize(testLine, size);
          if (tw > lineWidth && line) {
            checkY(lineHeight);
            page.drawText(line, { x: MARGIN + indent, y, size, font: f, color });
            y -= lineHeight;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) {
          checkY(lineHeight);
          page.drawText(line, { x: MARGIN + indent, y, size, font: f, color });
          y -= lineHeight;
        }
      }

      // Process markdown lines
      const lines = markdown.split("\n");
      let inCode = false;
      let codeBuffer: string[] = [];

      for (const rawLine of lines) {
        if (rawLine.startsWith("```")) {
          if (inCode) {
            // End code block
            for (const cl of codeBuffer) {
              const displayLine = cl.length > 80 ? cl.slice(0, 80) + "…" : cl;
              checkY(14);
              page.drawText(displayLine || " ", { x: MARGIN + 10, y, size: 9, font, color: rgb(0.2, 0.2, 0.6) });
              y -= 14;
            }
            y -= 6;
            codeBuffer = [];
            inCode = false;
          } else {
            inCode = true;
            y -= 4;
          }
          continue;
        }

        if (inCode) { codeBuffer.push(rawLine); continue; }

        if (!rawLine.trim()) { y -= 8; continue; }

        if (rawLine.match(/^---+$/)) {
          checkY(10);
          page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
          y -= 14;
          continue;
        }

        const h1 = rawLine.match(/^# (.+)/);
        const h2 = rawLine.match(/^## (.+)/);
        const h3 = rawLine.match(/^### (.+)/);
        const bq = rawLine.match(/^> (.+)/);
        const li = rawLine.match(/^[*-] (.+)/);
        const oli = rawLine.match(/^\d+\. (.+)/);

        if (h1) { y -= 8; drawText(h1[1], { size: 22, isBold: true }); y -= 4; }
        else if (h2) { y -= 6; drawText(h2[1], { size: 17, isBold: true }); y -= 2; }
        else if (h3) { y -= 4; drawText(h3[1], { size: 14, isBold: true }); }
        else if (bq) { drawText(bq[1], { size: 10, color: rgb(0.4, 0.4, 0.4), indent: 20 }); }
        else if (li) {
          const clean = li[1].replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1");
          checkY(14);
          page.drawText("•", { x: MARGIN + 5, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
          drawText(clean, { indent: 18 });
        }
        else if (oli) {
          const clean = oli[1].replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1");
          drawText(clean, { indent: 18 });
        }
        else {
          const clean = rawLine
            .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
            .replace(/\*\*(.+?)\*\*/g, "$1")
            .replace(/\*(.+?)\*/g, "$1")
            .replace(/`(.+?)`/g, "$1");
          drawText(clean);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolLayout
      title="Markdown to PDF"
      description="Convert Markdown to PDF. Preview your document and download as a PDF file. 100% client-side."
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {([["editor", <Code size={13} key="c" />, "Editor"], ["preview", <Eye size={13} key="e" />, "Preview"]] as const).map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn flex items-center gap-1.5 ${tab === t ? "active" : ""}`}
            >
              {icon}{label}
            </button>
          ))}
        </div>
        <input
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Document title"
          className="px-2 py-1 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-48"
        />
        <div className="ml-auto">
          <button
            onClick={downloadPdf}
            disabled={downloading || !markdown.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Download size={14} />
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      {tab === "editor" ? (
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="tool-textarea w-full"
          rows={28}
          placeholder="# My Document&#10;&#10;Write **Markdown** here..."
          spellCheck={false}
        />
      ) : (
        <div
          className="prose prose-zinc dark:prose-invert max-w-none p-6 rounded-lg border border-border-subtle bg-white dark:bg-zinc-900 min-h-[400px] overflow-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        />
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "Markdown to HTML", href: "/markdown-to-html" },
            { name: "JPG to PDF", href: "/jpg-to-pdf" },
            { name: "Merge PDF", href: "/merge-pdf" },
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
