"use client";

import { useState } from "react";
import { Globe2, LayoutGrid } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { SearchBar } from "@/components/search-bar";
import { GlobeLayout } from "@/components/globe-layout";
import { TreemapLayout } from "@/components/treemap-layout";
import { ThemeToggle } from "@/components/theme-toggle";
import { tools, categories } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";

export default function Home() {
  const [filterQuery, setFilterQuery] = useState("");
  const [view, setView] = useState<"treemap" | "globe">("treemap");

  const isSearching = filterQuery.trim().length > 0;

  const visibleTools = isSearching
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : tools;

  const visibleCategories = categories.filter((cat) =>
    visibleTools.some((t) => t.category === cat)
  );

  const toolsByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat] = visibleTools.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<ToolCategory, typeof tools>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header className="pt-16 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-5">
          <h1 className="font-mono text-4xl font-bold text-text-primary">
            <span className="text-accent">&gt;_</span> devpick.sh
          </h1>
          <span className="blink text-accent font-mono text-3xl">█</span>
        </div>
        <p className="text-text-secondary text-lg mb-2 font-light">
          Developer tools that don&apos;t suck.
        </p>
        <p className="text-emerald-400 text-sm mb-8 font-mono">
          🤖 WebMCP ready — AI agents can use our tools directly
        </p>
        <SearchBar onFilter={setFilterQuery} />
      </header>

      {/* Desktop view: treemap (default) or globe */}
      {!isSearching && (
        <section className="hidden lg:block pb-4 px-6">
          {/* View toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1 bg-[var(--dp-bg-subtle)] rounded-lg p-1 border border-[var(--dp-border)]">
              <button
                onClick={() => setView("treemap")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  view === "treemap"
                    ? "bg-[var(--dp-bg-card)] text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <LayoutGrid size={13} />
                Heatmap
              </button>
              <button
                onClick={() => setView("globe")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  view === "globe"
                    ? "bg-[var(--dp-bg-card)] text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Globe2 size={13} />
                Globe
              </button>
            </div>
          </div>

          {view === "treemap" ? (
            <TreemapLayout tools={tools} />
          ) : (
            <GlobeLayout tools={tools} />
          )}
        </section>
      )}

      {/* Category grid — mobile always, desktop only when searching */}
      <main
        className={`max-w-6xl mx-auto px-6 pb-20 ${
          !isSearching ? "lg:hidden" : ""
        }`}
      >
        {visibleCategories.map((category) => {
          const catTools = toolsByCategory[category];
          if (!catTools || catTools.length === 0) return null;

          return (
            <section key={category} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold tracking-[0.2em] text-text-muted uppercase">
                  {category}
                </span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[minmax(140px,auto)]">
                {catTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}

        {isSearching && visibleTools.length === 0 && (
          <div className="text-center py-20 text-text-dimmed">
            <p className="text-lg mb-2">No tools found.</p>
            <p className="text-sm">Try a different search term.</p>
          </div>
        )}
      </main>

      {/* MCP Section */}
      <section className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="rounded-xl border border-[var(--dp-border)] bg-[var(--dp-bg-subtle)] p-8">
          <p className="text-2xl mb-2">🤖</p>
          <h2 className="text-lg font-semibold text-text-primary mb-2 font-mono">Works with your AI agent</h2>
          <p className="text-sm text-text-secondary mb-4">
            Use devpick tools from Claude Code, Cursor, or Codex.<br />
            PDF merge, subnet calc, regex testing — things your agent can&apos;t do alone.
          </p>
          <code className="inline-block bg-[var(--dp-bg)] text-emerald-400 text-sm px-4 py-2 rounded-lg border border-[var(--dp-border)] font-mono mb-3">
            npx @devpick/mcp-server
          </code>
          <p className="text-xs text-text-dimmed">
            43 tools · 100% local · No API keys · Works offline
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center space-y-2">
        <p className="text-sm text-text-muted">
          devpick.sh — {tools.length} tools · 100% client-side, private, free · <span className="text-emerald-400">WebMCP ready</span>
        </p>
        <a
          href="https://github.com/kimbobmarley03/devpick.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-text-dimmed hover:text-text-secondary transition-colors"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Star on GitHub
        </a>
      </footer>
    </div>
  );
}
