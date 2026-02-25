"use client";

import Link from "next/link";
import {
  Braces, Database, Code2, Binary, Link as LinkIcon, FileCode, FileCode2,
  KeyRound, Clock, ArrowLeftRight, Hash, Table, TableProperties, Fingerprint,
  ShieldCheck, Lock, AlignLeft, Network, Globe, GitCompare, Pipette, Locate,
  Type, Globe2, Palette, CaseSensitive, LetterText, FileText, QrCode, FileJson,
  Minimize2, Shield, Image, Link2, Terminal,
  Layers, Square, LayoutGrid, Columns2,
  BarChart3, ImageDown, Star, Crop,
  Music, Receipt, ArrowUpDown, FileDown, CheckSquare,
  type LucideIcon,
} from "lucide-react";
import type { Tool, ToolCategory } from "@/lib/tools";
import { categories } from "@/lib/tools";

const iconMap: Record<string, LucideIcon> = {
  Braces, Database, Code2, Binary, Link: LinkIcon, FileCode, FileCode2,
  KeyRound, Clock, ArrowLeftRight, Hash, Table, TableProperties, Fingerprint,
  ShieldCheck, Lock, AlignLeft, Network, Globe, GitCompare, Pipette, Locate,
  Type, Globe2, Palette, CaseSensitive, LetterText, FileText, QrCode, FileJson,
  Minimize2, Shield, Image, Link2, Terminal,
  Layers, Square, LayoutGrid, Columns2,
  BarChart3, ImageDown, Star, Crop,
  Music, Receipt, ArrowUpDown, FileDown, CheckSquare,
};

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(vol % 1000000 === 0 ? 0 : 1)}M`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(vol % 1000 === 0 ? 0 : 1)}K`;
  return vol.toString();
}

interface ToolSidebarProps {
  tools: Tool[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

export function ToolSidebar({ tools, hoveredId, onHover }: ToolSidebarProps) {
  const toolsByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat] = tools.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<ToolCategory, Tool[]>
  );

  return (
    <div className="globe-sidebar w-48 flex-shrink-0 pl-2 pt-2 max-h-[540px] overflow-y-auto">
      {categories.map((cat) => {
        const catTools = toolsByCategory[cat];
        if (!catTools || catTools.length === 0) return null;
        return (
          <div key={cat} className="mb-3">
            <div className="text-[9px] font-bold tracking-[0.15em] text-text-muted uppercase mb-1 px-2">
              {cat}
            </div>
            {catTools.map((tool) => {
              const Icon = iconMap[tool.icon] || Braces;
              const isActive = hoveredId === tool.id;
              return (
                <Link
                  key={tool.id}
                  href={tool.route}
                  className={`globe-sidebar-item flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-all duration-150 no-underline ${
                    isActive
                      ? "bg-[var(--dp-accent-bg)] text-[var(--dp-accent)] border-r-2 border-[var(--dp-accent)]"
                      : "text-text-secondary hover:text-text-primary hover:bg-[var(--dp-bg-subtle)]"
                  }`}
                  onMouseEnter={() => onHover(tool.id)}
                  onMouseLeave={() => onHover(null)}
                >
                  <Icon size={11} className="flex-shrink-0" style={{ color: isActive ? "var(--dp-accent)" : "inherit" }} />
                  <span className="truncate flex-1">{tool.name}</span>
                  {tool.volume && (
                    <span className="text-[9px] text-text-muted font-mono flex-shrink-0">{formatVolume(tool.volume)}</span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
