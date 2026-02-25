"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Network, Sliders } from "lucide-react";

// ── Pure bitwise helpers ──────────────────────────────────────────────────────

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}

function toBinary(n: number): string {
  return n.toString(2).padStart(32, "0");
}

function formatBinaryMask(bin: string): string {
  return bin.match(/.{8}/g)!.join(".");
}

// ── Validation ────────────────────────────────────────────────────────────────

const IP_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function isValidIp(ip: string): boolean {
  const m = ip.match(IP_REGEX);
  if (!m) return false;
  return m.slice(1).every((oct) => parseInt(oct) <= 255);
}

// ── Subnet calculation ────────────────────────────────────────────────────────

interface SubnetInfo {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hostCount: number;
  subnetMask: string;
  wildcardMask: string;
  subnetMaskBinary: string;
  cidr: number;
  ipClass: string;
  isPrivate: boolean;
}

function calcSubnet(ip: string, cidr: number): SubnetInfo | null {
  if (!isValidIp(ip)) return null;

  const ipInt = ipToInt(ip);
  const mask = cidrToMask(cidr);
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;

  const hostCount = cidr >= 31 ? Math.pow(2, 32 - cidr) : Math.max(0, Math.pow(2, 32 - cidr) - 2);
  const firstHost = cidr >= 31 ? network : network + 1;
  const lastHost = cidr >= 31 ? broadcast : broadcast - 1;

  // IP Class
  const firstOctet = (ipInt >>> 24) & 0xff;
  let ipClass = "E";
  if (firstOctet < 128) ipClass = "A";
  else if (firstOctet < 192) ipClass = "B";
  else if (firstOctet < 224) ipClass = "C";
  else if (firstOctet < 240) ipClass = "D (Multicast)";

  // Private ranges
  const isPrivate =
    (firstOctet === 10) ||
    (firstOctet === 172 && ((ipInt >>> 16) & 0xff) >= 16 && ((ipInt >>> 16) & 0xff) <= 31) ||
    (firstOctet === 192 && ((ipInt >>> 16) & 0xff) === 168);

  return {
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    hostCount,
    subnetMask: intToIp(mask),
    wildcardMask: intToIp(wildcard),
    subnetMaskBinary: formatBinaryMask(toBinary(mask)),
    cidr,
    ipClass,
    isPrivate,
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function ResultRow({ label, value, copyable = true }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border-subtle last:border-0 group hover:bg-surface-subtle transition-colors">
      <span className="text-sm text-text-dimmed w-44 shrink-0">{label}</span>
      <span className="font-mono text-sm text-text-primary flex-1 truncate">{value}</span>
      {copyable && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <CopyButton text={value} />
        </div>
      )}
    </div>
  );
}

