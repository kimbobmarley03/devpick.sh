"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const LINKEDIN_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNzdCNSI+PHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSDEuNzcxQy43OTIgMCAwIC43NzQgMCAxLjcyOXYyMC41NDJDMCAyMy4yMjcuNzkyIDI0IDEuNzcxIDI0aDIwLjQ1MUMyMy4yIDI0IDI0IDIzLjIyNyAyNCAyMi4yNzFWMS43MjlDMjQgLjc3NCAyMy4yIDAgMjIuMjIyIDBoLjAwM3oiLz48L3N2Zz4=`;
const TWITTER_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTE4LjkwMSAxLjE1M2gzLjY4bC04LjA0IDkuMTlMMjQgMjIuODQ2aC03LjQwNmwtNS4wMDgtNi4yNi02LjUyIDYuMjZIMy4zN2w4LjYtOS44MzFMMCAxLjE1NGg3LjU5NGw0LjUyMiA1Ljk3N3ptLTEuMjkzIDE5LjQzN2gyLjA0TDYuNDggMi41NjhINS4yOXoiLz48L3N2Zz4=`;
const EMAIL_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjIiIHk9IjQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNiIgcng9IjIiLz48cGF0aCBkPSJtMiA0IDEwIDkgMTAtOSIvPjwvc3ZnPg==`;
const PHONE_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMiAxNi45MnYzYTIgMiAwIDAgMS0yLjE4IDJBMTkuNzkgMTkuNzkgMCAwIDEgMy42MiAzLjIgMiAyIDAgMCAxIDUuNjEgMWgzYTIgMiAwIDAgMSAyIDEuNzJjLjEyOC45NzIuMzM2IDEuOTMuNjIgMi44NWEyIDIgMCAwIDEtLjQ1IDIuMTFMOS45MSA5LjA3YTE2IDE2IDAgMCAwIDYuMDIgNi4wMmwxLjM5LTEuMzlhMiAyIDAgMCAxIDIuMTEtLjQ1Yy45Mi4yODQgMS44NjIuNDkyIDIuODMuNjJhMiAyIDAgMCAxIDEuNzIgMnoiLz48L3N2Zz4=`;
const GLOBE_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTIgMTJoMjBNMTIgMmE0MC4yNiA0MC4yNiAwIDAgMSAwIDIwTTEyIDJhNDAuMjYgNDAuMjYgMCAwIDAgMCAyMCIvPjwvc3ZnPg==`;

interface SignatureData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  twitter: string;
  logo: string;
}

type Template = "professional" | "minimal" | "modern" | "colorful";

