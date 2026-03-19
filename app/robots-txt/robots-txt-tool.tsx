"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2 } from "lucide-react";

interface RuleGroup {
  id: string;
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay: string;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const inputStyle = {
  background: "var(--dp-bg-output)",
  border: "1px solid var(--dp-border)",
  borderRadius: "6px",
  color: "var(--dp-text-primary)",
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: "12px",
  padding: "5px 10px",
  outline: "none",
  width: "100%",
} as React.CSSProperties;

export function RobotsTxtTool() {
  useWebMCP({
    name: "generateRobotsTxt",
    description: "Generate robots.txt content",
    inputSchema: {
      type: "object" as const,
      properties: {
      "sitemap": {
            "type": "string",
            "description": "Sitemap URL"
      },
      "disallow": {
            "type": "string",
            "description": "Paths to disallow (comma-separated)"
      }
},
      required: [],
    },
    execute: async (params) => {
      const s = params.sitemap ? `Sitemap: ${params.sitemap}\n` : ""; const d = params.disallow ? (params.disallow as string).split(",").map(p => `Disallow: ${p.trim()}`).join("\n") : "Disallow:"; return { content: [{ type: "text", text: `User-agent: *\n${d}\n\n${s}` }] };
    },
  });

  const [groups, setGroups] = useState<RuleGroup[]>([
    { id: makeId(), userAgent: "*", allow: [], disallow: ["/admin/", "/private/"], crawlDelay: "" },
  ]);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");

  const update = (id: string, patch: Partial<RuleGroup>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const addGroup = () =>
    setGroups((gs) => [
      ...gs,
      { id: makeId(), userAgent: "Googlebot", allow: [], disallow: [], crawlDelay: "" },
    ]);

  const removeGroup = (id: string) => setGroups((gs) => gs.filter((g) => g.id !== id));

  const addPath = (id: string, type: "allow" | "disallow") =>
    update(id, { [type]: [...(groups.find((g) => g.id === id)?.[type] ?? []), ""] });

  const updatePath = (id: string, type: "allow" | "disallow", idx: number, val: string) =>
    update(id, {
      [type]: (groups.find((g) => g.id === id)?.[type] ?? []).map((p, i) =>
        i === idx ? val : p
      ),
    });

  const removePath = (id: string, type: "allow" | "disallow", idx: number) =>
    update(id, {
      [type]: (groups.find((g) => g.id === id)?.[type] ?? []).filter((_, i) => i !== idx),
    });

  const output = (() => {
    const lines: string[] = [];
    for (const g of groups) {
      lines.push(`User-agent: ${g.userAgent || "*"}`);
      for (const p of g.allow) if (p.trim()) lines.push(`Allow: ${p.trim()}`);
      for (const p of g.disallow) if (p.trim()) lines.push(`Disallow: ${p.trim()}`);
      if (g.crawlDelay.trim()) lines.push(`Crawl-delay: ${g.crawlDelay.trim()}`);
      lines.push("");
    }
    if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`);
    return lines.join("\n").trim();
  })();

  return (
    <ToolLayout agentReady
      title="Robots.txt Generator"
      description="Generate a robots.txt file with user agents, allow/disallow rules, crawl delay, and sitemap"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Panel */}
        <div className="flex flex-col gap-4">
          {groups.map((group, gi) => (
            <div
              key={group.id}
              className="rounded-lg border p-4"
              style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--dp-text-dimmed)" }}>
                  Rule Group {gi + 1}
                </span>
                {groups.length > 1 && (
                  <button onClick={() => removeGroup(group.id)} className="action-btn" style={{ color: "var(--dp-error)" }}>
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>

              {/* User Agent */}
              <div className="mb-3">
                <div className="pane-label">User Agent</div>
                <input
                  type="text"
                  value={group.userAgent}
                  onChange={(e) => update(group.id, { userAgent: e.target.value })}
                  placeholder="*"
                  style={inputStyle}
                />
              </div>

              {/* Disallow Paths */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="pane-label" style={{ marginBottom: 0 }}>Disallow Paths</div>
                  <button onClick={() => addPath(group.id, "disallow")} className="action-btn" style={{ padding: "4px 8px", fontSize: "11px" }}>
                    <Plus size={11} />
                    Add
                  </button>
                </div>
                {group.disallow.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => updatePath(group.id, "disallow", i, e.target.value)}
                      placeholder="/private/"
                      style={{ ...inputStyle, width: undefined, flex: 1 }}
                    />
                    <button onClick={() => removePath(group.id, "disallow", i)} className="action-btn" style={{ padding: "4px 8px" }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
                {group.disallow.length === 0 && (
                  <p className="text-xs font-mono mt-1" style={{ color: "var(--dp-text-ghost)" }}>No rules — click Add</p>
                )}
              </div>

              {/* Allow Paths */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="pane-label" style={{ marginBottom: 0 }}>Allow Paths</div>
                  <button onClick={() => addPath(group.id, "allow")} className="action-btn" style={{ padding: "4px 8px", fontSize: "11px" }}>
                    <Plus size={11} />
                    Add
                  </button>
                </div>
                {group.allow.map((p, i) => (
                  <div key={i} className="flex items-center gap-1 mt-1">
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => updatePath(group.id, "allow", i, e.target.value)}
                      placeholder="/public/"
                      style={{ ...inputStyle, width: undefined, flex: 1 }}
                    />
                    <button onClick={() => removePath(group.id, "allow", i)} className="action-btn" style={{ padding: "4px 8px" }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
                {group.allow.length === 0 && (
                  <p className="text-xs font-mono mt-1" style={{ color: "var(--dp-text-ghost)" }}>No rules — click Add</p>
                )}
              </div>

              {/* Crawl Delay */}
              <div>
                <div className="pane-label">Crawl Delay (seconds)</div>
                <input
                  type="number"
                  min="0"
                  value={group.crawlDelay}
                  onChange={(e) => update(group.id, { crawlDelay: e.target.value })}
                  placeholder="10"
                  style={{ ...inputStyle, width: "120px" }}
                />
              </div>
            </div>
          ))}

          <button onClick={addGroup} className="action-btn self-start">
            <Plus size={13} />
            Add Rule Group
          </button>

          {/* Sitemap */}
          <div
            className="rounded-lg border p-4"
            style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}
          >
            <div className="pane-label">Sitemap URL</div>
            <input
              type="url"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="pane-label">Generated robots.txt</div>
            <CopyButton text={output} />
          </div>
          <div className="output-panel" style={{ minHeight: "400px" }}>
            <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dp-text-primary)" }}>
              {output || <span style={{ color: "var(--dp-text-ghost)" }}>Output will appear here...</span>}
            </pre>
          </div>
        </div>
      </div>
      {/* SEO Content */}
      <section className="mt-8 pt-6 border-t border-border-subtle space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary">How to use this robots.txt generator</h2>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            A <code>robots.txt</code> file tells search engine crawlers which paths they can or cannot crawl.
            Use this generator to create valid rules for <code>User-agent</code>, <code>Allow</code>, <code>Disallow</code>,
            optional <code>Crawl-delay</code>, and your sitemap URL.
          </p>
          <p>
            Start with one group for <code>*</code>, then add bot-specific groups only when needed.
            Keep rules minimal and test them in Google Search Console before deploying.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-lg border p-5" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Robots.txt examples</h2>
        <div className="space-y-4 text-xs leading-relaxed" style={{ color: "var(--dp-text-secondary)" }}>
          <div>
            <p className="font-semibold" style={{ color: "var(--dp-text-primary)" }}>Block admin pages, allow everything else</p>
            <pre className="mt-1 p-3 rounded text-[11px] overflow-x-auto" style={{ background: "var(--dp-bg-output)", color: "var(--dp-text-primary)" }}>{`User-agent: *\nDisallow: /admin/\nDisallow: /private/\n\nSitemap: https://example.com/sitemap.xml`}</pre>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--dp-text-primary)" }}>Allow one folder for Googlebot while blocking others</p>
            <pre className="mt-1 p-3 rounded text-[11px] overflow-x-auto" style={{ background: "var(--dp-bg-output)", color: "var(--dp-text-primary)" }}>{`User-agent: Googlebot\nAllow: /blog/\nDisallow: /\n\nUser-agent: *\nDisallow:`}</pre>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border p-5" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Common robots.txt mistakes</h2>
        <ul className="space-y-2 text-xs list-disc list-inside" style={{ color: "var(--dp-text-secondary)" }}>
          <li><strong style={{ color: "var(--dp-text-primary)" }}>Blocking important pages by accident:</strong> double-check <code>Disallow: /</code> rules before publish.</li>
          <li><strong style={{ color: "var(--dp-text-primary)" }}>Using robots.txt to hide sensitive content:</strong> robots.txt is public, so it is not a security control.</li>
          <li><strong style={{ color: "var(--dp-text-primary)" }}>Forgetting sitemap links:</strong> add a sitemap so crawlers discover new pages faster.</li>
          <li><strong style={{ color: "var(--dp-text-primary)" }}>Confusing crawl vs index:</strong> if you need de-indexing, use <a href="/meta-tags" className="text-accent hover:underline">meta robots</a> or headers too.</li>
        </ul>
      </section>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Meta Tag Generator", href: "/meta-tags" },
            { name: "HTTP Status Checker", href: "/http-status" },
            { name: "XML Formatter", href: "/xml-formatter" },
            { name: "URL Encoder", href: "/url-encoder" },
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