function HostBar({ cidr }: { cidr: number }) {
  const pct = ((32 - cidr) / 32) * 100;
  return (
    <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SubnetTool() {
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);
  const [error, setError] = useState("");

  const handleIpChange = useCallback((val: string) => {
    setIpInput(val);
    if (val && !isValidIp(val)) {
      setError("Invalid IP address");
    } else {
      setError("");
    }
  }, []);

  const handleCidrInput = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0 && n <= 32) setCidr(n);
  };

  // Parse IP from combined notation (e.g. "192.168.1.0/24")
  const handleCombinedInput = (val: string) => {
    if (val.includes("/")) {
      const [ip, prefix] = val.split("/");
      handleIpChange(ip);
      const p = parseInt(prefix);
      if (!isNaN(p) && p >= 0 && p <= 32) setCidr(p);
    } else {
      handleIpChange(val);
    }
  };

  const info = isValidIp(ipInput) ? calcSubnet(ipInput, cidr) : null;

  return (
    <ToolLayout
      title="Subnet Calculator"
      description="Calculate subnet details from CIDR notation — network address, broadcast, host range, masks"
    >
      {/* Input section */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* IP input */}
          <div className="flex-1">
            <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider block mb-1.5">
              IP Address
            </label>
            <div className="relative">
              <Network size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={ipInput}
                onChange={(e) => handleCombinedInput(e.target.value)}
                placeholder="192.168.1.0 or 192.168.1.0/24"
                className={`tool-textarea pl-8 h-10 font-mono text-sm ${error ? "border-red-800" : ""}`}
                style={{ resize: "none", padding: "0 0.75rem 0 2rem", height: "40px" }}
                spellCheck={false}
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* CIDR input */}
          <div className="w-full sm:w-32">
            <label className="text-xs text-text-dimmed font-mono uppercase tracking-wider block mb-1.5">
              CIDR Prefix
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">/</span>
              <input
                type="number"
                value={cidr}
                onChange={(e) => handleCidrInput(e.target.value)}
                min={0}
                max={32}
                className="tool-textarea pl-6 h-10 font-mono text-sm text-center"
                style={{ resize: "none", padding: "0 0.5rem 0 1.5rem", height: "40px" }}
              />
            </div>
          </div>
        </div>

        {/* CIDR Slider */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Sliders size={12} className="text-text-muted" />
            <span className="text-xs text-text-dimmed font-mono">/{cidr} — {info ? info.hostCount.toLocaleString() + " hosts" : "—"}</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            value={cidr}
            onChange={(e) => setCidr(parseInt(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-text-ghost font-mono mt-1">
            <span>/0</span>
            <span>/8</span>
            <span>/16</span>
            <span>/24</span>
            <span>/32</span>
          </div>
          <HostBar cidr={cidr} />
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: "/8 — Class A", cidr: 8 },
            { label: "/16 — Class B", cidr: 16 },
            { label: "/24 — Class C", cidr: 24 },
            { label: "/25 — 126 hosts", cidr: 25 },
            { label: "/30 — 2 hosts", cidr: 30 },
            { label: "/32 — Single host", cidr: 32 },
          ].map(({ label, cidr: c }) => (
            <button
              key={c}
              onClick={() => setCidr(c)}
              className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                cidr === c
                  ? "border-blue-600 text-blue-400 bg-blue-950/30"
                  : "border-card-border text-text-dimmed hover:border-border-strong hover:text-text-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {info ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Address info */}
          <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
              <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Address Information</span>
              <div className="flex gap-1.5">
                {info.isPrivate && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-500 border border-emerald-900/50">
                    Private
                  </span>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/50 text-blue-400 border border-blue-900/50">
                  Class {info.ipClass}
                </span>
              </div>
            </div>
            <ResultRow label="Network Address" value={`${info.network}/${cidr}`} />
            <ResultRow label="Broadcast Address" value={info.broadcast} />
            <ResultRow label="First Usable Host" value={info.firstHost} />
            <ResultRow label="Last Usable Host" value={info.lastHost} />
            <ResultRow
              label="Usable Hosts"
              value={info.hostCount.toLocaleString()}
              copyable={false}
            />
            <ResultRow
              label="Total Addresses"
              value={Math.pow(2, 32 - cidr).toLocaleString()}
              copyable={false}
            />
          </div>

          {/* Right: Mask info */}
          <div className="space-y-4">
            <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-card-border">
                <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Masks</span>
              </div>
              <ResultRow label="Subnet Mask" value={info.subnetMask} />
              <ResultRow label="Wildcard Mask" value={info.wildcardMask} />
              <ResultRow label="CIDR Notation" value={`${info.network}/${cidr}`} />
            </div>

            {/* Binary subnet mask */}
            <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
                <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Subnet Mask in Binary</span>
                <CopyButton text={info.subnetMaskBinary} />
              </div>
              <div className="px-4 py-3">
                <div className="font-mono text-[12px] leading-relaxed">
                  {info.subnetMaskBinary.split(".").map((octet, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-text-ghost">.</span>}
                      {Array.from(octet).map((bit, j) => (
                        <span
                          key={j}
                          className={bit === "1" ? "text-blue-400" : "text-text-ghost"}
                        >
                          {bit}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-text-muted font-mono">
                    <span className="text-blue-400">1</span> = network bits ({cidr})
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    <span className="text-text-ghost">0</span> = host bits ({32 - cidr})
                  </span>
                </div>
              </div>
            </div>

            {/* Summary pill */}
            <div className="bg-card-bg border border-card-border rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-text-dimmed font-mono">
                {info.network} — {info.broadcast}
              </span>
              <span className="text-xs font-mono text-text-primary">
                {info.hostCount.toLocaleString()} usable hosts
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card-bg border border-card-border rounded-xl p-8 text-center">
          <Network size={28} className="mx-auto mb-3 text-text-ghost" />
          <p className="text-text-muted text-sm font-mono">Enter a valid IP address to calculate subnet details</p>
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "IP Lookup", href: "/ip-lookup" },
            { name: "Chmod Calculator", href: "/chmod" },
            { name: "HTTP Status Codes", href: "/http-status" },
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
