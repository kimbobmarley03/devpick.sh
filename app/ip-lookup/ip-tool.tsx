"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Search, Globe, Loader2 } from "lucide-react";

interface IpInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
  asn?: string;
  latitude?: number;
  longitude?: number;
}

async function lookupIp(ip: string): Promise<IpInfo> {
  const url = ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.reason || "Lookup failed");
  return data;
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border-subtle last:border-0 gap-4">
      <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider shrink-0 w-28">
        {label}
      </span>
      <span className="text-sm text-text-primary font-mono text-right break-all">{String(value)}</span>
    </div>
  );
}

export function IpTool() {
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (ip = query.trim()) => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await lookupIp(ip);
      setInfo(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup own IP on mount
  useEffect(() => {
    lookup("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(query.trim());
  };

  return (
    <ToolLayout
      title="IP Lookup"
      description="Find your public IP address or look up any IP for geolocation and network info"
    >
      {/* Search */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Globe
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter IP address (leave blank for your IP)..."
            className="tool-textarea w-full pl-9"
            style={{ height: "40px", resize: "none", padding: "0 12px 0 36px" }}
            spellCheck={false}
          />
        </div>
        <button type="submit" className="action-btn primary" disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          Lookup
        </button>
        <button
          type="button"
          className="action-btn"
          onClick={() => { setQuery(""); lookup(""); }}
        >
          My IP
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
          <span className="text-sm text-red-300 font-mono">⚠ {error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !info && (
        <div className="bg-card-bg border border-card-border rounded-xl p-5 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2.5 border-b border-border-subtle last:border-0">
              <div className="h-3 w-20 bg-surface-subtle rounded" />
              <div className="h-3 w-32 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {info && (
        <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
          {/* IP header */}
          <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
            <div>
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider mb-1">
                IP Address
              </div>
              <div className="text-2xl font-mono text-text-primary">{info.ip}</div>
            </div>
            <CopyButton text={info.ip} label="Copy IP" />
          </div>

          <div className="px-5 py-2">
            <InfoRow label="City" value={info.city} />
            <InfoRow label="Region" value={info.region} />
            <InfoRow label="Country" value={info.country_name ? `${info.country_name} (${info.country})` : info.country} />
            <InfoRow label="Organization" value={info.org} />
            <InfoRow label="Timezone" value={info.timezone} />
            <InfoRow label="ASN" value={info.asn} />
            {info.latitude && info.longitude && (
              <InfoRow
                label="Coordinates"
                value={`${info.latitude.toFixed(4)}, ${info.longitude.toFixed(4)}`}
              />
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted mt-3 text-right font-mono">
        Powered by ipapi.co
      </p>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Subnet Calculator", href: "/subnet" },
            { name: "HTTP Status Codes", href: "/http-status" },
            { name: "Chmod Calculator", href: "/chmod" },
            { name: "UUID Generator", href: "/uuid-generator" },
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
