"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Page metadata -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>  My Awesome Page  </title>
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: sans-serif;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <!-- Main content -->
    <div class="container">
      <h1>  Hello, World!  </h1>
      <p>
        This is a
        sample HTML page with
        lots of whitespace.
      </p>
      <!-- This comment should be removed -->
      <ul>
        <li> Item 1 </li>
        <li> Item 2 </li>
        <li> Item 3 </li>
      </ul>
    </div>
    <script>
      // Initialize app
      function init() {
        console.log("Ready!");
      }
      init();
    </script>
  </body>
</html>`;

interface MinifyOptions {
  removeComments: boolean;
  collapseWhitespace: boolean;
  removeOptionalTags: boolean;
  removeAttributeQuotes: boolean;
  collapseInlineTagWhitespace: boolean;
  minifyInlineCSS: boolean;
  minifyInlineJS: boolean;
}

function minifyHtml(html: string, opts: MinifyOptions): string {
  let result = html;

  // Remove HTML comments (not conditional comments)
  if (opts.removeComments) {
    result = result.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
  }

  // Minify inline CSS in <style> blocks
  if (opts.minifyInlineCSS) {
    result = result.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, open, css, close) => {
      const minCss = css
        .replace(/\/\*[\s\S]*?\*\//g, "") // remove CSS comments
        .replace(/\s*([{}:;,>~+])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
      return `${open}${minCss}${close}`;
    });
  }

  // Minify inline JS in <script> blocks
  if (opts.minifyInlineJS) {
    result = result.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, open, js, close) => {
      const minJs = js
        .replace(/\/\/[^\n]*/g, "") // line comments
        .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
        .replace(/\s+/g, " ")
        .trim();
      return `${open}${minJs}${close}`;
    });
  }

  // Collapse whitespace between tags
  if (opts.collapseWhitespace) {
    // Collapse newlines + spaces between tags
    result = result.replace(/>\s+</g, "><");
    // Collapse multiple spaces (not inside pre/code/textarea)
    result = result.replace(/[ \t]+/g, " ");
    // Remove leading/trailing whitespace in attribute values (normalize)
    result = result.replace(/\s*=\s*/g, "=");
  }

  // Remove optional closing tags
  if (opts.removeOptionalTags) {
    result = result.replace(/<\/(?:li|dt|dd|p|thead|tbody|tfoot|tr|th|td|html|head|body)>/gi, "");
  }

  // Remove quotes from attributes (only safe for simple values)
  if (opts.removeAttributeQuotes) {
    // Only remove quotes for values with no spaces or special chars
    result = result.replace(/="([^"'\s<>`=]+)"/g, "=$1");
  }

  // Inline tag whitespace collapse
  if (opts.collapseInlineTagWhitespace) {
    result = result.replace(/(<(?:span|a|b|em|strong|i|small|sub|sup|time)[^>]*>)\s+/gi, "$1");
    result = result.replace(/\s+(<\/(?:span|a|b|em|strong|i|small|sub|sup|time)>)/gi, "$1");
  }

  return result.trim();
}

export function HtmlMinifierTool() {
  const [input, setInput] = useState(SAMPLE_HTML);
  const [opts, setOpts] = useState<MinifyOptions>({
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: false,
    removeAttributeQuotes: false,
    collapseInlineTagWhitespace: true,
    minifyInlineCSS: true,
    minifyInlineJS: true,
  });

  const toggle = (k: keyof MinifyOptions) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const output = input.trim() ? minifyHtml(input, opts) : "";
  const origSize = new Blob([input]).size;
  const minSize = new Blob([output]).size;
  const savings = origSize > 0 ? Math.round(((origSize - minSize) / origSize) * 100) : 0;

  return (
    <ToolLayout
      title="HTML Minifier"
      description="Minify HTML code to reduce file size. Remove comments, whitespace, optional tags. 100% client-side."
    >
      {/* Options */}
      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-border-subtle">
        {(
          [
            { key: "removeComments", label: "Remove comments" },
            { key: "collapseWhitespace", label: "Collapse whitespace" },
            { key: "collapseInlineTagWhitespace", label: "Inline tag whitespace" },
            { key: "minifyInlineCSS", label: "Minify inline CSS" },
            { key: "minifyInlineJS", label: "Minify inline JS" },
            { key: "removeOptionalTags", label: "Remove optional tags" },
            { key: "removeAttributeQuotes", label: "Remove attribute quotes" },
          ] as { key: keyof MinifyOptions; label: string }[]
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={() => toggle(key)}
              className="w-3.5 h-3.5 accent-emerald-600"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Stats */}
      {output && (
        <div className="flex gap-4 text-xs text-text-ghost mb-3 font-mono">
          <span>Original: {origSize.toLocaleString()} bytes</span>
          <span>Minified: {minSize.toLocaleString()} bytes</span>
          {savings > 0 && <span className="text-emerald-600 dark:text-emerald-400">−{savings}% saved</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mb-2">
        <button onClick={() => setInput("")} className="action-btn">
          <Trash2 size={13} />
          Clear
        </button>
        <CopyButton text={output} />
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">HTML Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste HTML here…"
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">Minified Output</div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Minified HTML will appear here…
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
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "JS/TS Formatter", href: "/js-formatter" },
            { name: "JavaScript Obfuscator", href: "/javascript-obfuscator" },
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
