"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const UTM_PARAMS = [
  {
    param: "utm_source",
    label: "Campaign Source",
    required: true,
    placeholder: "e.g. google, newsletter, twitter",
    description: "Identifies which site sent the traffic (e.g. google, newsletter)",
  },
  {
    param: "utm_medium",
    label: "Campaign Medium",
    required: true,
    placeholder: "e.g. cpc, email, social",
    description: "Identifies the marketing medium (e.g. cpc, email, banner)",
  },
  {
    param: "utm_campaign",
    label: "Campaign Name",
    required: true,
    placeholder: "e.g. spring_sale, product_launch",
    description: "Identifies the specific campaign or promotion",
  },
  {
    param: "utm_term",
    label: "Campaign Term",
    required: false,
    placeholder: "e.g. running+shoes (optional)",
    description: "Identifies paid search keywords (used for paid search)",
  },
  {
    param: "utm_content",
    label: "Campaign Content",
    required: false,
    placeholder: "e.g. logolink, textlink (optional)",
    description: "Differentiates ads or links that point to the same URL",
  },
];

const HISTORY_KEY = "utm-builder-history";
const MAX_HISTORY = 10;

const UTM_EXAMPLES = [
  {
    channel: "Email newsletter",
    example: "utm_source=newsletter&utm_medium=email&utm_campaign=product_launch&utm_content=cta_button",
    note: "Use utm_content to compare button vs text link performance in the same email.",
  },
  {
    channel: "Social post",
    example: "utm_source=linkedin&utm_medium=social&utm_campaign=q2_webinar",
    note: "Keep source/medium naming consistent across all social channels for cleaner GA4 reports.",
  },
  {
    channel: "Paid ads",
    example: "utm_source=google&utm_medium=cpc&utm_campaign=brand_search&utm_term=crm+software",
    note: "Use utm_term for keyword-level analysis and align campaign names with ad platform naming.",
  },
];

function buildUrl(base: string, params: Record<string, string>): string {
  if (!base) return "";
  try {
    const url = new URL(base.startsWith("http") ? base : `https://${base}`);
    for (const [key, val] of Object.entries(params)) {
      if (val.trim()) url.searchParams.set(key, val.trim());
    }
    return url.toString();
  } catch {
    return "";
  }
}

