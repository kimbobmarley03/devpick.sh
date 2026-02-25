"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

interface MatchInfo {
  index: number;
  text: string;
  groups: Record<string, string | undefined>;
  captures: (string | undefined)[];
}

const COMMON_PATTERNS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { label: "URL", pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+", flags: "g" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", flags: "g" },
  { label: "Phone (US)", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", flags: "g" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])", flags: "g" },
  { label: "Hex Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "g" },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function RegexTool() {
  useWebMCP({
    name: "testRegex",
    description: "Test a regex pattern against text",
    inputSchema: {
      type: "object" as const,
      properties: {
      "pattern": {
            "type": "string",
            "description": "Regex pattern"
      },
      "text": {
            "type": "string",
            "description": "Text to test against"
      },
      "flags": {
            "type": "string",
            "description": "Regex flags (default g)"
      }
},
      required: ["pattern", "text"],
    },
    execute: async (params) => {
      try { const re = new RegExp(params.pattern as string, (params.flags as string) || "g"); const matches = [...(params.text as string).matchAll(re)].map(m => m[0]); return { content: [{ type: "text", text: JSON.stringify({ matches, count: matches.length }, null, 2) }] }; } catch (e) { return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Invalid regex") }] }; }
    },
  });

  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(
    "Hello world! My email is user@example.com and my IP is 192.168.1.1\nCall me at (555) 123-4567 or visit https://devpick.sh"
  );

  const flagOptions = [
    { flag: "g", label: "global" },
    { flag: "i", label: "case-insensitive" },
    { flag: "m", label: "multiline" },
    { flag: "s", label: "dotAll" },
    { flag: "u", label: "unicode" },
  ];

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
  };

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] as MatchInfo[] };
    try {
      const re = new RegExp(pattern, flags);
      const results: MatchInfo[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testString)) !== null && safety < 1000) {
          results.push({
            index: m.index,
            text: m[0],
            groups: m.groups ? { ...m.groups } : {},
            captures: m.slice(1),
          });
          if (m[0].length === 0) re.lastIndex++;
          safety++;
        }
      } else {
        const m = re.exec(testString);
        if (m) {
          results.push({
            index: m.index,
            text: m[0],
            groups: m.groups ? { ...m.groups } : {},
            captures: m.slice(1),
          });
        }
      }
      return { regex: re, error: null, matches: results };
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [] as MatchInfo[] };
    }
  }, [pattern, flags, testString]);

  const highlightedHtml = useMemo(() => {
    if (!regex || matches.length === 0) return escapeHtml(testString);
    const colors = ["rgba(59,130,246,0.3)", "rgba(34,197,94,0.3)", "rgba(249,115,22,0.3)", "rgba(168,85,247,0.3)"];
    let result = "";
    let last = 0;
    matches.forEach((m, i) => {
      const start = m.index;
      const end = start + m.text.length;
      if (start > last) result += escapeHtml(testString.slice(last, start));
      const bg = colors[i % colors.length];
      result += `<span style="background:${bg};border-radius:2px;padding:1px 0">${escapeHtml(m.text)}</span>`;
      last = end;
    });
    if (last < testString.length) result += escapeHtml(testString.slice(last));
    return result;
  }, [regex, matches, testString]);

  return (
    <ToolLayout agentReady
      title="Regex Tester"
      description="Test and debug regular expressions with real-time matching and highlighting"
    >
      {/* Pattern input */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#555] font-mono text-lg">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="tool-textarea flex-1"
            style={{ height: "40px", padding: "8px 12px", resize: "none" }}
            spellCheck={false}
          />
          <span className="text-[#555] font-mono text-lg">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="tool-textarea text-center"
            style={{ width: "60px", height: "40px", padding: "8px", resize: "none" }}
            spellCheck={false}
          />
          <button onClick={() => { setPattern(""); setTestString(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-2">
            ⚠ {error}
          </div>
        )}

        {/* Flags */}
        <div className="flex items-center gap-3 mb-2">
          {flagOptions.map(({ flag, label }) => (
            <label key={flag} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flags.includes(flag)}
                onChange={() => toggleFlag(flag)}
                className="accent-blue-500 w-3.5 h-3.5"
              />
              <span className="text-xs text-[#888]">
                <span className="font-mono text-blue-400">{flag}</span> {label}
              </span>
            </label>
          ))}
        </div>

        {/* Quick patterns */}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PATTERNS.map(({ label, pattern: p, flags: f }) => (
            <button
              key={label}
              onClick={() => { setPattern(p); setFlags(f); }}
              className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-[#e5e5e5] hover:border-[#333] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Test string + highlighted output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-[#555] mb-2 font-mono uppercase tracking-wider">Test String</div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string..."
            className="tool-textarea"
            style={{ height: "200px" }}
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#555] font-mono uppercase tracking-wider">
              Matches ({matches.length})
            </span>
            {pattern && <CopyButton text={matches.map((m) => m.text).join("\n")} label="Copy Matches" />}
          </div>
          <div
            className="bg-[#0f0f0f] border border-[#222] rounded-lg p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-all overflow-auto text-[#e5e5e5]"
            style={{ height: "200px" }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Match details */}
      {matches.length > 0 && (
        <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1a1a1a] text-xs text-[#555] font-mono uppercase tracking-wider">
            Match Details
          </div>
          <div className="max-h-[300px] overflow-auto">
            {matches.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-4 py-2.5 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="text-xs text-[#555] font-mono min-w-[24px]">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-blue-400 break-all">&quot;{m.text}&quot;</span>
                    <span className="text-xs text-[#555]">at index {m.index}</span>
                  </div>
                  {m.captures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {m.captures.map((c, j) => (
                        <span key={j} className="text-xs font-mono bg-[#1e2433] text-blue-300 px-2 py-0.5 rounded">
                          ${j + 1}: {c ?? "undefined"}
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(m.groups).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(m.groups).map(([k, v]) => (
                        <span key={k} className="text-xs font-mono bg-[#1e2920] text-green-300 px-2 py-0.5 rounded">
                          {k}: {v ?? "undefined"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <CopyButton text={m.text} label="" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regex cheatsheet */}
      <details className="mt-6">
        <summary className="text-sm text-[#555] cursor-pointer hover:text-[#888] transition-colors">
          Quick Reference
        </summary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {[
            [".", "Any character"],
            ["\\d", "Digit [0-9]"],
            ["\\w", "Word char [a-zA-Z0-9_]"],
            ["\\s", "Whitespace"],
            ["^", "Start of string"],
            ["$", "End of string"],
            ["*", "0 or more"],
            ["+", "1 or more"],
            ["?", "0 or 1"],
            ["{n}", "Exactly n"],
            ["{n,m}", "n to m"],
            ["[abc]", "Character set"],
            ["[^abc]", "Negated set"],
            ["(abc)", "Capture group"],
            ["(?:abc)", "Non-capture"],
            ["a|b", "Alternation"],
          ].map(([token, desc]) => (
            <div key={token} className="flex items-center gap-2 text-xs">
              <code className="font-mono text-blue-400 bg-[#1e2433] px-1.5 py-0.5 rounded min-w-[60px] text-center">
                {token}
              </code>
              <span className="text-[#888]">{desc}</span>
            </div>
          ))}
        </div>
      </details>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Diff Checker", href: "/diff-checker" },
            { name: "Escape / Unescape", href: "/escape" },
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "URL Encoder", href: "/url-encoder" },
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
