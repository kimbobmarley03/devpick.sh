"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

type CaseType =
  | "UPPERCASE"
  | "lowercase"
  | "Title Case"
  | "camelCase"
  | "snake_case"
  | "kebab-case"
  | "PascalCase"
  | "CONSTANT_CASE";

function toWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function convert(text: string, caseType: CaseType): string {
  if (!text) return "";
  const words = toWords(text);
  switch (caseType) {
    case "UPPERCASE":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "Title Case":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "camelCase":
      return words
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    case "snake_case":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebab-case":
      return words.map((w) => w.toLowerCase()).join("-");
    case "PascalCase":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "CONSTANT_CASE":
      return words.map((w) => w.toUpperCase()).join("_");
    default:
      return text;
  }
}

const CASES: CaseType[] = [
  "UPPERCASE",
  "lowercase",
  "Title Case",
  "camelCase",
  "snake_case",
  "kebab-case",
  "PascalCase",
  "CONSTANT_CASE",
];

export function CaseTool() {
  useWebMCP({
    name: "convertCase",
    description: "Convert text between cases (upper, lower, title, camel, snake, kebab)",
    inputSchema: {
      type: "object" as const,
      properties: {
      "text": {
            "type": "string",
            "description": "Text to convert"
      },
      "case": {
            "type": "string",
            "description": "Target case: upper, lower, title, camel, snake, kebab"
      }
},
      required: ["text", "case"],
    },
    execute: async (params) => {
      const t = params.text as string; const c = params.case as string; let r = t; if (c === "upper") r = t.toUpperCase(); else if (c === "lower") r = t.toLowerCase(); else if (c === "title") r = t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()); else if (c === "snake") r = t.toLowerCase().replace(/\s+/g, "_"); else if (c === "kebab") r = t.toLowerCase().replace(/\s+/g, "-"); else if (c === "camel") r = t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); return { content: [{ type: "text", text: r }] };
    },
  });

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<CaseType>("camelCase");

  const output = convert(input, selected);

  return (
    <ToolLayout agentReady
      title="Text Case Converter"
      description="Convert text between UPPERCASE, camelCase, snake_case, kebab-case, PascalCase, and more"
    >
      {/* Case buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CASES.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`tab-btn font-mono ${selected === c ? "active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 justify-end">
        <button onClick={() => setInput("")} className="action-btn">
          <Trash2 size={13} />
          Clear
        </button>
        <CopyButton text={output} />
      </div>

      {/* Split panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col min-h-[300px]">
          <div className="pane-label">Input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your text here..."
            className="tool-textarea flex-1"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col min-h-[300px]">
          <div className="pane-label">
            Output — <span className="text-[#3b82f6]">{selected}</span>
          </div>
          <div className="output-panel flex-1">
            {output ? (
              <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
                {output}
              </pre>
            ) : (
              <span className="text-text-ghost font-mono text-[13px]">Output will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {/* One-click all conversions */}
      {input && (
        <div className="mt-5">
          <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider mb-3">All Conversions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CASES.map((c) => (
              <div
                key={c}
                className="bg-card-bg border border-card-border rounded-lg px-3 py-2 flex items-center justify-between gap-2 hover:border-border-strong transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-[10px] text-text-dimmed font-mono mb-0.5">{c}</div>
                  <div className="font-mono text-sm text-text-primary truncate">{convert(input, c)}</div>
                </div>
                <div className="flex-shrink-0">
                  <CopyButton text={convert(input, c)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Slug Generator", href: "/slug-generator" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Text Sort & Dedupe", href: "/text-sort" },
            { name: "Lorem Ipsum", href: "/lorem-ipsum-generator" },
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
