"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";

interface SubnetResult {
  ip: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  ipClass: string;
  ipBinary: string;
  maskBinary: string;
  networkBinary: string;
  broadcastBinary: string;
  isPrivate: boolean;
}

function ipToNum(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function numToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

function numToBin(num: number, sep = true): string {
  const bin = (num >>> 0).toString(2).padStart(32, "0");
  if (!sep) return bin;
  return [bin.slice(0, 8), bin.slice(8, 16), bin.slice(16, 24), bin.slice(24)].join(".");
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function isPrivate(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (a === 10) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
}

function calculate(ip: string, cidr: number): SubnetResult {
  const maskNum = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const ipNum = ipToNum(ip);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const wildcardNum = (~maskNum) >>> 0;
  const firstHostNum = cidr < 31 ? networkNum + 1 : networkNum;
  const lastHostNum = cidr < 31 ? broadcastNum - 1 : broadcastNum;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr < 31 ? totalHosts - 2 : totalHosts;

  return {
    ip,
    cidr,
    networkAddress: numToIp(networkNum),
    broadcastAddress: numToIp(broadcastNum),
    firstHost: numToIp(firstHostNum),
    lastHost: numToIp(lastHostNum),
    totalHosts,
    usableHosts: Math.max(0, usableHosts),
    subnetMask: numToIp(maskNum),
    wildcardMask: numToIp(wildcardNum),
    ipClass: getIpClass(parseInt(ip.split(".")[0])),
    ipBinary: numToBin(ipNum),
    maskBinary: numToBin(maskNum),
    networkBinary: numToBin(networkNum),
    broadcastBinary: numToBin(broadcastNum),
    isPrivate: isPrivate(ip),
  };
}

function validateIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p);
    return !isNaN(n) && n >= 0 && n <= 255 && p === String(n);
  });
}

const EXAMPLES = [
  { label: "Home network", value: "192.168.1.0/24" },
  { label: "Corporate", value: "10.0.0.0/8" },
  { label: "AWS VPC", value: "172.31.0.0/16" },
  { label: "Small office", value: "192.168.1.0/28" },
  { label: "Single host", value: "192.168.1.100/32" },
];

export function SubnetCalculatorTool() {
  useWebMCP({
    name: "calculateSubnet",
    description: "Calculate subnet details from IP and CIDR notation",
    inputSchema: {
      type: "object" as const,
      properties: {
      "ip": {
            "type": "string",
            "description": "IP address (e.g. 192.168.1.0)"
      },
      "cidr": {
            "type": "number",
            "description": "CIDR prefix length (e.g. 24)"
      }
},
      required: ["ip", "cidr"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for subnet calculation" }] };
    },
  });

  const [input, setInput] = useState("192.168.1.0/24");

  const [ip, cidrStr] = input.includes("/") ? input.split("/") : [input, "24"];
  const cidr = parseInt(cidrStr);

  const result = useMemo<SubnetResult | null>(() => {
    if (!validateIp(ip)) return null;
    if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;
    try { return calculate(ip.trim(), cidr); }
    catch { return null; }
  }, [ip, cidr]);

  const isValid = result !== null;

  return (
    <ToolLayout
      agentReady
      title="Subnet Calculator"
      description="Enter an IP address with CIDR notation to calculate network address, broadcast, host range, subnet mask, and more."
    >
      {/* Input */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="192.168.1.0/24"
            className={`flex-1 max-w-xs px-4 py-2.5 text-lg font-mono border rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-2 transition-colors ${
              input && !isValid
                ? "border-red-400 focus:ring-red-400"
                : "border-border-subtle focus:ring-accent"
            }`}
          />
          {input && !isValid && (
            <span className="text-xs text-red-500">Invalid IP/CIDR</span>
          )}
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-text-ghost self-center">Examples:</span>
          {EXAMPLES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setInput(value)}
              className="text-xs px-2 py-1 rounded border border-border-subtle text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              {value} <span className="text-text-ghost">({label})</span>
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          {/* Main results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Network Address", value: result.networkAddress, accent: true },
              { label: "Broadcast Address", value: result.broadcastAddress },
              { label: "First Usable Host", value: result.firstHost },
              { label: "Last Usable Host", value: result.lastHost },
              { label: "Subnet Mask", value: result.subnetMask },
              { label: "Wildcard Mask", value: result.wildcardMask },
              { label: "Total Hosts", value: result.totalHosts.toLocaleString() },
              { label: "Usable Hosts", value: result.usableHosts.toLocaleString() },
              { label: "IP Class", value: result.ipClass },
              { label: "CIDR Notation", value: `/${result.cidr}` },
              { label: "IP Type", value: result.isPrivate ? "Private (RFC 1918)" : "Public" },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className={`p-4 rounded-lg border ${accent ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20" : "border-border-subtle bg-zinc-50 dark:bg-zinc-800"}`}
              >
                <div className="text-xs text-text-ghost mb-1">{label}</div>
                <div className={`text-base font-bold font-mono ${accent ? "text-emerald-700 dark:text-emerald-300" : "text-text-primary"}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Binary representation */}
          <div className="rounded-lg border border-border-subtle overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-text-secondary">
              Binary Representation
            </div>
            <div className="p-4 space-y-2 overflow-x-auto">
              {[
                { label: "IP Address", value: result.ipBinary },
                { label: "Subnet Mask", value: result.maskBinary },
                { label: "Network Address", value: result.networkBinary },
                { label: "Broadcast Address", value: result.broadcastBinary },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-xs text-text-ghost w-36 shrink-0">{label}</span>
                  <span className="text-xs font-mono text-text-primary tracking-wide whitespace-nowrap">
                    {value.split(".").map((oct, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-text-ghost">.</span>}
                        {oct.split("").map((bit, j) => (
                          <span
                            key={j}
                            className={bit === "1" ? "text-emerald-600 dark:text-emerald-400" : "text-text-ghost"}
                          >
                            {bit}
                          </span>
                        ))}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual CIDR bar */}
          <div className="mt-4 p-4 rounded-lg border border-border-subtle bg-zinc-50 dark:bg-zinc-800">
            <div className="text-xs text-text-ghost mb-2">CIDR /{result.cidr} — Network bits vs Host bits</div>
            <div className="flex h-6 rounded overflow-hidden font-mono text-xs">
              <div
                className="bg-emerald-500 flex items-center justify-center text-white font-bold"
                style={{ width: `${(result.cidr / 32) * 100}%` }}
              >
                {result.cidr > 3 ? `Network (${result.cidr})` : ""}
              </div>
              <div
                className="bg-blue-400 flex items-center justify-center text-white font-bold"
                style={{ width: `${((32 - result.cidr) / 32) * 100}%` }}
              >
                {32 - result.cidr > 3 ? `Host (${32 - result.cidr})` : ""}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "IP Lookup", href: "/ip-lookup" },
            { name: "Chmod Calculator", href: "/chmod" },
            { name: "HTTP Status Codes", href: "/http-status" },
            { name: "Webhook Request Builder", href: "/webhook-tester" },
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
