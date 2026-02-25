"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";

interface RegexEntry {
  pattern: string;
  name: string;
  description: string;
  example: string;
  category: string;
}

const ENTRIES: RegexEntry[] = [
  // Anchors
  { category: "Anchors", pattern: "^", name: "Start of string", description: "Match at the beginning of the string", example: "^Hello matches 'Hello world'" },
  { category: "Anchors", pattern: "$", name: "End of string", description: "Match at the end of the string", example: "world$ matches 'Hello world'" },
  { category: "Anchors", pattern: "\\b", name: "Word boundary", description: "Match at a word boundary", example: "\\bword\\b matches 'word' but not 'password'" },
  { category: "Anchors", pattern: "\\B", name: "Non-word boundary", description: "Match where \\b would not match", example: "\\Bword\\B matches 'password'" },

  // Character Classes
  { category: "Character Classes", pattern: ".", name: "Any character", description: "Match any single character except newline", example: "a.c matches 'abc', 'axc', 'a1c'" },
  { category: "Character Classes", pattern: "\\d", name: "Digit", description: "Match any digit [0-9]", example: "\\d+ matches '123' in 'abc123'" },
  { category: "Character Classes", pattern: "\\D", name: "Non-digit", description: "Match any non-digit character", example: "\\D+ matches 'abc' in 'abc123'" },
  { category: "Character Classes", pattern: "\\w", name: "Word character", description: "Match [a-zA-Z0-9_]", example: "\\w+ matches 'hello_123'" },
  { category: "Character Classes", pattern: "\\W", name: "Non-word character", description: "Match any non-word character", example: "\\W matches space, comma, etc." },
  { category: "Character Classes", pattern: "\\s", name: "Whitespace", description: "Match space, tab, newline, etc.", example: "\\s+ matches all whitespace" },
  { category: "Character Classes", pattern: "\\S", name: "Non-whitespace", description: "Match any non-whitespace character", example: "\\S+ matches 'hello'" },
  { category: "Character Classes", pattern: "[abc]", name: "Character set", description: "Match any character in the set", example: "[aeiou] matches any vowel" },
  { category: "Character Classes", pattern: "[^abc]", name: "Negated set", description: "Match any character NOT in the set", example: "[^aeiou] matches any consonant" },
  { category: "Character Classes", pattern: "[a-z]", name: "Character range", description: "Match any character in the range", example: "[a-z] matches any lowercase letter" },
  { category: "Character Classes", pattern: "[a-zA-Z]", name: "Case-insensitive range", description: "Match any letter upper or lower", example: "[a-zA-Z]+ matches words" },

  // Quantifiers
  { category: "Quantifiers", pattern: "*", name: "Zero or more", description: "Match 0 or more of the preceding", example: "ab* matches 'a', 'ab', 'abb'" },
  { category: "Quantifiers", pattern: "+", name: "One or more", description: "Match 1 or more of the preceding", example: "ab+ matches 'ab', 'abb' but not 'a'" },
  { category: "Quantifiers", pattern: "?", name: "Zero or one", description: "Match 0 or 1 of the preceding (optional)", example: "colou?r matches 'color' and 'colour'" },
  { category: "Quantifiers", pattern: "{n}", name: "Exactly n", description: "Match exactly n of the preceding", example: "\\d{3} matches exactly 3 digits" },
  { category: "Quantifiers", pattern: "{n,}", name: "At least n", description: "Match n or more of the preceding", example: "\\d{2,} matches 2 or more digits" },
  { category: "Quantifiers", pattern: "{n,m}", name: "Between n and m", description: "Match between n and m of the preceding", example: "\\d{2,4} matches 2-4 digits" },
  { category: "Quantifiers", pattern: "*?", name: "Lazy zero or more", description: "Match as few as possible (non-greedy)", example: "<.*?> matches individual tags" },
  { category: "Quantifiers", pattern: "+?", name: "Lazy one or more", description: "Match as few as possible (non-greedy)", example: "a+? matches 'a' in 'aaa'" },

  // Groups & Lookaheads
  { category: "Groups & References", pattern: "(abc)", name: "Capture group", description: "Group and capture match for backreference", example: "(\\w+)\\s\\1 matches 'the the'" },
  { category: "Groups & References", pattern: "(?:abc)", name: "Non-capture group", description: "Group without capturing", example: "(?:foo|bar)+ matches 'foobar'" },
  { category: "Groups & References", pattern: "(?<name>abc)", name: "Named capture group", description: "Capture with a named reference", example: "(?<year>\\d{4}) captures year" },
  { category: "Groups & References", pattern: "\\1", name: "Backreference", description: "Reference first captured group", example: "(\\w+) \\1 matches repeated words" },
  { category: "Groups & References", pattern: "(?=abc)", name: "Lookahead", description: "Match only if followed by abc", example: "\\d(?= dollars) matches digit before ' dollars'" },
  { category: "Groups & References", pattern: "(?!abc)", name: "Negative lookahead", description: "Match only if NOT followed by abc", example: "\\d(?! dollars) matches digits not before ' dollars'" },
  { category: "Groups & References", pattern: "(?<=abc)", name: "Lookbehind", description: "Match only if preceded by abc", example: "(?<=\\$)\\d+ matches digits after $" },
  { category: "Groups & References", pattern: "(?<!abc)", name: "Negative lookbehind", description: "Match only if NOT preceded by abc", example: "(?<!\\$)\\d+ matches digits not after $" },

  // Alternation
  { category: "Alternation", pattern: "a|b", name: "Alternation", description: "Match a or b", example: "cat|dog matches 'cat' or 'dog'" },

  // Flags
  { category: "Flags", pattern: "/.../g", name: "Global", description: "Find all matches, not just the first", example: "/\\d/g finds all digits" },
  { category: "Flags", pattern: "/.../i", name: "Case-insensitive", description: "Match regardless of case", example: "/hello/i matches 'Hello', 'HELLO'" },
  { category: "Flags", pattern: "/.../m", name: "Multiline", description: "^ and $ match start/end of lines", example: "/^\\d/m matches digits at line start" },
  { category: "Flags", pattern: "/.../s", name: "Dot all (dotAll)", description: "Dot (.) matches newline too", example: "/a.b/s matches 'a\\nb'" },
  { category: "Flags", pattern: "/.../u", name: "Unicode", description: "Enable full Unicode support", example: "/\\u{1F600}/u matches emoji" },
  { category: "Flags", pattern: "/.../gi", name: "Global + case-insensitive", description: "Common combination", example: "/word/gi finds all case variations" },

  // Escape sequences
  { category: "Escape & Special", pattern: "\\n", name: "Newline", description: "Match a newline character", example: "line1\\nline2" },
  { category: "Escape & Special", pattern: "\\t", name: "Tab", description: "Match a tab character", example: "col1\\tcol2" },
  { category: "Escape & Special", pattern: "\\r", name: "Carriage return", description: "Match a carriage return", example: "Windows line endings: \\r\\n" },
  { category: "Escape & Special", pattern: "\\\\", name: "Literal backslash", description: "Match a backslash character", example: "C:\\\\Users matches 'C:\\Users'" },
  { category: "Escape & Special", pattern: "\\.", name: "Literal dot", description: "Match a literal period", example: "file\\.txt matches 'file.txt'" },
  { category: "Escape & Special", pattern: "\\*", name: "Literal asterisk", description: "Match a literal asterisk", example: "v1\\.\\* matches 'v1.*'" },

  // Common patterns
  { category: "Common Patterns", pattern: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$", name: "Email address", description: "Basic email validation pattern", example: "test@example.com" },
  { category: "Common Patterns", pattern: "^https?:\\/\\/[\\w.-]+(?:\\.[\\w.]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*$", name: "URL", description: "Match http/https URLs", example: "https://devpick.sh/tools" },
  { category: "Common Patterns", pattern: "^\\d{4}-\\d{2}-\\d{2}$", name: "ISO date (YYYY-MM-DD)", description: "Match ISO 8601 date format", example: "2024-01-15" },
  { category: "Common Patterns", pattern: "^\\+?[\\d\\s\\-().]{7,15}$", name: "Phone number", description: "Basic international phone number", example: "+1 (555) 123-4567" },
  { category: "Common Patterns", pattern: "^[a-f0-9]{6}([a-f0-9]{2})?$", name: "Hex color", description: "Match 3 or 6 char hex colors (no #)", example: "3b82f6 or ff5733" },
  { category: "Common Patterns", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$", name: "Strong password", description: "Min 8 chars, uppercase, lowercase, digit", example: "MyPass123" },
  { category: "Common Patterns", pattern: "^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}$", name: "IPv4 address", description: "Match valid IPv4 addresses", example: "192.168.1.1" },
  { category: "Common Patterns", pattern: "^[a-z][a-z0-9-]*$", name: "URL slug", description: "Lowercase letters, digits, hyphens", example: "my-awesome-article-123" },
  { category: "Common Patterns", pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$", name: "CSS hex color", description: "Match CSS hex color with optional #", example: "#3b82f6 or #fff" },
  { category: "Common Patterns", pattern: "\\b\\d{1,3}(,\\d{3})*(\\.\\d+)?\\b", name: "Formatted number", description: "Match numbers like 1,234.56", example: "1,234.56 or 1,000,000" },
];

const CATEGORIES = Array.from(new Set(ENTRIES.map((e) => e.category)));

export function RegexCheatSheetTool() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [testStr, setTestStr] = useState("Hello, World! 123");
  const [testPattern, setTestPattern] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ENTRIES.filter((e) => {
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      const matchSearch = !q ||
        e.pattern.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.example.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  // Group filtered entries by category
  const grouped = useMemo(() => {
    const map = new Map<string, RegexEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.category)) map.set(e.category, []);
      map.get(e.category)!.push(e);
    }
    return map;
  }, [filtered]);

  // Live tester
  let testResult: { matches: string[]; error: string } = { matches: [], error: "" };
  if (testPattern) {
    try {
      const re = new RegExp(testPattern, "g");
      const matches = [...testStr.matchAll(re)].map((m) => m[0]);
      testResult = { matches, error: "" };
    } catch (e) {
      testResult = { matches: [], error: (e as Error).message };
    }
  }

  return (
    <ToolLayout
      title="Regex Cheat Sheet"
      description="Complete regex reference with syntax, examples, and common patterns. Searchable and filterable."
    >
      {/* Search + filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patterns, names, descriptions…"
          className="flex-1 min-w-[240px] px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex flex-wrap gap-1">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live tester */}
      <div className="mb-6 p-4 rounded-lg border border-border-subtle bg-zinc-50 dark:bg-zinc-800">
        <div className="text-sm font-semibold text-text-primary mb-3">Live Tester</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-text-ghost block mb-1">Pattern</label>
            <input
              value={testPattern}
              onChange={(e) => setTestPattern(e.target.value)}
              placeholder="e.g. \\d+"
              className="w-full px-3 py-2 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex-[2] min-w-[240px]">
            <label className="text-xs text-text-ghost block mb-1">Test String</label>
            <input
              value={testStr}
              onChange={(e) => setTestStr(e.target.value)}
              placeholder="Test string here…"
              className="w-full px-3 py-2 text-sm font-mono border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
        {testPattern && (
          <div className="mt-2 text-xs font-mono">
            {testResult.error ? (
              <span className="text-red-500">{testResult.error}</span>
            ) : testResult.matches.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ {testResult.matches.length} match{testResult.matches.length !== 1 ? "es" : ""}: {testResult.matches.slice(0, 5).map((m) => `"${m}"`).join(", ")}
                {testResult.matches.length > 5 && ` +${testResult.matches.length - 5} more`}
              </span>
            ) : (
              <span className="text-text-ghost">No matches found</span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-text-ghost mb-4">
        Showing {filtered.length} of {ENTRIES.length} entries
      </div>

      {/* Cheat sheet table */}
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {category}
          </h2>
          <div className="rounded-lg border border-border-subtle overflow-hidden">
            <div className="hidden sm:grid grid-cols-[180px_1fr_1fr_1fr] bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-text-secondary border-b border-border-subtle">
              <span>Pattern</span>
              <span>Name</span>
              <span>Description</span>
              <span>Example</span>
            </div>
            {entries.map((e, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_1fr] px-3 py-2.5 border-b border-border-subtle last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors gap-1 sm:gap-0"
              >
                <div>
                  <button
                    className="text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors cursor-pointer"
                    onClick={() => setTestPattern(e.pattern.replace(/\//g, "").replace(/\.\.\./g, ""))}
                    title="Click to test"
                  >
                    {e.pattern}
                  </button>
                </div>
                <div className="text-xs font-semibold text-text-primary sm:pl-2">{e.name}</div>
                <div className="text-xs text-text-secondary sm:pl-2">{e.description}</div>
                <div className="text-xs font-mono text-text-ghost sm:pl-2 truncate" title={e.example}>{e.example}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-text-ghost">
          No patterns found for &quot;{search}&quot;
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Regex Tester", href: "/regex" },
            { name: "Escape / Unescape", href: "/escape" },
            { name: "JSON Schema Validator", href: "/json-schema" },
            { name: "Diff Checker", href: "/diff-checker" },
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
