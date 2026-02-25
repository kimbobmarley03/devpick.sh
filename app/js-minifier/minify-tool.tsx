"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Tab = "html" | "css" | "js";

function minifyHtml(input: string): string {
  return input
    // Remove HTML comments (but not conditional comments)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    // Collapse whitespace between tags
    .replace(/>\s+</g, "><")
    // Collapse whitespace inside tags (but preserve content)
    .replace(/\s{2,}/g, " ")
    // Remove leading/trailing whitespace
    .trim();
}

function minifyCss(input: string): string {
  return input
    // Remove single-line comments
    .replace(/\/\/[^\n]*/g, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Collapse whitespace
    .replace(/\s{2,}/g, " ")
    // Remove spaces around punctuation
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    // Remove last semicolon before }
    .replace(/;}/g, "}")
    .trim();
}

function minifyJs(input: string): string {
  return input
    // Remove single-line comments (careful not to catch URLs)
    .replace(/(?<!:)\/\/[^\n]*/g, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Collapse whitespace (not inside strings — simple approach)
    .replace(/\s{2,}/g, " ")
    // Remove spaces around operators and punctuation
    .replace(/\s*([=+\-*/%&|^!<>?:,;{}()[\]])\s*/g, "$1")
    .trim();
}

function minify(code: string, tab: Tab): string {
  if (tab === "html") return minifyHtml(code);
  if (tab === "css") return minifyCss(code);
  return minifyJs(code);
}

function byteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const EXAMPLES: Record<Tab, string> = {
  html: `<!DOCTYPE html>
<!-- Main page -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
  </body>
</html>`,
  css: `/* Reset styles */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  color: #333;
}

/* Header */
.header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 16px 24px;
}`,
  js: `// Main entry point
function greet(name) {
  /* Say hello */
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

const result = greet("World");
console.log(result);`,
};

export function MinifyTool() {
  const [tab, setTab] = useState<Tab>("html");
  const [inputs, setInputs] = useState<Record<Tab, string>>({ html: "", css: "", js: "" });

  const input = inputs[tab];
  const output = input.trim() ? minify(input, tab) : "";

  const origBytes = byteSize(input);
  const minBytes = byteSize(output);
  const savings = origBytes > 0 ? Math.round((1 - minBytes / origBytes) * 100) : 0;

  const setInput = (val: string) => setInputs((prev) => ({ ...prev, [tab]: val }));

  return (
    <ToolLayout
      title="Code Minifier"
      description="Minify HTML, CSS, and JavaScript — strip comments, collapse whitespace, reduce file size"
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["html", "css", "js"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-btn uppercase ${tab === t ? "active" : ""}`}
          >
            {t}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setInput(EXAMPLES[tab])} className="action-btn">
            Example
          </button>
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
            <div className="pane-label">
              Original
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste ${tab.toUpperCase()} here...`}
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              Minified
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Minified output will appear here...
                </span>
              )}
            </div>
            {output && (
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-text-dimmed">
                <span>Before: <span className="text-text-secondary">{formatBytes(origBytes)}</span></span>
                <span>After: <span className="text-text-secondary">{formatBytes(minBytes)}</span></span>
                <span className={savings > 0 ? "text-green-500" : "text-text-secondary"}>
                  {savings > 0 ? `↓ ${savings}% smaller` : "No reduction"}
                </span>
              </div>
            )}
          </div>
        }
      />
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "SQL Formatter", href: "/sql-formatter" },
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "Diff Checker", href: "/diff-checker" },
            { name: "JSON Formatter", href: "/json-formatter" },
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
