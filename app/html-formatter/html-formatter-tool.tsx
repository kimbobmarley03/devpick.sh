"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Mode = "beautify" | "minify";

const VOID_TAGS = new Set([
  "area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr",
]);
const INLINE_TAGS = new Set([
  "a","abbr","acronym","b","bdo","big","br","button","cite","code","dfn","em","i",
  "img","input","kbd","label","map","object","output","q","samp","select","small",
  "span","strong","sub","sup","textarea","time","tt","var",
]);

function beautifyHTML(html: string): string {
  if (!html.trim()) return "";
  // Tokenize into tags and text
  const tokens: string[] = [];
  const re = /(<[^>]+>|[^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const t = m[1].trim();
    if (t) tokens.push(t);
  }

  let indent = 0;
  const lines: string[] = [];
  const pad = (n: number) => "  ".repeat(n);

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.startsWith("</")) {
      // Closing tag
      const tagName = tok.slice(2, tok.length - 1).split(/\s/)[0].toLowerCase();
      if (!INLINE_TAGS.has(tagName)) {
        indent = Math.max(0, indent - 1);
      }
      lines.push(pad(indent) + tok);
    } else if (tok.startsWith("<!--")) {
      lines.push(pad(indent) + tok);
    } else if (tok.startsWith("<!")) {
      lines.push(tok);
    } else if (tok.startsWith("<")) {
      // Opening tag or self-closing
      const tagName = tok.slice(1).split(/[\s>/]/)[0].toLowerCase();
      const isSelfClose = tok.endsWith("/>") || VOID_TAGS.has(tagName);
      if (INLINE_TAGS.has(tagName)) {
        lines.push(pad(indent) + tok);
      } else {
        lines.push(pad(indent) + tok);
        if (!isSelfClose) indent++;
      }
    } else {
      // Text node
      lines.push(pad(indent) + tok);
    }
  }
  return lines.join("\n");
}

function minifyHTML(html: string): string {
  if (!html.trim()) return "";
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<")
    .trim();
}

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My Page</title>
</head>
<body>
<header>
<h1>Hello World</h1>
<nav><a href="/">Home</a><a href="/about">About</a></nav>
</header>
<main>
<p>Welcome to my <strong>awesome</strong> page.</p>
</main>
</body>
</html>`;

export function HtmlFormatterTool() {
  useWebMCP({
    name: "formatHTML",
    description: "Format and prettify HTML",
    inputSchema: {
      type: "object" as const,
      properties: {
      "html": {
            "type": "string",
            "description": "HTML to format"
      }
},
      required: ["html"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: params.html as string }] };
    },
  });

  const [mode, setMode] = useState<Mode>("beautify");
  const [input, setInput] = useState(SAMPLE);

  const output =
    mode === "beautify" ? beautifyHTML(input) : minifyHTML(input);

  return (
    <ToolLayout agentReady
      title="HTML Formatter"
      description="Beautify or minify HTML code — runs entirely in your browser, no data sent anywhere."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {(["beautify", "minify"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
            >
              {m}
            </button>
          ))}
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
            <div className="pane-label">
              {mode === "beautify" ? "Beautified Output" : "Minified Output"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Output will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />

      {input && output && (
        <div className="mt-3 flex gap-4 text-xs text-text-dimmed font-mono">
          <span>Input: {input.length} chars</span>
          <span>Output: {output.length} chars</span>
          {mode === "minify" && (
            <span className="text-green-400">
              Saved {Math.round((1 - output.length / input.length) * 100)}%
            </span>
          )}
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "CSS Formatter", href: "/css-formatter" },
            { name: "JS/TS Formatter", href: "/js-formatter" },
            { name: "HTML to Markdown", href: "/html-to-markdown" },
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
