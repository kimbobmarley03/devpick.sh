"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

const EXAMPLES = [
  {
    label: "Countries API",
    endpoint: "https://countries.trevorblades.com/graphql",
    query: `query GetCountries {
  countries(filter: { continent: { eq: "EU" } }) {
    code
    name
    capital
    currency
  }
}`,
    variables: "{}",
  },
  {
    label: "Star Wars API",
    endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
    query: `query AllFilms {
  allFilms {
    films {
      title
      releaseDate
      director
    }
  }
}`,
    variables: "{}",
  },
  {
    label: "SpaceX API",
    endpoint: "https://spacex-production.up.railway.app/",
    query: `query LatestLaunches {
  launches(limit: 5, order: "launch_date_utc", sort: "desc") {
    mission_name
    launch_date_utc
    rocket {
      rocket_name
    }
    launch_success
  }
}`,
    variables: "{}",
  },
];

interface Header {
  key: string;
  value: string;
}

export function GraphqlPlaygroundTool() {
  const [endpoint, setEndpoint] = useState("https://countries.trevorblades.com/graphql");
  const [query, setQuery] = useState(EXAMPLES[0].query);
  const [variables, setVariables] = useState("{}");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }]);
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [elapsed, setElapsed] = useState<number | null>(null);

  const addHeader = () => setHeaders((prev) => [...prev, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders((prev) => prev.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));
  };

  const execute = async () => {
    if (!endpoint.trim()) return;
    setLoading(true);
    setError("");
    setResponse("");
    setStatus(null);
    setElapsed(null);

    const headersObj: Record<string, string> = {};
    for (const h of headers) {
      if (h.key.trim()) headersObj[h.key.trim()] = h.value;
    }
    if (!headersObj["Content-Type"]) headersObj["Content-Type"] = "application/json";

    let parsedVariables: Record<string, unknown> = {};
    try {
      parsedVariables = variables.trim() ? JSON.parse(variables) : {};
    } catch {
      setError("Invalid JSON in variables");
      setLoading(false);
      return;
    }

    const start = Date.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: headersObj,
        body: JSON.stringify({ query, variables: parsedVariables }),
      });
      const end = Date.now();
      setElapsed(end - start);
      setStatus(res.status);
      const json = await res.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
      setElapsed(Date.now() - start);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: (typeof EXAMPLES)[0]) => {
    setEndpoint(ex.endpoint);
    setQuery(ex.query);
    setVariables(ex.variables);
    setResponse("");
    setStatus(null);
    setError("");
  };

  const statusColor = status
    ? status >= 200 && status < 300
      ? "text-green-400"
      : "text-red-400"
    : "";

  return (
    <ToolLayout
      title="GraphQL Playground"
      description="Execute GraphQL queries and mutations directly from your browser. Add headers, variables, and see formatted JSON responses."
    >
      {/* Endpoint + Execute */}
      <div className="bg-card-bg border border-card-border rounded-xl p-4 mb-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-0">
            <label className="block text-xs text-text-muted font-mono mb-1.5">Endpoint URL</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/graphql"
              className="w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
          </div>
          <div className="pt-5">
            <button
              onClick={execute}
              disabled={loading || !endpoint.trim()}
              className="action-btn flex items-center gap-2 px-4 py-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Running…
                </>
              ) : (
                "▶ Execute"
              )}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-muted font-mono">Examples:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex)}
              className="text-xs px-2 py-1 rounded border border-border-subtle text-text-secondary hover:border-accent hover:text-accent bg-surface-raised font-mono transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Query + Variables + Headers */}
        <div className="space-y-4">
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <label className="block text-xs font-mono uppercase tracking-wide text-text-muted mb-2">Query</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono resize-y"
            />
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <label className="block text-xs font-mono uppercase tracking-wide text-text-muted mb-2">Variables (JSON)</label>
            <textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono resize-y"
            />
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wide text-text-muted">Headers</label>
              <button onClick={addHeader} className="text-xs text-accent hover:underline font-mono">+ Add</button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={h.key}
                    onChange={(e) => updateHeader(i, "key", e.target.value)}
                    placeholder="Key"
                    className="flex-1 px-2 py-1.5 text-xs border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                  <input
                    value={h.value}
                    onChange={(e) => updateHeader(i, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1.5 text-xs border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                  />
                  <button onClick={() => removeHeader(i)} className="text-xs text-text-muted hover:text-red-400 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Response */}
        <div className="bg-card-bg border border-card-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wide text-text-muted">Response</span>
              {status && (
                <span className={`text-xs font-mono font-semibold ${statusColor}`}>
                  {status}
                </span>
              )}
              {elapsed !== null && (
                <span className="text-xs text-text-muted font-mono">{elapsed}ms</span>
              )}
            </div>
            {response && <CopyButton text={response} label="Copy" />}
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-mono">
              {error}
            </div>
          )}
          <pre className="flex-1 min-h-[400px] p-3 rounded-lg bg-surface-raised border border-border-subtle font-mono text-xs text-text-primary overflow-auto whitespace-pre leading-relaxed">
            {loading ? (
              <span className="text-text-muted">Executing query…</span>
            ) : response ? (
              response
            ) : (
              <span className="text-text-muted">Response will appear here after you execute a query.</span>
            )}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
