"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Plus, Trash2, Send } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
type ContentType = "application/json" | "application/x-www-form-urlencoded" | "text/plain" | "none";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const METHOD_COLORS: Record<Method, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-amber-600 dark:text-amber-400",
  PATCH: "text-purple-600 dark:text-purple-400",
  DELETE: "text-red-600 dark:text-red-400",
  HEAD: "text-teal-600 dark:text-teal-400",
  OPTIONS: "text-zinc-600 dark:text-zinc-400",
};

export function WebhookTesterTool() {
  const [method, setMethod] = useState<Method>("POST");
  const [url, setUrl] = useState("https://httpbin.org/post");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json", enabled: true },
    { key: "Authorization", value: "Bearer YOUR_TOKEN", enabled: false },
  ]);
  const [contentType] = useState<ContentType>("application/json");
  const [body, setBody] = useState(`{
  "event": "user.signup",
  "userId": "usr_123",
  "email": "alice@example.com",
  "timestamp": "2024-01-01T00:00:00Z"
}`);
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "response">("body");

  const addHeader = () =>
    setHeaders((h) => [...h, { key: "", value: "", enabled: true }]);

  const updateHeader = (i: number, field: keyof Header, val: string | boolean) => {
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));
  };

  const removeHeader = (i: number) => setHeaders((h) => h.filter((_, idx) => idx !== i));

  const sendRequest = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResponse(null);
    const start = Date.now();
    try {
      const reqHeaders: Record<string, string> = {};
      headers.filter((h) => h.enabled && h.key).forEach((h) => {
        reqHeaders[h.key] = h.value;
      });

      const opts: RequestInit = {
        method,
        headers: reqHeaders,
      };
      if (method !== "GET" && method !== "HEAD" && body.trim()) {
        opts.body = body;
      }

      const res = await fetch(url, opts);
      const elapsed = Date.now() - start;
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      const text = await res.text();
      // Try to pretty-print JSON
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch { /* not json */ }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formatted,
        time: elapsed,
      });
      setActiveTab("response");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    const parts = [`curl -X ${method} '${url}'`];
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      parts.push(`  -H '${h.key}: ${h.value}'`);
    });
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      const escapedBody = body.replace(/'/g, "'\\''");
      parts.push(`  -d '${escapedBody}'`);
    }
    return parts.join(" \\\n");
  };

  const statusColor =
    !response ? ""
    : response.status < 300 ? "text-emerald-600 dark:text-emerald-400"
    : response.status < 400 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <ToolLayout
      title="Webhook Request Builder"
      description="Build and send HTTP requests with custom headers and body. Test webhooks and APIs from your browser."
    >
      {/* URL bar */}
      <div className="flex gap-2 mb-4">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className={`px-3 py-2 text-sm font-mono font-bold border border-border-subtle rounded-lg bg-surface-raised focus:outline-none focus:ring-1 focus:ring-accent ${METHOD_COLORS[method]} min-w-[100px]`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          className="flex-1 px-3 py-2 text-sm font-mono border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={sendRequest}
          disabled={loading || !url}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          <Send size={14} />
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["headers", "body", "response"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`tab-btn capitalize ${activeTab === t ? "active" : ""}`}
          >
            {t}
            {t === "headers" && (
              <span className="ml-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 text-text-secondary rounded px-1">
                {headers.filter((h) => h.enabled && h.key).length}
              </span>
            )}
            {t === "response" && response && (
              <span className={`ml-1 text-[10px] font-mono font-bold ${statusColor}`}>
                {response.status}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "headers" && (
        <div className="space-y-2">
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={(e) => updateHeader(i, "enabled", e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <input
                value={h.key}
                onChange={(e) => updateHeader(i, "key", e.target.value)}
                placeholder="Header name"
                className="flex-1 px-2 py-1.5 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                value={h.value}
                onChange={(e) => updateHeader(i, "value", e.target.value)}
                placeholder="Value"
                className="flex-[2] px-2 py-1.5 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button onClick={() => removeHeader(i)} className="text-text-ghost hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addHeader} className="flex items-center gap-1.5 text-xs text-accent hover:underline mt-2">
            <Plus size={13} />
            Add Header
          </button>
        </div>
      )}

      {activeTab === "body" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-ghost font-mono">{contentType}</span>
            {method === "GET" || method === "HEAD" ? (
              <span className="text-xs text-amber-500">Body not sent for {method} requests</span>
            ) : null}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="tool-textarea w-full"
            rows={14}
            spellCheck={false}
            placeholder="Request body…"
          />
          {/* cURL preview */}
          <details className="mt-3 group">
            <summary className="text-xs text-text-ghost cursor-pointer hover:text-text-secondary select-none">
              Show cURL equivalent
            </summary>
            <div className="relative mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle p-3">
              <pre className="text-[12px] font-mono text-text-secondary whitespace-pre-wrap break-all">
                {generateCurl()}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={generateCurl()} />
              </div>
            </div>
          </details>
        </div>
      )}

      {activeTab === "response" && (
        <div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-mono mb-4">
              {error}
            </div>
          )}
          {!response && !error && (
            <div className="text-center py-20 text-text-ghost text-sm">
              Send a request to see the response here
            </div>
          )}
          {response && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle">
                <span className={`text-lg font-bold font-mono ${statusColor}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-xs text-text-ghost">{response.time}ms</span>
                <div className="ml-auto">
                  <CopyButton text={response.body} />
                </div>
              </div>
              <details>
                <summary className="text-xs text-text-secondary cursor-pointer select-none hover:text-text-primary">
                  Response Headers ({Object.keys(response.headers).length})
                </summary>
                <div className="mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <div key={k} className="text-xs font-mono">
                      <span className="text-accent">{k}</span>: <span className="text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </details>
              <div className="output-panel max-h-[50vh] overflow-auto">
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
                  {response.body}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JWT Decoder", href: "/jwt-decoder" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "HTTP Status Codes", href: "/http-status" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
