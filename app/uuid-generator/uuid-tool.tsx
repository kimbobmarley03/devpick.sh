"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton, copyToClipboard } from "@/components/copy-button";
import { RefreshCw, Plus } from "lucide-react";

function generateUUID(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

export function UuidTool() {
  useWebMCP({
    name: "generateUUID",
    description: "Generate a random UUID v4",
    inputSchema: {
      type: "object" as const,
      properties: {
      "count": {
            "type": "number",
            "description": "Number of UUIDs to generate (default 1)"
      }
},
      required: [],
    },
    execute: async (params) => {
      const n = Math.min((params.count as number) || 1, 100); const uuids = Array.from({ length: n }, () => crypto.randomUUID()); return { content: [{ type: "text", text: uuids.join("\n") }] };
    },
  });

  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [count, setCount] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [autoCopied, setAutoCopied] = useState(false);

  const fmt = (id: string) => (uppercase ? id.toUpperCase() : id);

  const regenerate = async () => {
    const id = generateUUID();
    const formatted = uppercase ? id.toUpperCase() : id;
    setUuids([id]);
    // Auto-copy single UUID on generate
    await copyToClipboard(formatted);
    setAutoCopied(true);
    setTimeout(() => setAutoCopied(false), 1500);
  };

  const generateBulk = () => {
    const list = Array.from({ length: Math.min(Math.max(count, 1), 100) }, () =>
      generateUUID()
    );
    setUuids(list);
  };

  // Ctrl+Enter = regenerate, Ctrl+Shift+Enter = bulk
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
  }, [uppercase, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const allText = uuids.map(fmt).join("\n");

  return (
    <ToolLayout
      agentReady
      title="UUID Generator"
      description="Generate UUID v4 — cryptographically random, universally unique identifiers"
      kbdHint="⌘↵ generate · ⌘⇧↵ bulk"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={regenerate} className="action-btn primary">
          <RefreshCw size={13} />
          Generate
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

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-sm text-text-secondary">Uppercase</span>
        </label>

        <div className="ml-auto">
          <CopyButton
            text={allText}
            label={uuids.length > 1 ? `Copy All (${uuids.length})` : "Copy"}
          />
        </div>
      </div>

      {/* UUID list */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden animate-fade-in">
        {uuids.map((id, i) => (
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
        {uuids.length} UUID{uuids.length !== 1 ? "s" : ""} · v4 (random)
      </p>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "Password Generator", href: "/password-generator" },
            { name: "Timestamp", href: "/unix-timestamp-converter" },
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
