"use client";

import { useState, useMemo } from "react";
import type { Tool, ToolCategory } from "@/lib/tools";
import { categories } from "@/lib/tools";
import { ToolSidebar } from "./tool-sidebar";

// Category colors for the heatmap
const categoryColors: Record<ToolCategory, { bg: string; border: string; text: string }> = {
  "FORMAT & VALIDATE": { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", text: "#60a5fa" },
  "ENCODE & DECODE": { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", text: "#c084fc" },
  "CONVERT": { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.3)", text: "#4ade80" },
  "GENERATE": { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", text: "#fb923c" },
  "NETWORK": { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)", text: "#f472b6" },
  "COMPARE": { bg: "rgba(14, 165, 233, 0.15)", border: "rgba(14, 165, 233, 0.3)", text: "#38bdf8" },
  "TEST & DEBUG": { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24" },
  "PDF": { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", text: "#f87171" },
  "SEO": { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399" },
};

// CPC to heat color: higher CPC = warmer/more intense


// Simple squarified treemap algorithm
interface TreemapRect {
  tool: Tool;
  x: number;
  y: number;
  w: number;
  h: number;
}

function layoutRow(
  tools: Tool[],
  totalVolume: number,
  x: number,
  y: number,
  w: number,
  h: number
): TreemapRect[] {
  if (tools.length === 0) return [];
  if (tools.length === 1) {
    return [{ tool: tools[0], x, y, w, h }];
  }

  const isWide = w >= h;
  const sorted = [...tools].sort((a, b) => (b.volume || 1) - (a.volume || 1));

  // Split into two groups trying to balance area
  let bestSplit = 1;
  let bestDiff = Infinity;
  let leftSum = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    leftSum += sorted[i].volume || 1;
    const rightSum = totalVolume - leftSum;
    const diff = Math.abs(leftSum - rightSum);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSplit = i + 1;
    }
  }

  const left = sorted.slice(0, bestSplit);
  const right = sorted.slice(bestSplit);
  const leftVol = left.reduce((s, t) => s + (t.volume || 1), 0);
  const leftRatio = leftVol / totalVolume;

  if (isWide) {
    const splitX = x + w * leftRatio;
    return [
      ...layoutRow(left, leftVol, x, y, w * leftRatio, h),
      ...layoutRow(right, totalVolume - leftVol, splitX, y, w * (1 - leftRatio), h),
    ];
  } else {
    const splitY = y + h * leftRatio;
    return [
      ...layoutRow(left, leftVol, x, y, w, h * leftRatio),
      ...layoutRow(right, totalVolume - leftVol, x, splitY, w, h * (1 - leftRatio)),
    ];
  }
}

interface TreemapLayoutProps {
  tools: Tool[];
}

export function TreemapLayout({ tools }: TreemapLayoutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);


  // Group by category and layout
  const rects = useMemo(() => {
    const WIDTH = 1000;
    const HEIGHT = 500;
    const GAP = 3;

    // First layout categories as big blocks
    const catData = categories
      .map((cat) => {
        const catTools = tools.filter((t) => t.category === cat);
        const totalVol = catTools.reduce((s, t) => s + (t.volume || 1), 0);
        return { cat, tools: catTools, volume: totalVol };
      })
      .filter((c) => c.tools.length > 0);

    const totalVolume = catData.reduce((s, c) => s + c.volume, 0);

    // Layout category blocks
    const catRects = layoutRow(
      catData.map((c) => ({ id: c.cat, volume: c.volume } as unknown as Tool)),
      totalVolume,
      0,
      0,
      WIDTH,
      HEIGHT
    );

    // Now layout tools within each category block
    const allRects: (TreemapRect & { catColor: typeof categoryColors[ToolCategory] })[] = [];

    catRects.forEach((cr, idx) => {
      const catInfo = catData[idx];
      const innerRects = layoutRow(
        catInfo.tools,
        catInfo.volume,
        cr.x + GAP,
        cr.y + GAP,
        cr.w - GAP * 2,
        cr.h - GAP * 2
      );
      innerRects.forEach((ir) => {
        allRects.push({
          ...ir,
          catColor: categoryColors[catInfo.cat],
        });
      });
    });

    return allRects;
  }, [tools]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="flex items-start justify-center">
      {/* Treemap + sidebar */}
      <div className="flex-1 relative" style={{ paddingBottom: "40%" }}>
        <svg
          viewBox="0 0 1000 500"
          className="absolute inset-0 w-full h-full"
          style={{ borderRadius: 12 }}
        >
          {rects.map(({ tool, x, y, w, h, catColor }) => {
            const isHovered = hoveredId === tool.id;
            const fontSize = w > 150 && h > 70 ? 14 : w > 100 && h > 45 ? 12 : w > 70 ? 10 : 9;
            const nameWidth = tool.name.length * fontSize * 0.58;
            const showLabel = w > 55 && h > 28 && nameWidth < w * 1.3;
            const showVolume = w > 100 && h > 50 && (tool.volume || 0) >= 5000;

            return (
              <g key={tool.id}>
                <a href={tool.route}>
                  <rect
                    x={x + 1.5}
                    y={y + 1.5}
                    width={Math.max(w - 3, 0)}
                    height={Math.max(h - 3, 0)}
                    rx={6}
                    fill={isHovered ? catColor.bg.replace("0.15", "0.3") : catColor.bg}
                    stroke={isHovered ? catColor.text : catColor.border}
                    strokeWidth={isHovered ? 2 : 1}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredId(tool.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                  {showLabel && (
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + (showVolume ? -7 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isHovered ? catColor.text : "var(--dp-text-secondary)"}
                      fontSize={fontSize}
                      fontWeight={500}
                      fontFamily="var(--font-inter), sans-serif"
                      className="pointer-events-none select-none"
                      style={{ transition: "fill 150ms ease" }}
                      clipPath={`inset(0 0 0 0)`}
                    >
                      {(() => {
                        // Shorten long names for small cells
                        const displayName = tool.name
                          .replace("Escape / Unescape", "Esc / Unesc")
                          .replace("Subnet Calculator", "Subnet Calc")
                          .replace("Markdown Preview", "Markdown")
                          .replace("Timezone Converter", "Timezone");
                        return displayName.length * fontSize * 0.55 > w - 10
                          ? displayName.slice(0, Math.floor((w - 20) / (fontSize * 0.55))) + "…"
                          : displayName;
                      })()}
                    </text>
                  )}
                  {showVolume && (
                    <text
                      x={x + w / 2}
                      y={y + h / 2 + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--dp-text-muted)"
                      fontSize={9}
                      fontFamily="var(--font-jetbrains-mono), monospace"
                      className="pointer-events-none select-none"
                    >
                      <tspan fill={tool.trend === "down" ? "#ef4444" : tool.trend === "flat" ? "var(--dp-text-muted)" : "#22c55e"} fontSize={8}>{tool.trend === "down" ? "▼ " : tool.trend === "flat" ? "— " : "▲ "}</tspan>
                      {((tool.volume || 0) / 1000).toFixed(0)}K/mo
                    </text>
                  )}
                </a>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right sidebar nav */}
      <ToolSidebar tools={tools} hoveredId={hoveredId} onHover={setHoveredId} />
      </div>
      {/* Legend + hover info — centered below, independent of sidebar */}
      <div className="flex items-center justify-center gap-6 mt-4 px-2 flex-wrap">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const color = categoryColors[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: color.text, opacity: 0.7 }}
                />
                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-6 flex items-center">
          {hoveredId ? (
            <span className="text-sm text-text-secondary animate-fade-in">
              {tools.find((t) => t.id === hoveredId)?.description}
              <span className="text-text-muted ml-2 text-xs">
                {((tools.find((t) => t.id === hoveredId)?.volume || 0) / 1000).toFixed(0)}K/mo
              </span>
            </span>
          ) : (
            <span className="text-xs text-text-muted font-mono">
              {tools.length} tools · sized by search volume
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