export function UtmBuilderTool() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [values, setValues] = useState<Record<string, string>>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch { return []; }
  });

  const generatedUrl = buildUrl(websiteUrl, values);

  const handleCopy = () => {
    if (generatedUrl) {
      const newHistory = [generatedUrl, ...history.filter((h) => h !== generatedUrl)].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const setValue = (param: string, val: string) => {
    setValues((prev) => ({ ...prev, [param]: val }));
  };

  return (
    <ToolLayout
      title="UTM Builder"
      description="Build campaign tracking URLs with UTM parameters for Google Analytics, GA4, and any analytics platform."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-4 font-mono uppercase tracking-wide">Campaign URL</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-text-muted font-mono mb-1.5">
                  Website URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com/landing-page"
                  className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              </div>
              {UTM_PARAMS.map(({ param, label, required, placeholder }) => (
                <div key={param}>
                  <label className="block text-xs text-text-muted font-mono mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={values[param]}
                    onChange={(e) => setValue(param, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          {/* Generated URL */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Generated URL</h2>
              <div onClick={handleCopy}>
                <CopyButton text={generatedUrl} label="Copy URL" />
              </div>
            </div>
            <div className="min-h-[80px] p-3 rounded-lg bg-surface-raised border border-border-subtle font-mono text-xs text-text-primary break-all leading-relaxed">
              {generatedUrl ? (
                <>
                  <span className="text-text-muted">{websiteUrl.startsWith("http") ? websiteUrl.split("?")[0] : `https://${websiteUrl.split("?")[0]}`}</span>
                  {generatedUrl.includes("?") && (
                    <>
                      <span className="text-text-muted">?</span>
                      {generatedUrl
                        .split("?")[1]
                        .split("&")
                        .map((part, i) => {
                          const [key, val] = part.split("=");
                          return (
                            <span key={i}>
                              {i > 0 && <span className="text-text-muted">&amp;</span>}
                              <span className="text-accent">{key}</span>
                              <span className="text-text-muted">=</span>
                              <span className="text-green-400">{val}</span>
                            </span>
                          );
                        })}
                    </>
                  )}
                </>
              ) : (
                <span className="text-text-muted">Fill in the fields above to generate your tracking URL…</span>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-card-bg border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Recent URLs</h2>
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem(HISTORY_KEY);
                  }}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {history.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-surface-subtle border border-border-subtle group"
                  >
                    <span className="font-mono text-[11px] text-text-secondary break-all flex-1 leading-relaxed">{url}</span>
                    <CopyButton text={url} label="Copy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parameter Reference Table */}
      <div className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">UTM Parameter Reference</h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {UTM_PARAMS.map(({ param, label, required, description }) => (
            <div key={param} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="shrink-0 sm:w-40">
                <code className="text-xs font-mono text-accent bg-surface-subtle border border-border-subtle rounded px-1.5 py-0.5">{param}</code>
                {!required && <span className="ml-1.5 text-[10px] text-text-muted">optional</span>}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-text-secondary">{label}</span>
                <span className="text-xs text-text-muted ml-2">— {description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <section className="mt-8 pt-6 border-t border-border-subtle space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary">What is a UTM parameter?</h2>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            UTM parameters are tracking tags added to a URL (for example <code>utm_source</code>, <code>utm_medium</code>, and <code>utm_campaign</code>).
            They help you see exactly where clicks and conversions come from in Google Analytics (GA4) and other attribution tools.
          </p>
          <p>
            If you run campaigns across email, social, paid ads, or partnerships, a UTM builder keeps your naming consistent so traffic data does not get fragmented.
          </p>
        </div>
      </section>

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">When to use UTM links</h2>
        </div>
        <div className="p-5 space-y-3 text-xs text-text-secondary leading-relaxed">
          <p><strong className="text-text-primary">Email marketing:</strong> measure which newsletter, sequence, or CTA drives signups and revenue.</p>
          <p><strong className="text-text-primary">Social posts:</strong> compare traffic from LinkedIn, X, Instagram, and creator partnerships.</p>
          <p><strong className="text-text-primary">Paid campaigns:</strong> unify attribution across Google Ads, Meta Ads, and other ad platforms.</p>
          <p><strong className="text-text-primary">QR campaigns:</strong> append UTM tags before creating a QR code so offline scans are attributable online.</p>
        </div>
      </section>

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">UTM examples by channel</h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {UTM_EXAMPLES.map((item) => (
            <div key={item.channel} className="px-5 py-3 space-y-1.5">
              <p className="text-xs font-semibold text-text-secondary">{item.channel}</p>
              <code className="block text-[11px] font-mono text-accent break-all">{item.example}</code>
              <p className="text-xs text-text-muted">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Common UTM mistakes to avoid</h2>
        </div>
        <ul className="p-5 space-y-2 text-xs text-text-secondary list-disc list-inside leading-relaxed">
          <li><strong className="text-text-primary">Inconsistent naming:</strong> <code>Facebook</code> vs <code>facebook</code> creates split reports.</li>
          <li><strong className="text-text-primary">Using UTM tags on internal links:</strong> this can overwrite original attribution sessions.</li>
          <li><strong className="text-text-primary">Missing required fields:</strong> always set source, medium, and campaign for useful reporting.</li>
          <li><strong className="text-text-primary">Not encoding messy URLs:</strong> use the <a href="/url-encoder" className="text-accent hover:underline">URL Encoder</a> when values include spaces or special characters.</li>
        </ul>
      </section>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "Meta Tags Generator", href: "/meta-tags" },
            { name: "Open Graph Preview", href: "/og-preview" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-surface-subtle">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
