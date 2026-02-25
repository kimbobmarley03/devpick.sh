"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

type Group = "owner" | "group" | "other";
type Perm = "read" | "write" | "execute";

interface PermSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

type Permissions = Record<Group, PermSet>;

function permToOctal(p: PermSet): number {
  return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
}

function octalToSymbolic(n: number): string {
  return (
    (n & 4 ? "r" : "-") +
    (n & 2 ? "w" : "-") +
    (n & 1 ? "x" : "-")
  );
}

function permissionsToNumeric(perms: Permissions): string {
  return `${permToOctal(perms.owner)}${permToOctal(perms.group)}${permToOctal(perms.other)}`;
}

function permissionsToSymbolic(perms: Permissions): string {
  return (
    octalToSymbolic(permToOctal(perms.owner)) +
    octalToSymbolic(permToOctal(perms.group)) +
    octalToSymbolic(permToOctal(perms.other))
  );
}

function numericToPermissions(numeric: string): Permissions | null {
  if (!/^[0-7]{3}$/.test(numeric)) return null;
  const [o, g, ot] = numeric.split("").map(Number);
  const parse = (n: number): PermSet => ({
    read: !!(n & 4),
    write: !!(n & 2),
    execute: !!(n & 1),
  });
  return { owner: parse(o), group: parse(g), other: parse(ot) };
}

const PRESETS: Array<{ label: string; value: string; desc: string }> = [
  { label: "644", value: "644", desc: "Files (rw-r--r--)" },
  { label: "755", value: "755", desc: "Executables (rwxr-xr-x)" },
  { label: "777", value: "777", desc: "Full access (rwxrwxrwx)" },
  { label: "600", value: "600", desc: "Private (rw-------)" },
  { label: "400", value: "400", desc: "Read only (r--------)" },
];

const GROUPS: Group[] = ["owner", "group", "other"];
const PERMS: Perm[] = ["read", "write", "execute"];

const DEFAULT_PERMS: Permissions = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  other: { read: true, write: false, execute: true },
};

export function ChmodTool() {
  const [perms, setPerms] = useState<Permissions>(DEFAULT_PERMS);
  const [numericInput, setNumericInput] = useState("");

  const numeric = permissionsToNumeric(perms);
  const symbolic = permissionsToSymbolic(perms);
  const command = `chmod ${numeric} filename`;

  const toggle = (group: Group, perm: Perm) => {
    setPerms((prev) => ({
      ...prev,
      [group]: { ...prev[group], [perm]: !prev[group][perm] },
    }));
    setNumericInput("");
  };

  const applyNumeric = (val: string) => {
    setNumericInput(val);
    const parsed = numericToPermissions(val);
    if (parsed) setPerms(parsed);
  };

  const applyPreset = (value: string) => {
    const parsed = numericToPermissions(value);
    if (parsed) {
      setPerms(parsed);
      setNumericInput("");
    }
  };

  return (
    <ToolLayout
      title="Chmod Calculator"
      description="Calculate Unix file permissions — visual checkboxes, numeric & symbolic modes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Permission grid */}
        <div>
          {/* Presets */}
          <div className="mb-5">
            <div className="text-xs text-text-dimmed mb-3 font-mono uppercase tracking-wider">
              Common Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => applyPreset(p.value)}
                  className={`action-btn flex-col items-start gap-0.5 h-auto py-2 px-3 ${
                    numeric === p.value ? "!border-blue-500/40 !text-blue-400" : ""
                  }`}
                >
                  <span className="font-mono font-semibold text-sm">{p.label}</span>
                  <span className="text-[10px] text-text-dimmed font-normal">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Permission checkboxes */}
          <div className="bg-output-bg border border-border-subtle rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-border-subtle">
              <div className="p-3" />
              {PERMS.map((perm) => (
                <div
                  key={perm}
                  className="p-3 text-center text-xs font-mono uppercase tracking-wider text-text-dimmed"
                >
                  {perm.charAt(0).toUpperCase() + perm.slice(1)}
                </div>
              ))}
            </div>

            {/* Rows */}
            {GROUPS.map((group, gi) => (
              <div
                key={group}
                className={`grid grid-cols-4 ${gi < GROUPS.length - 1 ? "border-b border-border-subtle" : ""}`}
              >
                <div className="p-3 flex items-center">
                  <span className="text-sm font-mono text-text-secondary capitalize">{group}</span>
                </div>
                {PERMS.map((perm) => (
                  <div key={perm} className="p-3 flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perms[group][perm]}
                        onChange={() => toggle(group, perm)}
                        className="accent-blue-500 w-4 h-4"
                      />
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-4">
          {/* Numeric input */}
          <div>
            <div className="pane-label">
              Numeric Input (e.g. 755)
            </div>
            <input
              type="text"
              value={numericInput}
              onChange={(e) => applyNumeric(e.target.value)}
              placeholder="e.g. 755"
              maxLength={3}
              className={`tool-textarea font-mono text-lg text-center ${
                numericInput && !/^[0-7]{3}$/.test(numericInput)
                  ? "!border-red-500/40"
                  : ""
              }`}
              style={{ width: "100px", height: "52px", padding: "10px", resize: "none" }}
              spellCheck={false}
            />
            {numericInput && !/^[0-7]{3}$/.test(numericInput) && (
              <p className="text-xs text-[#ef4444] mt-1">Must be 3 octal digits (0-7)</p>
            )}
          </div>

          {/* Outputs */}
          <div className="flex flex-col gap-3">
            <div className="bg-output-bg border border-border-subtle rounded-xl p-4">
              <div className="text-xs text-text-dimmed mb-1 font-mono uppercase tracking-wider">
                Numeric
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-4xl font-bold text-blue-400">{numeric}</span>
                <CopyButton text={numeric} />
              </div>
            </div>

            <div className="bg-output-bg border border-border-subtle rounded-xl p-4">
              <div className="text-xs text-text-dimmed mb-1 font-mono uppercase tracking-wider">
                Symbolic
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-2xl text-text-primary tracking-widest">{symbolic}</span>
                <CopyButton text={symbolic} />
              </div>
            </div>

            <div className="bg-card-bg border border-border-subtle rounded-xl p-4">
              <div className="text-xs text-text-dimmed mb-1 font-mono uppercase tracking-wider">
                Command
              </div>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm text-text-primary">{command}</code>
                <CopyButton text={command} />
              </div>
            </div>
          </div>

          {/* Per-group breakdown */}
          <div className="bg-output-bg border border-border-subtle rounded-xl overflow-hidden">
            <div className="text-xs text-text-dimmed px-4 pt-3 pb-2 font-mono uppercase tracking-wider border-b border-border-subtle">
              Breakdown
            </div>
            {GROUPS.map((group) => {
              const oct = permToOctal(perms[group]);
              const sym = octalToSymbolic(oct);
              return (
                <div
                  key={group}
                  className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle last:border-0"
                >
                  <span className="text-sm font-mono text-text-secondary capitalize w-16">{group}</span>
                  <span className="font-mono text-lg text-blue-400">{oct}</span>
                  <span className="font-mono text-sm text-text-primary tracking-widest">{sym}</span>
                  <span className="text-xs text-text-dimmed font-mono">
                    {[
                      perms[group].read && "read",
                      perms[group].write && "write",
                      perms[group].execute && "execute",
                    ]
                      .filter(Boolean)
                      .join(", ") || "none"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Subnet Calculator", href: "/subnet" },
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "Robots.txt Generator", href: "/robots-txt" },
            { name: "IP Lookup", href: "/ip-lookup" },
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