function generateSignatureHtml(data: SignatureData, template: Template): string {
  const { name, title, company, email, phone, website, linkedin, twitter, logo } = data;

  const linkedinUrl = linkedin ? (linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin}`) : "";
  const twitterUrl = twitter ? (twitter.startsWith("http") ? twitter : `https://twitter.com/${twitter.replace("@", "")}`) : "";
  const websiteUrl = website ? (website.startsWith("http") ? website : `https://${website}`) : "";

  const socialIcons = `
    ${email ? `<a href="mailto:${email}" style="display:inline-block;margin-right:8px;"><img src="${EMAIL_ICON}" width="16" height="16" alt="Email" style="vertical-align:middle;" /></a>` : ""}
    ${phone ? `<a href="tel:${phone}" style="display:inline-block;margin-right:8px;"><img src="${PHONE_ICON}" width="16" height="16" alt="Phone" style="vertical-align:middle;" /></a>` : ""}
    ${websiteUrl ? `<a href="${websiteUrl}" style="display:inline-block;margin-right:8px;"><img src="${GLOBE_ICON}" width="16" height="16" alt="Website" style="vertical-align:middle;" /></a>` : ""}
    ${linkedinUrl ? `<a href="${linkedinUrl}" style="display:inline-block;margin-right:8px;"><img src="${LINKEDIN_ICON}" width="16" height="16" alt="LinkedIn" style="vertical-align:middle;" /></a>` : ""}
    ${twitterUrl ? `<a href="${twitterUrl}" style="display:inline-block;margin-right:8px;"><img src="${TWITTER_ICON}" width="16" height="16" alt="X/Twitter" style="vertical-align:middle;" /></a>` : ""}
  `.trim();

  if (template === "professional") {
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;border-collapse:collapse;">
  <tr>
    ${logo ? `<td style="padding-right:16px;vertical-align:top;"><img src="${logo}" width="60" height="60" alt="${company}" style="border-radius:4px;" /></td>` : ""}
    <td style="border-left:3px solid #2563eb;padding-left:14px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#111;">${name || "Your Name"}</p>
      ${title ? `<p style="margin:2px 0 0;font-size:13px;color:#444;">${title}</p>` : ""}
      ${company ? `<p style="margin:2px 0 0;font-size:13px;color:#2563eb;font-weight:600;">${company}</p>` : ""}
      <p style="margin:8px 0 0;font-size:12px;color:#666;">
        ${email ? `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>` : ""}
        ${email && phone ? " &nbsp;·&nbsp; " : ""}
        ${phone ? `<a href="tel:${phone}" style="color:#666;text-decoration:none;">${phone}</a>` : ""}
        ${(email || phone) && websiteUrl ? " &nbsp;·&nbsp; " : ""}
        ${websiteUrl ? `<a href="${websiteUrl}" style="color:#2563eb;text-decoration:none;">${website}</a>` : ""}
      </p>
      ${socialIcons ? `<p style="margin:8px 0 0;">${socialIcons}</p>` : ""}
    </td>
  </tr>
</table>`;
  }

  if (template === "minimal") {
    return `<table cellpadding="0" cellspacing="0" style="font-family:Georgia,serif;">
  <tr><td>
    <p style="margin:0;font-size:15px;font-weight:bold;color:#222;">${name || "Your Name"}</p>
    ${title || company ? `<p style="margin:2px 0 0;font-size:13px;color:#777;">${[title, company].filter(Boolean).join(", ")}</p>` : ""}
    <p style="margin:6px 0 0;font-size:12px;color:#555;">
      ${email ? `<a href="mailto:${email}" style="color:#555;text-decoration:none;">${email}</a>` : ""}
      ${email && phone ? " · " : ""}
      ${phone ? phone : ""}
    </p>
    ${linkedinUrl || twitterUrl ? `<p style="margin:6px 0 0;font-size:12px;">
      ${linkedinUrl ? `<a href="${linkedinUrl}" style="color:#0077b5;text-decoration:none;">LinkedIn</a>` : ""}
      ${linkedinUrl && twitterUrl ? " · " : ""}
      ${twitterUrl ? `<a href="${twitterUrl}" style="color:#000;text-decoration:none;">X/Twitter</a>` : ""}
    </p>` : ""}
  </td></tr>
</table>`;
  }

  if (template === "modern") {
    return `<table cellpadding="0" cellspacing="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fa;border-radius:8px;padding:16px;">
  <tr>
    ${logo ? `<td style="padding-right:16px;vertical-align:middle;"><img src="${logo}" width="64" height="64" alt="${company}" style="border-radius:50%;display:block;" /></td>` : ""}
    <td style="vertical-align:middle;">
      <p style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">${name || "Your Name"}</p>
      ${title ? `<p style="margin:3px 0 0;font-size:13px;color:#6b7280;font-weight:500;">${title}</p>` : ""}
      ${company ? `<p style="margin:3px 0 0;font-size:13px;color:#374151;font-weight:600;">${company}</p>` : ""}
      <p style="margin:10px 0 0;">${socialIcons || ""}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
        ${email ? `<a href="mailto:${email}" style="color:#6b7280;text-decoration:none;">${email}</a>` : ""}
        ${websiteUrl ? `${email ? " · " : ""}<a href="${websiteUrl}" style="color:#6b7280;text-decoration:none;">${website}</a>` : ""}
      </p>
    </td>
  </tr>
</table>`;
  }

  // colorful
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea22,#764ba222);border-radius:12px;padding:20px;">
  <tr>
    <td>
      ${logo ? `<img src="${logo}" width="56" height="56" alt="${company}" style="border-radius:8px;display:block;margin-bottom:12px;" />` : ""}
      <p style="margin:0;font-size:18px;font-weight:800;color:#4f46e5;">${name || "Your Name"}</p>
      ${title ? `<p style="margin:3px 0 0;font-size:13px;color:#7c3aed;font-weight:600;">${title}</p>` : ""}
      ${company ? `<p style="margin:3px 0 0;font-size:13px;color:#6b7280;">${company}</p>` : ""}
      <p style="margin:10px 0 4px;font-size:12px;color:#374151;">
        ${email ? `📧 <a href="mailto:${email}" style="color:#4f46e5;text-decoration:none;">${email}</a>` : ""}
      </p>
      <p style="margin:4px 0;font-size:12px;color:#374151;">
        ${phone ? `📱 <a href="tel:${phone}" style="color:#374151;text-decoration:none;">${phone}</a>` : ""}
      </p>
      <p style="margin:4px 0;font-size:12px;color:#374151;">
        ${websiteUrl ? `🌐 <a href="${websiteUrl}" style="color:#4f46e5;text-decoration:none;">${website}</a>` : ""}
      </p>
      ${socialIcons ? `<p style="margin:10px 0 0;">${socialIcons}</p>` : ""}
    </td>
  </tr>
</table>`;
}

const TEMPLATES: { id: Template; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Clean, corporate with blue accent" },
  { id: "minimal", label: "Minimal", desc: "Simple serif, just the essentials" },
  { id: "modern", label: "Modern", desc: "Apple-style, subtle background" },
  { id: "colorful", label: "Colorful", desc: "Gradient, emoji accents" },
];

export function EmailSignatureGeneratorTool() {
  const [data, setData] = useState<SignatureData>({
    name: "Jane Smith",
    title: "Senior Engineer",
    company: "Acme Corp",
    email: "jane@acme.com",
    phone: "+1 (555) 123-4567",
    website: "acme.com",
    linkedin: "janesmith",
    twitter: "@janesmith",
    logo: "",
  });
  const [template, setTemplate] = useState<Template>("professional");
  const [htmlCopied, setHtmlCopied] = useState(false);
  const [richCopied, setRichCopied] = useState(false);

  const set = (field: keyof SignatureData, val: string) =>
    setData((prev) => ({ ...prev, [field]: val }));

  const html = generateSignatureHtml(data, template);

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 1500);
  };

  const copyRichText = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([data.name], { type: "text/plain" }),
        }),
      ]);
      setRichCopied(true);
      setTimeout(() => setRichCopied(false), 1500);
    } catch {
      await navigator.clipboard.writeText(html);
      setRichCopied(true);
      setTimeout(() => setRichCopied(false), 1500);
    }
  };

  const fields: { key: keyof SignatureData; label: string; placeholder: string; type?: string }[] = [
    { key: "name", label: "Full Name", placeholder: "Jane Smith" },
    { key: "title", label: "Job Title", placeholder: "Senior Engineer" },
    { key: "company", label: "Company", placeholder: "Acme Corp" },
    { key: "email", label: "Email", placeholder: "jane@acme.com", type: "email" },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567", type: "tel" },
    { key: "website", label: "Website", placeholder: "acme.com" },
    { key: "linkedin", label: "LinkedIn URL or username", placeholder: "janesmith or full URL" },
    { key: "twitter", label: "Twitter/X handle", placeholder: "@janesmith" },
    { key: "logo", label: "Logo URL (optional)", placeholder: "https://example.com/logo.png" },
  ];

  return (
    <ToolLayout
      title="Email Signature Generator"
      description="Create professional HTML email signatures for Gmail, Outlook, and Apple Mail. Live preview, multiple templates."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          {/* Template Selector */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-3">Template</h2>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                    template === t.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border-subtle bg-surface-raised text-text-secondary hover:border-accent"
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-3">Contact Info</h2>
            <div className="space-y-3">
              {fields.map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs text-text-muted font-mono mb-1.5">{label}</label>
                  <input
                    type={type || "text"}
                    value={data[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="space-y-4">
          {/* Live Preview */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-3">Preview</h2>
            <div
              className="p-4 bg-white rounded-lg border border-border-subtle min-h-[120px]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={copyRichText}
              className="flex-1 action-btn py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              {richCopied ? "✓ Copied!" : "📋 Copy to Clipboard"}
            </button>
            <button
              onClick={copyHtml}
              className="flex-1 action-btn py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              {htmlCopied ? "✓ Copied!" : "</> Copy HTML"}
            </button>
          </div>

          {/* HTML Output */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono uppercase tracking-wide text-text-muted">HTML Source</h2>
              <CopyButton text={html} label="Copy" />
            </div>
            <pre className="text-[11px] font-mono text-text-secondary bg-surface-raised border border-border-subtle rounded-lg p-3 overflow-auto max-h-[300px] whitespace-pre-wrap leading-relaxed">
              {html}
            </pre>
          </div>

          {/* Usage tips */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted leading-relaxed">
            <strong className="text-text-secondary">How to use:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Gmail:</strong> Settings → General → Signature → Paste with &quot;Copy to Clipboard&quot;</li>
              <li><strong>Outlook:</strong> File → Options → Mail → Signatures → Paste in editor</li>
              <li><strong>Apple Mail:</strong> Preferences → Signatures → Paste rich text</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SEO Content: Best Practices */}
      <section className="mt-8 pt-6 border-t border-border-subtle space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary">Email signature best practices</h2>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            A good email signature should be easy to scan, mobile-friendly, and focused on trust signals.
            Keep it short: name, role, company, and 1-2 contact methods are usually enough.
          </p>
          <p>
            If you include links, use clear labels and test them in Gmail and Outlook.
            Most email clients strip advanced CSS, so simple table-based HTML signatures are the safest option.
          </p>
        </div>
      </section>

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">Common email signature mistakes</h2>
        </div>
        <ul className="p-5 space-y-2 text-xs text-text-secondary list-disc list-inside leading-relaxed">
          <li><strong className="text-text-primary">Too much text:</strong> avoid long quotes, disclaimers, or stacked phone numbers in every message.</li>
          <li><strong className="text-text-primary">Huge images:</strong> oversized logos slow down email rendering and can get blocked by clients.</li>
          <li><strong className="text-text-primary">Broken social links:</strong> always test LinkedIn/X links before rolling out company-wide.</li>
          <li><strong className="text-text-primary">Inconsistent branding:</strong> standardize colors, title format, and CTA links across your team.</li>
        </ul>
      </section>

      <section className="mt-6 bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle bg-surface-subtle">
          <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">FAQ</h2>
        </div>
        <div className="p-5 space-y-4 text-xs text-text-secondary leading-relaxed">
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Does this generator work for Gmail and Outlook?</h3>
            <p>Yes. Use <strong>Copy to Clipboard</strong> for rich-text paste in Gmail/Outlook. If formatting shifts, use the HTML source method in your email client signature settings.</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-1">Should I include social icons in my email signature?</h3>
            <p>Only include links you actively use. Too many icons can distract from your core CTA and make the signature look noisy.</p>
          </div>
          <div>
            <h3 className="text-text-primary font-semibold mb-1">What image size is best for a logo?</h3>
            <p>For most signatures, a square logo around 120×120 px (or smaller) is enough. Keep file size low to improve email load performance.</p>
          </div>
        </div>
      </section>

      {/* Related internal links for SEO cluster */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "UTM Builder", href: "/utm-builder" },
            { name: "Open Graph Preview", href: "/og-preview" },
            { name: "Meta Tag Generator", href: "/meta-tags" },
            { name: "Markdown Editor", href: "/markdown-editor" },
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
