"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

// Basic unicode transliteration map for common chars
const TRANSLITERATE: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ð: "d", ñ: "n",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
  ù: "u", ú: "u", û: "u", ü: "u",
  ý: "y", þ: "th", ß: "ss",
  // Korean/CJK — just strip (can't reliably romanize inline)
};

function transliterate(str: string): string {
  return str
    .split("")
    .map((c) => TRANSLITERATE[c.toLowerCase()] ?? c)
    .join("");
}

function toSlug(
  text: string,
  sep: string,
  lowercase: boolean,
  trim: boolean,
  maxLen: number
): string {
  let s = transliterate(text);
  if (lowercase) s = s.toLowerCase();
  // Replace non-alphanumeric with separator
  s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  // Remove leading/trailing separators
  if (trim) s = s.replace(new RegExp(`^[${sep}]+|[${sep}]+$`, "g"), "");
  // Collapse multiple separators
  s = s.replace(new RegExp(`[${sep}]{2,}`, "g"), sep);
  // Max length (trim at separator boundary if possible)
  if (maxLen > 0 && s.length > maxLen) {
    s = s.slice(0, maxLen);
    // Remove trailing separator
    s = s.replace(new RegExp(`[${sep}]+$`), "");
  }
  return s;
}

function toVarName(slug: string, sep: string): string {
  // Convert slug to camelCase variable name
  const parts = slug.split(sep).filter(Boolean);
  if (parts.length === 0) return "";
  return (
    parts[0] +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

interface OutputRowProps {
  label: string;
  value: string;
}

function OutputRow({ label, value }: OutputRowProps) {
  return (
    <div className="flex items-center gap-3 bg-output-bg border border-border-subtle rounded-lg px-4 py-3">
      <span className="text-xs font-mono text-text-dimmed uppercase tracking-wider w-28 flex-shrink-0">
        {label}
      </span>
      <span className="font-mono text-[13px] text-text-primary flex-1 break-all">
        {value || <span className="text-text-ghost">—</span>}
      </span>
      {value && <CopyButton text={value} />}
    </div>
  );
}

export function SlugTool() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState<"-" | "_">("-");
  const [lowercase, setLowercase] = useState(true);
  const [trim, setTrim] = useState(true);
  const [maxLen, setMaxLen] = useState(80);

  const slug = input ? toSlug(input, sep, lowercase, trim, maxLen) : "";
  const filenameSafe = slug ? slug.replace(/-/g, sep === "-" ? "-" : "_") : "";
  const varName = slug ? toVarName(slug, sep) : "";

  return (
    <ToolLayout
      title="Slug Generator"
      description="Convert text to URL-safe slugs, filename-safe strings, and variable names"
    >
      {/* Input */}
      <div className="mb-6">
        <div className="pane-label">
          Input Text
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello World! My Blog Post Title..."
            className="tool-textarea flex-1 text-sm"
            style={{ height: "44px", padding: "10px 14px", resize: "none" }}
            spellCheck={false}
          />
          <button onClick={() => setInput("")} className="action-btn flex-shrink-0">
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-output-bg border border-border-subtle rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Separator</span>
          {(["-", "_"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSep(s)}
              className={`tab-btn font-mono ${sep === s ? "active" : ""}`}
            >
              {s === "-" ? "Hyphen (-)" : "Underscore (_)"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-sm text-text-secondary">Lowercase</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trim}
            onChange={(e) => setTrim(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-sm text-text-secondary">Trim separators</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider whitespace-nowrap">
            Max length
          </span>
          <input
            type="number"
            value={maxLen}
            onChange={(e) => setMaxLen(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            max={500}
            className="tool-textarea text-center text-sm font-mono"
            style={{ width: "72px", height: "34px", padding: "6px 8px", resize: "none" }}
          />
          <span className="text-xs text-text-muted">(0 = no limit)</span>
        </div>
      </div>

      {/* Outputs */}
      <div className="flex flex-col gap-3">
        <OutputRow label="URL Slug" value={slug} />
        <OutputRow label="Filename" value={filenameSafe} />
        <OutputRow label="Variable" value={varName} />
      </div>

      {slug && (
        <p className="text-xs text-text-muted font-mono mt-3 text-right">
          {slug.length} characters
        </p>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Case Converter", href: "/case-converter" },
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "Lorem Ipsum", href: "/lorem-ipsum-generator" },
            { name: "Word Counter", href: "/character-counter" },
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
