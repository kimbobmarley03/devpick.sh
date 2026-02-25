"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

interface OgData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

function parseOgTags(html: string): OgData {
  const get = (prop: string): string | undefined => {
    const r = new RegExp(`(?:property|name)=["']${prop}["']\\s+content=["']([^"']*?)["']`, "i");
    const r2 = new RegExp(`content=["']([^"']*?)["']\\s+(?:property|name)=["']${prop}["']`, "i");
    return r.exec(html)?.[1] || r2.exec(html)?.[1];
  };
  return {
    title: get("og:title") || /<title>(.*?)<\/title>/i.exec(html)?.[1],
    description: get("og:description") || get("description"),
    image: get("og:image"),
    url: get("og:url"),
    siteName: get("og:site_name"),
    type: get("og:type"),
    twitterCard: get("twitter:card"),
    twitterTitle: get("twitter:title"),
    twitterDescription: get("twitter:description"),
    twitterImage: get("twitter:image"),
  };
}

function PreviewCard({ platform, og }: { platform: string; og: OgData }) {
  const title = platform === "twitter" ? (og.twitterTitle || og.title) : og.title;
  const desc = platform === "twitter" ? (og.twitterDescription || og.description) : og.description;
  const img = platform === "twitter" ? (og.twitterImage || og.image) : og.image;
  const domain = og.url ? new URL(og.url).hostname : "example.com";

  if (platform === "twitter") {
    return (
      <div className="border border-[var(--dp-border)] rounded-xl overflow-hidden max-w-[500px]">
        {img && <div className="w-full h-[250px] bg-[var(--dp-bg-subtle)] flex items-center justify-center text-text-dimmed text-xs overflow-hidden">
          <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>}
        <div className="p-3">
          <div className="text-xs text-text-dimmed">{domain}</div>
          <div className="text-sm font-semibold text-text-primary mt-0.5 line-clamp-1">{title || "Page Title"}</div>
          <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{desc || "Page description will appear here."}</div>
        </div>
      </div>
    );
  }

  // Facebook/LinkedIn style
  return (
    <div className="border border-[var(--dp-border)] rounded overflow-hidden max-w-[500px]">
      {img && <div className="w-full h-[260px] bg-[var(--dp-bg-subtle)] flex items-center justify-center text-text-dimmed text-xs overflow-hidden">
        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>}
      <div className="p-3 bg-[var(--dp-bg-subtle)]">
        <div className="text-xs text-text-dimmed uppercase tracking-wide">{domain}</div>
        <div className="text-sm font-semibold text-text-primary mt-1 line-clamp-1">{title || "Page Title"}</div>
        <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">{desc || "Page description"}</div>
      </div>
    </div>
  );
}

const SAMPLE = `<head>
  <title>My Awesome App</title>
  <meta property="og:title" content="My Awesome App — Build Faster" />
  <meta property="og:description" content="The best developer tool for building modern web apps." />
  <meta property="og:image" content="https://example.com/og-image.png" />
  <meta property="og:url" content="https://example.com" />
  <meta property="og:site_name" content="MyApp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="My Awesome App" />
  <meta name="twitter:description" content="Build faster with MyApp." />
</head>`;

export function OgPreviewTool() {
  const [input, setInput] = useState(SAMPLE);
  const og = parseOgTags(input);
  const missing: string[] = [];
  if (!og.title) missing.push("og:title");
  if (!og.description) missing.push("og:description");
  if (!og.image) missing.push("og:image");
  if (!og.url) missing.push("og:url");
  if (!og.twitterCard) missing.push("twitter:card");

  return (
    <ToolLayout title="Open Graph Preview" description="Preview how your page looks when shared on social media">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="pane-label">Paste your HTML &lt;head&gt; content</span>
            <div className="flex gap-2">
              <button onClick={() => setInput("")} className="action-btn"><Trash2 size={13} />Clear</button>
              <CopyButton text={input} />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="tool-textarea min-h-[300px]"
            spellCheck={false}
            placeholder='<meta property="og:title" content="..." />'
          />
          {/* Warnings */}
          {missing.length > 0 && (
            <div className="bg-[var(--dp-bg-subtle)] border border-[var(--dp-border)] rounded-lg p-3">
              <div className="text-xs font-semibold text-[var(--dp-warning,#f59e0b)] mb-1">⚠️ Missing tags:</div>
              <ul className="text-xs text-text-secondary space-y-0.5">
                {missing.map((m) => <li key={m}>• <code className="text-text-primary">{m}</code></li>)}
              </ul>
            </div>
          )}
          {/* Parsed values */}
          <div className="bg-[var(--dp-bg-subtle)] border border-[var(--dp-border)] rounded-lg p-3 text-xs space-y-1">
            <div className="font-semibold text-text-secondary mb-2">Parsed Tags</div>
            {Object.entries(og).filter(([,v]) => v).map(([k, v]) => (
              <div key={k} className="flex gap-2"><span className="text-text-dimmed w-32 shrink-0">{k}:</span><span className="text-text-primary truncate">{v}</span></div>
            ))}
          </div>
        </div>

        {/* Previews */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="pane-label mb-2">Facebook / LinkedIn</div>
            <PreviewCard platform="facebook" og={og} />
          </div>
          <div>
            <div className="pane-label mb-2">Twitter / X</div>
            <PreviewCard platform="twitter" og={og} />
          </div>
          <div>
            <div className="pane-label mb-2">Discord</div>
            <PreviewCard platform="facebook" og={og} />
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Meta Tag Generator", href: "/meta-tags" },
            { name: "HTML Formatter", href: "/html-formatter" },
            { name: "JSON-LD Validator", href: "/json-formatter" },
            { name: "Robots.txt Generator", href: "/robots-txt" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">{t.name}</a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
