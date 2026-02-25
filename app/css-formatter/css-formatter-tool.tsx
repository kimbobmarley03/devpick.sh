"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Mode = "beautify" | "minify";

function beautifyCSS(css: string): string {
  if (!css.trim()) return "";
  let result = "";
  let indent = 0;
  let i = 0;
  const src = css.replace(/\s+/g, " ").trim();

  while (i < src.length) {
    const ch = src[i];

    if (ch === "{") {
      result = result.trimEnd() + " {\n";
      indent++;
      result += "  ".repeat(indent);
      i++;
    } else if (ch === "}") {
      indent = Math.max(0, indent - 1);
      result = result.trimEnd() + "\n" + "  ".repeat(indent) + "}\n\n";
      i++;
      // skip space after }
      while (i < src.length && src[i] === " ") i++;
    } else if (ch === ";") {
      result = result.trimEnd() + ";\n" + "  ".repeat(indent);
      i++;
      while (i < src.length && src[i] === " ") i++;
    } else if (ch === ":" && indent > 0) {
      // property: value — add space after colon
      result += ": ";
      i++;
      while (i < src.length && src[i] === " ") i++;
    } else if (ch === "," && indent === 0) {
      // selector list
      result += ",\n";
      i++;
      while (i < src.length && src[i] === " ") i++;
    } else {
      result += ch;
      i++;
    }
  }
  return result.trim();
}

function minifyCSS(css: string): string {
  if (!css.trim()) return "";
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .replace(/;\}/g, "}")
    .trim();
}

const SAMPLE = `/* Navigation styles */
.navbar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar a,
.navbar button {
  color: #ffffff;
  font-size: 14px;
  text-decoration: none;
}`;

export function CssFormatterTool() {
  useWebMCP({
    name: "formatCSS",
    description: "Format and prettify CSS",
    inputSchema: {
      type: "object" as const,
      properties: {
      "css": {
            "type": "string",
            "description": "CSS to format"
      }
},
      required: ["css"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: params.css as string }] };
    },
  });

  const [mode, setMode] = useState<Mode>("beautify");
  const [input, setInput] = useState(SAMPLE);

  const output =
    mode === "beautify" ? beautifyCSS(input) : minifyCSS(input);

  return (
    <ToolLayout agentReady
      title="CSS Formatter"
      description="Beautify or minify CSS code — runs entirely in your browser, no data sent anywhere."
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
            <div className="pane-label">CSS Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste CSS here..."
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

      {/* Stats */}
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
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "JS/TS Formatter", href: "/js-formatter" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "CSS Gradient Generator", href: "/css-gradient" },
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
