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
      title="UUID / GUID Generator"
      description="Generate UUID v4 / GUID — cryptographically random, universally unique identifiers. UUID and GUID are the same thing."
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

      {/* SEO Content */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-3">UUID v4 generator for API IDs, database keys, and trace IDs</h2>
        <p className="text-sm text-text-dimmed leading-relaxed mb-3">
          Generate random UUID v4 values instantly for backend services, database records, event streams,
          and request correlation IDs. This free UUID and GUID generator runs in your browser and supports
          bulk output for fixtures, seeds, and testing.
        </p>
        <ul className="list-disc pl-5 text-sm text-text-dimmed space-y-1">
          <li>Create unique UUID v4 identifiers for APIs and microservices</li>
          <li>Generate up to 100 UUIDs at once for load tests and mock data</li>
          <li>Copy UUIDs instantly in lowercase or uppercase format</li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Is UUID the same as GUID?",
              a: "Yes. UUID and GUID describe the same identifier format. GUID is commonly used in Microsoft ecosystems, while UUID is the standards-based term.",
            },
            {
              q: "What kind of UUID does this tool generate?",
              a: "It generates UUID v4, a randomly generated 128-bit identifier that is widely used for IDs in modern applications.",
            },
            {
              q: "Can I use these UUIDs in production systems?",
              a: "Yes. UUID v4 is suitable for most production use cases where globally unique IDs are needed, including API resources, database primary keys, and event IDs.",
            },
            {
              q: "Are my UUIDs sent to a server?",
              a: "No. UUIDs are generated locally in your browser using built-in Web APIs, so nothing is uploaded.",
            },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <p className="text-xs text-text-muted mb-3">
          Building APIs or tokens? Jump into nearby ID, JWT, and random-value generators.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JWT Decoder", href: "/jwt-decoder" },
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "Password Generator", href: "/password-generator" },
            { name: "Unix Timestamp Converter", href: "/unix-timestamp-converter" },
            { name: "GUID Generator", href: "/guid-generator" },
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
