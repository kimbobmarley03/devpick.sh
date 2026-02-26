"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton, copyToClipboard } from "@/components/copy-button";
import { RefreshCw, Plus } from "lucide-react";

function generateGUID(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

type GuidFormat = "lowercase" | "uppercase" | "no-hyphens" | "braces" | "csharp";

function formatGUID(guid: string, fmt: GuidFormat): string {
  switch (fmt) {
    case "lowercase": return guid;
    case "uppercase": return guid.toUpperCase();
    case "no-hyphens": return guid.replace(/-/g, "");
    case "braces": return `{${guid.toUpperCase()}}`;
    case "csharp": return `new Guid("${guid}")`;
    default: return guid;
  }
}

const FORMAT_OPTIONS: { value: GuidFormat; label: string; example: string }[] = [
  { value: "lowercase", label: "Lowercase (default)", example: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" },
  { value: "uppercase", label: "UPPERCASE", example: "XXXXXXXX-XXXX-4XXX-YXXX-XXXXXXXXXXXX" },
  { value: "no-hyphens", label: "No Hyphens", example: "xxxxxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx" },
  { value: "braces", label: "Braces {}", example: "{XXXXXXXX-XXXX-4XXX-YXXX-XXXXXXXXXXXX}" },
  { value: "csharp", label: "C# Guid", example: 'new Guid("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")' },
];

export function GuidTool() {
  useWebMCP({
    name: "generateGUID",
    description: "Generate a random GUID (UUID v4)",
    inputSchema: {
      type: "object" as const,
      properties: {
        count: { type: "number", description: "Number of GUIDs to generate (default 1, max 100)" },
        format: { type: "string", description: "Format: lowercase, uppercase, no-hyphens, braces, csharp" },
      },
      required: [],
    },
    execute: async (params) => {
      const n = Math.min((params.count as number) || 1, 100);
      const fmt = (params.format as GuidFormat) || "lowercase";
      const guids = Array.from({ length: n }, () => formatGUID(generateGUID(), fmt));
      return { content: [{ type: "text", text: guids.join("\n") }] };
    },
  });

  const [guids, setGuids] = useState<string[]>([generateGUID()]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<GuidFormat>("lowercase");
  const [autoCopied, setAutoCopied] = useState(false);

  const fmt = (id: string) => formatGUID(id, format);

  const regenerate = async () => {
    const id = generateGUID();
    setGuids([id]);
    await copyToClipboard(fmt(id));
    setAutoCopied(true);
    setTimeout(() => setAutoCopied(false), 1500);
  };

  const generateBulk = () => {
    const list = Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => generateGUID());
    setGuids(list);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) generateBulk();
        else void regenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [format, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const allText = guids.map(fmt).join("\n");

  return (
    <ToolLayout
      agentReady
      title="GUID Generator"
      description="Generate GUIDs (Globally Unique Identifiers) — UUID v4, cryptographically random. Used in .NET, SQL Server, Azure, and Windows applications."
      kbdHint="⌘↵ generate · ⌘⇧↵ bulk"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={regenerate} className="action-btn primary">
          <RefreshCw size={13} />
          Generate GUID
          {autoCopied && (
            <span className="ml-1 text-[10px] text-success animate-fade-in">· copied!</span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className="tool-textarea text-center"
            style={{ width: "70px", height: "34px", padding: "6px 8px", resize: "none" }}
          />
          <button onClick={generateBulk} className="action-btn">
            <Plus size={13} />
            Bulk Generate
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as GuidFormat)}
            className="px-2 py-1.5 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none"
          >
            {FORMAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <CopyButton
            text={allText}
            label={guids.length > 1 ? `Copy All (${guids.length})` : "Copy"}
          />
        </div>
      </div>

      {/* GUID list */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden animate-fade-in">
        {guids.map((id, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors group"
          >
            <span className="font-mono text-sm text-text-primary">{fmt(id)}</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={fmt(id)} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-3 text-right font-mono">
        {guids.length} GUID{guids.length !== 1 ? "s" : ""} · v4 (random)
      </p>

      {/* What is a GUID section */}
      <div className="mt-6 p-4 rounded-xl bg-surface-subtle border border-border-subtle text-sm text-text-secondary leading-relaxed">
        <h2 className="font-semibold text-text-primary mb-2">What is a GUID?</h2>
        <p>
          A <strong>GUID</strong> (Globally Unique Identifier) is Microsoft&apos;s term for a UUID (Universally Unique Identifier).
          GUIDs are 128-bit values used to uniquely identify objects in distributed systems — databases, COM objects, Windows Registry entries, Azure resources, and .NET applications.
        </p>
        <p className="mt-2">
          All GUIDs generated here are <strong>version 4</strong> (random), using <code className="font-mono text-xs bg-[var(--dp-bg-subtle)] px-1 rounded">crypto.randomUUID()</code> from your browser&apos;s cryptographic RNG — the same algorithm used in production systems.
        </p>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "Password Generator", href: "/password-generator" },
            { name: "Slug Generator", href: "/slug-generator" },
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
