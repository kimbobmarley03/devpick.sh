"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean | null;
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

function parseJwt(token: string): JwtParts | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2];
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? now > (payload.exp as number) : null;
    return { header, payload, signature, isExpired };
  } catch {
    return null;
  }
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function formatTimestamp(val: unknown): string {
  if (typeof val !== "number") return String(val);
  const d = new Date(val * 1000);
  return `${val} (${d.toISOString()})`;
}

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function JwtTool() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const parsed = input.trim() ? parseJwt(input.trim()) : null;

  const handleChange = (val: string) => {
    setInput(val);
    if (val.trim() && !parseJwt(val.trim())) {
      setError("Invalid JWT format");
    } else {
      setError("");
    }
  };

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode and inspect JWT tokens — header, payload, signature"
    >
      {/* Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
            JWT Token
          </label>
          <button
            onClick={() => handleChange(SAMPLE_JWT)}
            className="action-btn text-[11px]"
          >
            Load Sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="tool-textarea"
          rows={4}
          spellCheck={false}
        />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-[#ef4444] text-xs">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {parsed && (
        <div className="grid gap-4">
          {/* Header */}
          <Section
            title="Header"
            color="blue"
            content={formatJson(parsed.header)}
            extra={
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-dimmed">Algorithm:</span>
                <span className="text-xs font-mono text-[#3b82f6]">
                  {String(parsed.header.alg || "?")}
                </span>
                <span className="text-xs text-text-dimmed ml-2">Type:</span>
                <span className="text-xs font-mono text-[#3b82f6]">
                  {String(parsed.header.typ || "?")}
                </span>
              </div>
            }
          />

          {/* Payload */}
          <Section
            title="Payload"
            color="green"
            content={formatJson(parsed.payload)}
            extra={
              <div className="flex flex-wrap gap-4 text-xs text-text-dimmed">
                {Boolean(parsed.payload.sub) && (
                  <span>
                    sub: <span className="text-text-secondary font-mono">{String(parsed.payload.sub)}</span>
                  </span>
                )}
                {Boolean(parsed.payload.iat) && (
                  <span>
                    iat: <span className="text-text-secondary font-mono">{formatTimestamp(parsed.payload.iat)}</span>
                  </span>
                )}
                {Boolean(parsed.payload.exp) && (
                  <span>
                    exp: <span className="text-text-secondary font-mono">{formatTimestamp(parsed.payload.exp)}</span>
                  </span>
                )}
              </div>
            }
          />

          {/* Signature */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider font-mono">
                Signature
              </span>
              <CopyButton text={parsed.signature} />
            </div>
            <p className="font-mono text-[12px] text-[#f59e0b] break-all mb-3">
              {parsed.signature}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle size={13} className="text-[#f59e0b]" />
              <span className="text-text-dimmed">
                Signature verification requires a secret key — not supported client-side
              </span>
            </div>
          </div>

          {/* Expiry status */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-card-bg border border-card-border">
            {parsed.isExpired === null ? (
              <>
                <AlertCircle size={15} className="text-text-secondary" />
                <span className="text-sm text-text-secondary">No expiration claim (exp) found</span>
              </>
            ) : parsed.isExpired ? (
              <>
                <XCircle size={15} className="text-[#ef4444]" />
                <span className="text-sm text-[#ef4444]">Token is expired</span>
              </>
            ) : (
              <>
                <CheckCircle size={15} className="text-[#22c55e]" />
                <span className="text-sm text-[#22c55e]">Token is not expired</span>
              </>
            )}
          </div>
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Base64", href: "/base64" },
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Password Generator", href: "/password-generator" },
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

function Section({
  title,
  color,
  content,
  extra,
}: {
  title: string;
  color: "blue" | "green";
  content: string;
  extra?: React.ReactNode;
}) {
  const colorClass = color === "blue" ? "text-[#3b82f6]" : "text-[#22c55e]";

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider font-mono ${colorClass}`}>
          {title}
        </span>
        <CopyButton text={content} />
      </div>
      {extra && <div className="mb-3">{extra}</div>}
      <pre className={`font-mono text-[12px] leading-relaxed whitespace-pre-wrap ${colorClass}`}>
        {content}
      </pre>
    </div>
  );
}
