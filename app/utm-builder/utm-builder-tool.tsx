"use client";

import { useEffect, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton, copyToClipboard } from "@/components/copy-button";
import { Link2, Check } from "lucide-react";

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

const PRESETS: { name: string; values: Record<string, string> }[] = [
  {
    name: "Email newsletter",
    values: { utm_source: "newsletter", utm_medium: "email", utm_campaign: "", utm_term: "", utm_content: "cta_button" },
  },
  {
    name: "Social post",
    values: { utm_source: "linkedin", utm_medium: "social", utm_campaign: "", utm_term: "", utm_content: "" },
  },
  {
    name: "Paid search",
    values: { utm_source: "google", utm_medium: "cpc", utm_campaign: "", utm_term: "", utm_content: "" },
  },
  {
    name: "QR / offline",
    values: { utm_source: "qr", utm_medium: "offline", utm_campaign: "", utm_term: "", utm_content: "flyer" },
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
  if (!base.trim()) return "";
  try {
    const url = new URL(base.trim().startsWith("http") ? base.trim() : `https://${base.trim()}`);
    for (const [key, val] of Object.entries(params)) {
      if (val.trim()) url.searchParams.set(key, val.trim());
    }
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeValue(v: string): string {
  return v.toLowerCase().replace(/\s+/g, "_");
}

interface ToolState {
  websiteUrl: string;
  values: Record<string, string>;
}

function readStateFromUrl(): ToolState {
  const fallback: ToolState = {
    websiteUrl: "",
    values: { utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
  };
  if (typeof window === "undefined") return fallback;
  try {
    const q = new URLSearchParams(window.location.search);
    const values: Record<string, string> = { ...fallback.values };
    for (const { param } of UTM_PARAMS) {
      const v = q.get(param);
      if (v !== null) values[param] = v;
    }
    return { websiteUrl: q.get("url") ?? "", values };
  } catch {
    return fallback;
  }
}

function stateToQuery(state: ToolState): string {
  const q = new URLSearchParams();
  if (state.websiteUrl.trim()) q.set("url", state.websiteUrl.trim());
  for (const { param } of UTM_PARAMS) {
    const v = state.values[param]?.trim();
    if (v) q.set(param, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function findIssues(values: Record<string, string>): string[] {
  const issues: string[] = [];
  const filled = UTM_PARAMS.filter(({ param }) => values[param]?.trim());
  if (filled.some(({ param }) => /[A-Z]/.test(values[param]))) {
    issues.push("Uppercase letters detected — GA4 treats “Email” and “email” as different values. Normalize to lowercase.");
  }
  if (filled.some(({ param }) => /\s/.test(values[param]))) {
    issues.push("Spaces detected — they get URL-encoded and fragment your reports. Use underscores instead.");
  }
  const missing = UTM_PARAMS.filter(({ param, required }) => required && !values[param]?.trim()).map(({ param }) => param);
  if (missing.length > 0 && filled.length > 0) {
    issues.push(`Missing recommended fields: ${missing.join(", ")}.`);
  }
  return issues;
}

function HighlightedUrl({ url, base }: { url: string; base: string }) {
  const cleanBase = base.trim().startsWith("http") ? base.trim().split("?")[0] : `https://${base.trim().split("?")[0]}`;
  const queryPart = url.includes("?") ? url.split("?").slice(1).join("?") : "";
  return (
    <div className="min-h-[80px] p-3 rounded-lg bg-surface-raised border border-border-subtle font-mono text-xs text-text-primary break-all leading-relaxed">
      {url ? (
        <>
          <span className="text-text-muted">{cleanBase}</span>
          {queryPart && (
            <>
              <span className="text-text-muted">?</span>
              {queryPart.split("&").map((part, i) => {
                const idx = part.indexOf("=");
                const key = idx >= 0 ? part.slice(0, idx) : part;
                const val = idx >= 0 ? part.slice(idx + 1) : "";
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
  );
}

export function UtmBuilderTool() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [state, setState] = useState<ToolState>(readStateFromUrl);
  const [bulkInput, setBulkInput] = useState("");
  const [shared, setShared] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch { return []; }
  });

  // Keep the page URL in sync with the tool state so every build is shareable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = stateToQuery(state);
    const current = window.location.search;
    if (next !== current) {
      window.history.replaceState(null, "", `${window.location.pathname}${next}`);
    }
  }, [state]);

  const setValue = (param: string, val: string) =>
    setState((prev) => ({ ...prev, values: { ...prev.values, [param]: val } }));

  const applyPreset = (preset: (typeof PRESETS)[number]) =>
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        ...Object.fromEntries(
          Object.entries(preset.values).map(([k, v]) => [k, k === "utm_campaign" ? prev.values[k] : v])
        ),
      },
    }));

  const normalizeAll = () =>
    setState((prev) => ({
      ...prev,
      values: Object.fromEntries(Object.entries(prev.values).map(([k, v]) => [k, normalizeValue(v)])),
    }));

  const handleShare = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    }
  };

  const generatedUrl = buildUrl(state.websiteUrl, state.values);
  const issues = findIssues(state.values);

  const recordHistory = (url: string) => {
    if (!url) return;
    const newHistory = [url, ...history.filter((h) => h !== url)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory)); } catch { /* noop */ }
  };

  const bulkUrls = bulkInput
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => ({ input: line, output: buildUrl(line, state.values) }));

  return (
    <ToolLayout
      title="UTM Builder"
      description="Build campaign tracking URLs with UTM parameters for Google Analytics, GA4, and any analytics platform. Every build gets a shareable link."
    >
      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-surface-subtle border border-border-subtle w-fit">
        {(["single", "bulk"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              mode === m
                ? "bg-surface-raised text-text-primary border border-border-subtle"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {m === "single" ? "Single URL" : "Bulk mode"}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs text-text-muted font-mono mr-1">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="text-xs font-mono px-3 py-1.5 rounded-full border border-border-subtle bg-surface-subtle text-text-secondary hover:border-accent hover:text-text-primary transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-4 font-mono uppercase tracking-wide">
              {mode === "single" ? "Campaign URL" : "URLs to tag (one per line)"}
            </h2>
            <div className="space-y-3">
              {mode === "single" ? (
                <div>
                  <label className="block text-xs text-text-muted font-mono mb-1.5">
                    Website URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={state.websiteUrl}
                    onChange={(e) => setState((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                    placeholder="https://example.com/landing-page"
                    className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              ) : (
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={"https://example.com/landing-a\nhttps://example.com/landing-b\nhttps://example.com/landing-c"}
                  rows={5}
                  className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                />
              )}
              {UTM_PARAMS.map(({ param, label, required, placeholder }) => (
                <div key={param}>
                  <label className="block text-xs text-text-muted font-mono mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={state.values[param]}
                    onChange={(e) => setValue(param, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                </div>
              ))}
              <button
                onClick={normalizeAll}
                className="text-xs font-mono text-text-muted hover:text-accent transition-colors"
              >
                ↓ normalize: lowercase + underscores
              </button>
            </div>
          </div>

          {/* Convention checks */}
          {issues.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-semibold text-amber-400 font-mono uppercase tracking-wide">GA4 naming checks</h3>
              {issues.map((issue, i) => (
                <p key={i} className="text-xs text-text-secondary leading-relaxed">⚠ {issue}</p>
              ))}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">
                {mode === "single" ? "Generated URL" : `Generated URLs (${bulkUrls.filter((b) => b.output).length})`}
              </h2>
              <div className="flex items-center gap-2">
                {mode === "single" && (
                  <button
                    onClick={handleShare}
                    disabled={!generatedUrl}
                    className="action-btn"
                    title="Copy a link to this exact build"
                  >
                    {shared ? <Check size={13} className="animate-pop-in" /> : <Link2 size={13} />}
                    <span>{shared ? "Link copied!" : "Share this build"}</span>
                  </button>
                )}
                <div onClick={() => recordHistory(generatedUrl)}>
                  <CopyButton
                    text={mode === "single" ? generatedUrl : bulkUrls.map((b) => b.output).filter(Boolean).join("\n")}
                    label={mode === "single" ? "Copy URL" : "Copy all"}
                  />
                </div>
              </div>
            </div>
            {mode === "single" ? (
              <HighlightedUrl url={generatedUrl} base={state.websiteUrl} />
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {bulkUrls.length === 0 && (
                  <p className="text-xs text-text-muted font-mono p-3">Paste URLs on the left to tag them all at once…</p>
                )}
                {bulkUrls.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-surface-raised border border-border-subtle font-mono text-[11px] break-all leading-relaxed">
                    {b.output ? (
                      <span className="text-text-secondary">{b.output}</span>
                    ) : (
                      <span className="text-red-400">Invalid URL: {b.input}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {mode === "single" && generatedUrl && (
              <p className="mt-3 text-[11px] text-text-muted font-mono">
                🔗 This build lives in the page URL — bookmark it or send it to a teammate.
              </p>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-card-bg border border-card-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Recent URLs</h2>
                <button
                  onClick={() => {
                    setHistory([]);
                    try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
                  }}
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {history.map((url, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-surface-subtle border border-border-subtle group">
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
            Every build on this page gets a shareable link, so teams can reuse the exact same tagging without copy-paste drift.
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

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Questions people usually have</h2>
        </div>
        <div className="p-5 space-y-4 text-xs text-text-secondary leading-relaxed">
          <div>
            <h3 className="text-text-primary font-semibold mb-1">What is the difference between utm_source and utm_medium?</h3>
            <p><code>utm_source</code> tells you where the click came from, like google, linkedin, or newsletter. <code>utm_medium</code> tells you the channel type, like cpc, email, social, or referral.</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Can I use UTM links in QR codes?</h3>
            <p>Yes. Add the UTM tags first, then turn the final URL into a QR code. That lets you measure scans from flyers, events, packaging, or in-store promos inside GA4.</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Should I use UTM parameters on internal links?</h3>
            <p>No. UTM tags are for external campaign links. Putting them on internal site links can overwrite the original session source and make attribution messier.</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Do I need every UTM field?</h3>
            <p>No. In practice, source, medium, and campaign are the core fields. Term and content are optional, but useful when you want to compare keywords, creatives, or button variations.</p>
          </div>
        </div>
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
