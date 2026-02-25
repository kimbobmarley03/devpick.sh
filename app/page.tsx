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
        <p className="text-text-secondary text-lg mb-8 font-light">
          Developer tools that don&apos;t suck.
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
                <span className="text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
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

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center">
        <p className="text-xs text-text-muted">
          devpick.sh — free, fast, client-side
        </p>
      </footer>
    </div>
  );
}
