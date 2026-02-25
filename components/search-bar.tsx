"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, ChevronRight } from "lucide-react";
import { tools, categories } from "@/lib/tools";
import type { Tool, ToolCategory } from "@/lib/tools";

interface SearchBarProps {
  onFilter?: (query: string) => void;
}

function scoreMatch(tool: Tool, query: string): number {
  const q = query.toLowerCase();
  const name = tool.name.toLowerCase();
  const desc = tool.description.toLowerCase();
  const cat = tool.category.toLowerCase();
  const tags = (tool.tags || []).map((t) => t.toLowerCase());

  // Exact name match = highest
  if (name === q) return 100;
  // Name starts with query
  if (name.startsWith(q)) return 90;
  // Name contains query
  if (name.includes(q)) return 80;
  // Tag exact match
  if (tags.some((t) => t === q)) return 70;
  // Tag starts with query
  if (tags.some((t) => t.startsWith(q))) return 60;
  // Tag contains query
  if (tags.some((t) => t.includes(q))) return 50;
  // Description contains query
  if (desc.includes(q)) return 40;
  // Category match
  if (cat.includes(q)) return 30;
  // Multi-word: all words match somewhere
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const all = [name, desc, cat, ...tags].join(" ");
    if (words.every((w) => all.includes(w))) return 25;
  }
  return 0;
}

export function SearchBar({ onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Find matching categories
  const matchingCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return categories.filter((cat) => cat.toLowerCase().includes(q));
  }, [query]);

  // Find matching tools, scored and sorted
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return tools
      .map((t) => ({ tool: t, score: scoreMatch(t, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.tool);
  }, [query]);

  // Group tools by category for category matches
  const categoryResults = useMemo(() => {
    if (matchingCategories.length === 0) return {};
    const result: Partial<Record<ToolCategory, Tool[]>> = {};
    for (const cat of matchingCategories) {
      result[cat] = tools.filter((t) => t.category === cat);
    }
    return result;
  }, [matchingCategories]);

  // Total items for keyboard nav
  const totalItems = useMemo(() => {
    let count = 0;
    // Category sections
    for (const cat of matchingCategories) {
      count += 1; // category header (not selectable)
      count += (categoryResults[cat]?.length || 0);
    }
    // Direct tool results (exclude tools already shown in categories)
    const categoryToolIds = new Set(
      Object.values(categoryResults).flat().map((t) => t.id)
    );
    const directTools = filtered.filter((t) => !categoryToolIds.has(t.id));
    count += directTools.length;
    return count;
  }, [matchingCategories, categoryResults, filtered]);

  const directTools = useMemo(() => {
    const categoryToolIds = new Set(
      Object.values(categoryResults).flat().map((t) => t.id)
    );
    return filtered.filter((t) => !categoryToolIds.has(t.id)).slice(0, 8);
  }, [filtered, categoryResults]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
        onFilter?.("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFilter]);

  // Reset selection when query changes — done in handleChange instead of useEffect

  const handleChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
    onFilter?.(val);
    setOpen(val.length > 0);
  };

  const handleSelect = (route: string) => {
    setOpen(false);
    setQuery("");
    onFilter?.("");
    router.push(route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      // Find the tool at the selected index
      let idx = 0;
      for (const cat of matchingCategories) {
        const catTools = categoryResults[cat] || [];
        for (const t of catTools) {
          if (idx === selectedIndex) {
            handleSelect(t.route);
            return;
          }
          idx++;
        }
      }
      for (const t of directTools) {
        if (idx === selectedIndex) {
          handleSelect(t.route);
          return;
        }
        idx++;
      }
    }
  };

  const hasResults = matchingCategories.length > 0 || directTools.length > 0;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <Search
          size={15}
          className="absolute left-4 text-text-dimmed pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search 100+ tools..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          className="w-full bg-card-bg border border-card-border rounded-xl text-sm text-text-primary
            placeholder-text-muted pl-10 pr-16 py-3 outline-none
            transition-all duration-150
            focus:border-[color:var(--dp-accent-border)] focus:shadow-[var(--dp-focus-ring)]"
        />
        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
          <kbd className="flex items-center gap-0.5 bg-surface-subtle border border-card-border rounded px-1.5 py-0.5 text-[10px] text-text-dimmed">
            <Command size={9} />
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      {open && hasResults && (
        <div className="absolute top-full mt-2 w-full bg-card-bg border border-card-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in max-h-[420px] overflow-y-auto">
          {(() => {
            let idx = 0;
            const elements: React.ReactNode[] = [];

            // Category sections first
            for (const cat of matchingCategories) {
              const catTools = categoryResults[cat] || [];
              elements.push(
                <div key={`cat-${cat}`} className="px-4 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-accent uppercase">
                      {cat}
                    </span>
                    <span className="text-[10px] text-text-dimmed">
                      {catTools.length} tools
                    </span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>
                </div>
              );
              for (const tool of catTools) {
                const thisIdx = idx;
                elements.push(
                  <button
                    key={`cat-tool-${tool.id}`}
                    onMouseDown={() => handleSelect(tool.route)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors border-b border-border-subtle last:border-0 ${
                      selectedIndex === thisIdx
                        ? "bg-surface-subtle"
                        : "hover:bg-surface-subtle"
                    }`}
                  >
                    <ChevronRight size={12} className="text-text-dimmed" />
                    <span className="text-sm text-text-primary">{tool.name}</span>
                    <span className="text-xs text-text-dimmed ml-auto truncate max-w-[200px]">
                      {tool.description}
                    </span>
                  </button>
                );
                idx++;
              }
            }

            // Direct tool results
            if (directTools.length > 0 && matchingCategories.length > 0) {
              elements.push(
                <div key="other-header" className="px-4 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-text-muted uppercase">
                      OTHER MATCHES
                    </span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>
                </div>
              );
            }

            for (const tool of directTools) {
              const thisIdx = idx;
              elements.push(
                <button
                  key={`tool-${tool.id}`}
                  onMouseDown={() => handleSelect(tool.route)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border-subtle last:border-0 ${
                    selectedIndex === thisIdx
                      ? "bg-surface-subtle"
                      : "hover:bg-surface-subtle"
                  }`}
                >
                  <span className="text-xs font-mono text-accent bg-[color:var(--dp-accent-bg)] px-1.5 py-0.5 rounded border border-[color:var(--dp-accent-border)]">
                    {tool.route}
                  </span>
                  <span className="text-sm text-text-primary">{tool.name}</span>
                  <span className="text-xs text-text-dimmed ml-auto">{tool.category}</span>
                </button>
              );
              idx++;
            }

            return elements;
          })()}
        </div>
      )}

      {open && query.trim() && !hasResults && (
        <div className="absolute top-full mt-2 w-full bg-card-bg border border-card-border rounded-xl shadow-2xl z-50 px-4 py-3 animate-fade-in">
          <span className="text-sm text-text-dimmed">No tools found for &ldquo;{query}&rdquo;</span>
        </div>
      )}
    </div>
  );
}
