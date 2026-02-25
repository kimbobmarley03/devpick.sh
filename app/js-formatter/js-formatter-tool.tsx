"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type Mode = "beautify" | "minify";

function beautifyJS(code: string): string {
  if (!code.trim()) return "";
  const lines: string[] = [];
  let indent = 0;
  let i = 0;
  let inString: string | null = null;
  let current = "";

  const flush = () => {
    const t = current.trim();
    if (t) lines.push("  ".repeat(Math.max(0, indent)) + t);
    current = "";
  };

  while (i < code.length) {
    const ch = code[i];

    // Handle string literals
    if (!inString && (ch === '"' || ch === "'" || ch === "`")) {
      inString = ch;
      current += ch;
      i++;
      continue;
    }
    if (inString) {
      if (ch === inString && code[i - 1] !== "\\") inString = null;
      current += ch;
      i++;
      continue;
    }

    if (ch === "{") {
      current += " {";
      flush();
      indent++;
      i++;
    } else if (ch === "}") {
      flush();
      indent = Math.max(0, indent - 1);
      current = "}";
      if (code[i + 1] === ";") {
        current += ";";
        i += 2;
      } else {
        i++;
      }
      flush();
    } else if (ch === ";") {
      current += ";";
      flush();
      i++;
    } else if (ch === "\n") {
      // preserve newlines where there's content
      if (current.trim()) flush();
      i++;
    } else {
      current += ch;
      i++;
    }
  }
  if (current.trim()) flush();

  return lines.join("\n");
}

function minifyJS(code: string): string {
  if (!code.trim()) return "";
  // Remove single-line comments (but not URLs in strings)
  let result = code;
  // Remove block comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Remove single-line comments
  result = result.replace(/\/\/[^\n]*/g, "");
  // Collapse whitespace
  result = result.replace(/\s+/g, " ");
  // Remove spaces around operators/punctuation
  result = result.replace(/\s*([\{\}\[\]\(\),;:])\s*/g, "$1");
  result = result.replace(/\s*=\s*/g, "=");
  return result.trim();
}

const SAMPLE = `function greet(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

users.forEach(user => {
  greet(user.name);
});`;

export function JsFormatterTool() {
  useWebMCP({
    name: "formatJS",
    description: "Format JavaScript or TypeScript code",
    inputSchema: {
      type: "object" as const,
      properties: {
      "code": {
            "type": "string",
            "description": "JS/TS code to format"
      }
},
      required: ["code"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: params.code as string }] };
    },
  });

  const [mode, setMode] = useState<Mode>("beautify");
  const [input, setInput] = useState(SAMPLE);

  const output = mode === "beautify" ? beautifyJS(input) : minifyJS(input);

  return (
    <ToolLayout agentReady
      title="JS / TS Formatter"
      description="Beautify or minify JavaScript and TypeScript code — runs entirely in your browser."
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
            <div className="pane-label">JavaScript / TypeScript Input</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JS or TS code here..."
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
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "Code Minifier", href: "/js-minifier" },
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
