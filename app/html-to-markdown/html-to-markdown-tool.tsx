"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, RefreshCw } from "lucide-react";

// Pure DOM-based HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  // Use DOMParser if available
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(convertNode).join("");

    switch (tag) {
      // Headings
      case "h1": return `\n# ${children.trim()}\n\n`;
      case "h2": return `\n## ${children.trim()}\n\n`;
      case "h3": return `\n### ${children.trim()}\n\n`;
      case "h4": return `\n#### ${children.trim()}\n\n`;
      case "h5": return `\n##### ${children.trim()}\n\n`;
      case "h6": return `\n###### ${children.trim()}\n\n`;
      // Bold
      case "strong":
      case "b": return `**${children}**`;
      // Italic
      case "em":
      case "i": return `*${children}*`;
      // Strikethrough
      case "s":
      case "del":
      case "strike": return `~~${children}~~`;
      // Inline code
      case "code": {
        const parent = el.parentElement?.tagName.toLowerCase();
        if (parent === "pre") return children;
        return `\`${children}\``;
      }
      // Code block
      case "pre": {
        const codeEl = el.querySelector("code");
        const lang = codeEl?.className.match(/language-(\w+)/)?.[1] || "";
        const code = codeEl ? (codeEl.textContent || "") : children;
        return `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
      }
      // Links
      case "a": {
        const href = el.getAttribute("href") || "";
        const title = el.getAttribute("title");
        if (title) return `[${children}](${href} "${title}")`;
        return `[${children}](${href})`;
      }
      // Images
      case "img": {
        const src = el.getAttribute("src") || "";
        const alt = el.getAttribute("alt") || "";
        const title = el.getAttribute("title");
        if (title) return `![${alt}](${src} "${title}")`;
        return `![${alt}](${src})`;
      }
      // Lists
      case "ul": {
        const items = Array.from(el.children)
          .filter((c) => c.tagName.toLowerCase() === "li")
          .map((li) => {
            const content = Array.from(li.childNodes).map(convertNode).join("").trim();
            return `- ${content}`;
          });
        return `\n${items.join("\n")}\n\n`;
      }
      case "ol": {
        const items = Array.from(el.children)
          .filter((c) => c.tagName.toLowerCase() === "li")
          .map((li, i) => {
            const content = Array.from(li.childNodes).map(convertNode).join("").trim();
            return `${i + 1}. ${content}`;
          });
        return `\n${items.join("\n")}\n\n`;
      }
      case "li": return children;
      // Blockquote
      case "blockquote": {
        const lines = children.trim().split("\n");
        return `\n${lines.map((l) => `> ${l}`).join("\n")}\n\n`;
      }
      // Horizontal rule
      case "hr": return `\n---\n\n`;
      // Paragraph
      case "p": return `\n${children.trim()}\n\n`;
      // Line break
      case "br": return "  \n";
      // Tables
      case "table": {
        const rows = Array.from(el.querySelectorAll("tr"));
        if (rows.length === 0) return "";
        const isHeader = (cell: Element) => cell.tagName.toLowerCase() === "th";
        let md = "\n";
        rows.forEach((row, rowIdx) => {
          const cells = Array.from(row.children)
            .filter((c) => ["td", "th"].includes(c.tagName.toLowerCase()))
            .map((c) => Array.from(c.childNodes).map(convertNode).join("").trim());
          md += `| ${cells.join(" | ")} |\n`;
          if (rowIdx === 0 && row.children[0] && isHeader(row.children[0])) {
            md += `| ${cells.map(() => "---").join(" | ")} |\n`;
          }
        });
        return md + "\n";
      }
      // Div/span — just pass through children
      case "div": return `\n${children}\n`;
      case "span": return children;
      // Head, script, style — skip
      case "head":
      case "script":
      case "style": return "";
      // Body, html — just children
      case "html":
      case "body": return children;
      default: return children;
    }
  }

  const result = convertNode(doc.body);

  // Clean up excessive blank lines
  return result
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SAMPLE_HTML = `<h1>Hello, World!</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> paragraph.</p>
<h2>Features</h2>
<ul>
  <li>Supports <code>inline code</code></li>
  <li>And <a href="https://devpick.sh">links</a></li>
  <li>And images: <img src="logo.png" alt="Logo" /></li>
</ul>
<h3>Code Block</h3>
<pre><code class="language-javascript">const x = 42;
console.log(x);
</code></pre>
<blockquote>
  <p>A blockquote example.</p>
</blockquote>
<table>
  <tr><th>Name</th><th>Age</th></tr>
  <tr><td>Alice</td><td>30</td></tr>
  <tr><td>Bob</td><td>25</td></tr>
</table>`;

export function HtmlToMarkdownTool() {
  useWebMCP({
    name: "htmlToMarkdown",
    description: "Convert HTML to Markdown",
    inputSchema: {
      type: "object" as const,
      properties: {
      "html": {
            "type": "string",
            "description": "HTML to convert"
      }
},
      required: ["html"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for HTML to Markdown" }] };
    },
  });

  const [input, setInput] = useState(SAMPLE_HTML);

  const output = useCallback(() => {
    if (!input.trim()) return "";
    try {
      return htmlToMarkdown(input);
    } catch {
      return "⚠ Failed to parse HTML. Check your input.";
    }
  }, [input])();

  return (
    <ToolLayout agentReady
      title="HTML to Markdown"
      description="Convert HTML to Markdown — headings, bold, italic, links, images, lists, code blocks, tables"
    >
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setInput("")} className="action-btn">
          <Trash2 size={13} />
          Clear
        </button>
        <button onClick={() => setInput(SAMPLE_HTML)} className="action-btn">
          <RefreshCw size={13} />
          Sample
        </button>
        <div className="ml-auto">
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">HTML Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste HTML here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">Markdown Output</div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Markdown will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />

      <div className="mt-4 p-3 bg-[var(--dp-bg-subtle)] rounded-lg text-xs text-text-dimmed">
        <strong className="text-text-secondary">Supported:</strong>{" "}
        h1-h6, bold, italic, strikethrough, inline code, code blocks (with language), links, images, unordered/ordered lists, blockquotes, horizontal rules, paragraphs, tables
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Code Minifier", href: "/js-minifier" },
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
