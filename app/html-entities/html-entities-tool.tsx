"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpDown, Trash2 } from "lucide-react";

type Mode = "encode" | "decode";

// Named entity map (char → entity)
const NAMED_ENCODE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  "¢": "&cent;",
  "£": "&pound;",
  "¥": "&yen;",
  "€": "&euro;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "½": "&frac12;",
  "¼": "&frac14;",
  "¾": "&frac34;",
  "²": "&sup2;",
  "³": "&sup3;",
  "¹": "&sup1;",
  "…": "&hellip;",
  "—": "&mdash;",
  "–": "&ndash;",
  "\u00a0": "&nbsp;",
  "«": "&laquo;",
  "»": "&raquo;",
  "¿": "&iquest;",
  "¡": "&iexcl;",
  "§": "&sect;",
  "¶": "&para;",
  "†": "&dagger;",
  "‡": "&Dagger;",
  "•": "&bull;",
  "′": "&prime;",
  "″": "&Prime;",
  "‰": "&permil;",
  "←": "&larr;",
  "→": "&rarr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "↔": "&harr;",
  "∞": "&infin;",
  "√": "&radic;",
  "∑": "&sum;",
  "∏": "&prod;",
  "≠": "&ne;",
  "≤": "&le;",
  "≥": "&ge;",
  "α": "&alpha;",
  "β": "&beta;",
  "γ": "&gamma;",
  "δ": "&delta;",
  "ε": "&epsilon;",
  "π": "&pi;",
  "σ": "&sigma;",
  "Ω": "&Omega;",
};

// Reverse map (entity → char)
const NAMED_DECODE: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENCODE).map(([k, v]) => [v, k])
);

function encodeEntities(input: string): string {
  return Array.from(input)
    .map((ch) => {
      if (NAMED_ENCODE[ch]) return NAMED_ENCODE[ch];
      const code = ch.codePointAt(0)!;
      // Encode non-ASCII and control chars as numeric
      if (code > 127 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
        return `&#${code};`;
      }
      return ch;
    })
    .join("");
}

function decodeEntities(input: string): string {
  // Replace named entities
  let result = input.replace(/&[a-zA-Z]+;/g, (match) => NAMED_DECODE[match] ?? match);
  // Replace decimal numeric entities &#123;
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCodePoint(parseInt(code, 10))
  );
  // Replace hex numeric entities &#x1F;
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  return result;
}

export function HtmlEntitiesTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = (() => {
    if (!input) return "";
    try {
      return mode === "encode" ? encodeEntities(input) : decodeEntities(input);
    } catch {
      return "⚠ Error processing input";
    }
  })();

  const swap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
  };

  return (
    <ToolLayout
      title="HTML Entities Encoder / Decoder"
      description="Encode special characters to HTML entities and decode them back to text"
    >
      <div className="flex items-center gap-2 mb-4">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
          >
            {m}
          </button>
        ))}
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
              {mode === "encode" ? "Plain Text Input" : "HTML Entities Input"}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? 'Enter text with special chars like <div class="foo"> ...'
                  : "Paste HTML entities like &lt;div&gt; &amp; &copy; ..."
              }
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "encode" ? "HTML Entities Output" : "Decoded Text"}
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

      {/* Quick reference */}
      <div className="mt-6">
        <div className="pane-label">
          Common Entities
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["&", "&amp;"],
            ["<", "&lt;"],
            [">", "&gt;"],
            ['"', "&quot;"],
            ["'", "&apos;"],
            ["©", "&copy;"],
            ["®", "&reg;"],
            ["™", "&trade;"],
            ["€", "&euro;"],
            ["£", "&pound;"],
            ["°", "&deg;"],
            [" ", "&nbsp;"],
          ].map(([char, entity]) => (
            <div
              key={entity}
              className="flex items-center gap-1.5 bg-card-bg border border-card-border rounded px-2.5 py-1.5 text-xs font-mono cursor-pointer hover:border-border-strong transition-colors"
              onClick={() =>
                setInput((prev) =>
                  prev + (mode === "encode" ? char : entity)
                )
              }
              title={`Click to insert ${mode === "encode" ? char : entity}`}
            >
              <span className="text-text-primary">{char === " " ? "·" : char}</span>
              <span className="text-text-dimmed">→</span>
              <span className="text-[#4ade80]">{entity}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "Base64", href: "/base64" },
            { name: "Escape / Unescape", href: "/escape" },
            { name: "HTML to Markdown", href: "/html-to-markdown" },
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
