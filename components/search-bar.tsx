"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Command } from "lucide-react";
import { tools } from "@/lib/tools";

interface SearchBarProps {
  onFilter?: (query: string) => void;
}

export function SearchBar({ onFilter }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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

  const handleChange = (val: string) => {
    setQuery(val);
    onFilter?.(val);
    setOpen(val.length > 0);
  };

  const handleSelect = (route: string) => {
    setOpen(false);
    setQuery("");
    onFilter?.("");
    router.push(route);
  };

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
          placeholder="Search tools..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
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
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card-bg border border-card-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {filtered.slice(0, 8).map((tool) => (
            <button
              key={tool.id}
              onMouseDown={() => handleSelect(tool.route)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-subtle transition-colors border-b border-border-subtle last:border-0"
            >
              <span className="text-xs font-mono text-accent bg-[color:var(--dp-accent-bg)] px-1.5 py-0.5 rounded border border-[color:var(--dp-accent-border)]">
                {tool.route}
              </span>
              <span className="text-sm text-text-primary">{tool.name}</span>
              <span className="text-xs text-text-dimmed ml-auto">{tool.category}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-card-bg border border-card-border rounded-xl shadow-2xl z-50 px-4 py-3 animate-fade-in">
          <span className="text-sm text-text-dimmed">No tools found for &ldquo;{query}&rdquo;</span>
        </div>
      )}
    </div>
  );
}
