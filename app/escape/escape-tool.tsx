"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Tab = "json" | "html" | "url" | "xml" | "regex";
type Direction = "escape" | "unescape";

function escapeJson(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/[\x00-\x1f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function unescapeJson(s: string): string {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return s
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function escapeUrl(s: string): string {
  return encodeURIComponent(s);
}

function unescapeUrl(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(s: string): string {
  return s.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}

function transform(s: string, tab: Tab, dir: Direction): string {
  if (!s) return "";
  try {
    if (tab === "json") return dir === "escape" ? escapeJson(s) : unescapeJson(s);
    if (tab === "html") return dir === "escape" ? escapeHtml(s) : unescapeHtml(s);
    if (tab === "url") return dir === "escape" ? escapeUrl(s) : unescapeUrl(s);
    if (tab === "xml") return dir === "escape" ? escapeXml(s) : unescapeXml(s);
    if (tab === "regex") return dir === "escape" ? escapeRegex(s) : unescapeRegex(s);
  } catch {
    return "⚠ Error processing input";
  }
  return s;
}

const TAB_LABELS: Record<Tab, string> = {
  json: "JSON",
  html: "HTML",
  url: "URL",
  xml: "XML",
  regex: "Regex",
};

export function EscapeTool() {
  const [tab, setTab] = useState<Tab>("json");
  const [dir, setDir] = useState<Direction>("escape");
  const [input, setInput] = useState("");

  const output = transform(input, tab, dir);

  const swap = () => {
    setDir(dir === "escape" ? "unescape" : "escape");
    setInput(output);
  };

  return (
    <ToolLayout
      title="Escape / Unescape"
      description="Escape and unescape strings — JSON, HTML, URL, XML, Regex"
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-btn ${tab === t ? "active" : ""}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setDir("escape")}
            className={`tab-btn ${dir === "escape" ? "active" : ""}`}
          >
            Escape
          </button>
          <button
            onClick={() => setDir("unescape")}
            className={`tab-btn ${dir === "unescape" ? "active" : ""}`}
          >
            Unescape
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={swap} className="action-btn">
            <ArrowUpDown size={13} />
            Swap
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
              {dir === "escape" ? "Original" : "Escaped Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                dir === "escape"
                  ? `Enter text to ${TAB_LABELS[tab]} escape...`
                  : `Enter ${TAB_LABELS[tab]}-escaped text to unescape...`
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {dir === "escape" ? "Escaped Output" : "Unescaped Output"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
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
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "Base64", href: "/base64" },
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
