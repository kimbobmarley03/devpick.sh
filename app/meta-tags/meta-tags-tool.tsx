"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const inputStyle: React.CSSProperties = {
  background: "var(--dp-bg-output)",
  border: "1px solid var(--dp-border)",
  borderRadius: "6px",
  color: "var(--dp-text-primary)",
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontSize: "12px",
  padding: "6px 10px",
  outline: "none",
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

export function MetaTagsTool() {
  useWebMCP({
    name: "generateMetaTags",
    description: "Generate HTML meta tags for SEO",
    inputSchema: {
      type: "object" as const,
      properties: {
      "title": {
            "type": "string",
            "description": "Page title"
      },
      "description": {
            "type": "string",
            "description": "Meta description"
      }
},
      required: ["title", "description"],
    },
    execute: async (params) => {
      const t = params.title as string; const d = params.description as string; return { content: [{ type: "text", text: `<title>${t}</title>\n<meta name="description" content="${d}">\n<meta property="og:title" content="${t}">\n<meta property="og:description" content="${d}">` }] };
    },
  });

  const [title, setTitle] = useState("My Awesome Website");
  const [description, setDescription] = useState("This is a description of my website — keep it under 160 characters.");
  const [url, setUrl] = useState("https://example.com");
  const [image, setImage] = useState("https://example.com/og-image.jpg");
  const [type, setType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [author, setAuthor] = useState("");
  const [keywords, setKeywords] = useState("");
  const [siteName, setSiteName] = useState("My Website");

  const output = (() => {
    const lines: string[] = ["<!-- Primary Meta Tags -->"];
    lines.push(`<title>${title}</title>`);
    lines.push(`<meta name="title" content="${title}" />`);
    if (description) lines.push(`<meta name="description" content="${description}" />`);
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}" />`);
    if (author) lines.push(`<meta name="author" content="${author}" />`);
    lines.push("");
    lines.push("<!-- Open Graph / Facebook -->");
    lines.push(`<meta property="og:type" content="${type}" />`);
    if (url) lines.push(`<meta property="og:url" content="${url}" />`);
    lines.push(`<meta property="og:title" content="${title}" />`);
    if (description) lines.push(`<meta property="og:description" content="${description}" />`);
    if (image) lines.push(`<meta property="og:image" content="${image}" />`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${siteName}" />`);
    lines.push("");
    lines.push("<!-- Twitter -->");
    lines.push(`<meta property="twitter:card" content="${twitterCard}" />`);
    if (url) lines.push(`<meta property="twitter:url" content="${url}" />`);
    lines.push(`<meta property="twitter:title" content="${title}" />`);
    if (description) lines.push(`<meta property="twitter:description" content="${description}" />`);
    if (image) lines.push(`<meta property="twitter:image" content="${image}" />`);
    return lines.join("\n");
  })();

  const titleLen = title.length;
  const descLen = description.length;

  return (
    <ToolLayout agentReady
      title="Meta Tag Generator"
      description="Generate meta tags, Open Graph tags, and Twitter Card tags for your website"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Basic */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Basic Info</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono" style={{ color: "var(--dp-text-dimmed)" }}>Title</label>
                  <span className="text-xs font-mono" style={{ color: titleLen > 60 ? "var(--dp-error)" : "var(--dp-text-muted)" }}>
                    {titleLen}/60
                  </span>
                </div>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title (50-60 chars recommended)" style={inputStyle} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono" style={{ color: "var(--dp-text-dimmed)" }}>Description</label>
                  <span className="text-xs font-mono" style={{ color: descLen > 160 ? "var(--dp-error)" : "var(--dp-text-muted)" }}>
                    {descLen}/160
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Page description (120-160 chars recommended)"
                  className="tool-textarea"
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Canonical URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Author</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Keywords (comma separated)</label>
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="react, nextjs, typescript" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* OG / Social */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Open Graph / Social</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Site Name</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My Website" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>OG Image URL</label>
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://example.com/og.jpg (1200×630px)" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>OG Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
                    <option value="website">website</option>
                    <option value="article">article</option>
                    <option value="profile">profile</option>
                    <option value="book">book</option>
                    <option value="music.song">music.song</option>
                    <option value="video.movie">video.movie</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono block mb-1" style={{ color: "var(--dp-text-dimmed)" }}>Twitter Card</label>
                  <select value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} style={selectStyle}>
                    <option value="summary">summary</option>
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="app">app</option>
                    <option value="player">player</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Google Preview */}
          <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
            <div className="pane-label">Google Search Preview</div>
            <div className="rounded-lg p-3" style={{ background: "var(--dp-bg-output)", border: "1px solid var(--dp-border)" }}>
              <div className="text-xs font-mono mb-1 truncate" style={{ color: "var(--dp-text-muted)" }}>{url || "https://example.com"}</div>
              <div className="text-sm font-medium mb-1 truncate" style={{ color: "#1a0dab" }}>{title || "Page Title"}</div>
              <div className="text-xs leading-relaxed" style={{ color: "#545454", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {description || "Page description will appear here..."}
              </div>
            </div>
          </div>

          {/* Social Preview */}
          {image && (
            <div className="rounded-lg border p-4" style={{ background: "var(--dp-bg-card)", borderColor: "var(--dp-border)" }}>
              <div className="pane-label">Social Card Preview</div>
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--dp-border)" }}>
                <div
                  className="w-full flex items-center justify-center text-xs font-mono"
                  style={{
                    height: "120px",
                    background: "var(--dp-bg-subtle)",
                    color: "var(--dp-text-muted)",
                    backgroundImage: image ? `url(${image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!image && "OG Image (1200×630)"}
                </div>
                <div className="p-3" style={{ background: "var(--dp-bg-output)" }}>
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--dp-text-muted)" }}>{url ? (() => { try { return new URL(url).hostname; } catch { return url; } })() : "example.com"}</div>
                  <div className="text-sm font-semibold mb-1 truncate" style={{ color: "var(--dp-text-primary)" }}>{title}</div>
                  <div className="text-xs" style={{ color: "var(--dp-text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="pane-label">Generated Tags</div>
            <CopyButton text={output} />
          </div>
          <div className="output-panel" style={{ minHeight: "500px" }}>
            <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: "var(--dp-text-primary)" }}>
              {output}
            </pre>
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Robots.txt Generator", href: "/robots-txt" },
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "Slug Generator", href: "/slug-generator" },
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
