"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Braces,
  Database,
  Code2,
  Binary,
  Link as LinkIcon,
  FileCode,
  FileCode2,
  KeyRound,
  Clock,
  ArrowLeftRight,
  Hash,
  Table,
  TableProperties,
  Fingerprint,
  ShieldCheck,
  Lock,
  AlignLeft,
  Network,
  Globe,
  GitCompare,
  Pipette,
  Locate,
  Type,
  Globe2,
  Palette,
  CaseSensitive,
  LetterText,
  FileText,
  QrCode,
  FileJson,
  Minimize2,
  Shield,
  Image,
  Link2,
  Terminal,
  TrendingUp,
  TrendingDown,
  Layers,
  Square,
  LayoutGrid,
  Columns2,
  BarChart3,
  ImageDown,
  Star,
  Crop,
  Music,
  Receipt,
  ArrowUpDown,
  FileDown,
  CheckSquare,
  Paintbrush,
  FileJson2,
  ArrowRightLeft,
  Maximize2,
  TreePine,
  Share2,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/lib/tools";

import { ToolSidebar } from "./tool-sidebar";

const iconMap: Record<string, LucideIcon> = {
  Braces, Database, Code2, Binary, Link: LinkIcon, FileCode, FileCode2,
  KeyRound, Clock, ArrowLeftRight, Hash, Table, TableProperties, Fingerprint,
  ShieldCheck, Lock, AlignLeft, Network, Globe, GitCompare, Pipette, Locate,
  Type, Globe2, Palette, CaseSensitive, LetterText, FileText, QrCode, FileJson,
  Minimize2, Shield, Image, Link2, Terminal,
  Layers, Square, LayoutGrid, Columns2,
  BarChart3, ImageDown, Star, Crop,
  Music, Receipt, ArrowUpDown, FileDown, CheckSquare,
  Paintbrush, FileJson2, ArrowRightLeft, Maximize2, TreePine, Share2, Mail,
};

/** Format volume: 823000 → "823K", 1200 → "1.2K" */
function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(vol % 1000000 === 0 ? 0 : 1)}M`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(vol % 1000 === 0 ? 0 : 1)}K`;
  return vol.toString();
}

/** Minimum monthly volume to appear on globe (smaller tools only in sidebar) */
const GLOBE_MIN_VOLUME = 3000;

function fibonacciSpherePoint(idx: number, total: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const theta = goldenAngle * idx;
  const phi = Math.acos(1 - (2 * (idx + 0.5)) / total);
  return {
    yDeg: ((theta * 180) / Math.PI) % 360,
    xDeg: (phi * 180) / Math.PI - 90,
  };
}

interface GlobeLayoutProps {
  tools: Tool[];
}

export function GlobeLayout({ tools }: GlobeLayoutProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Only show tools above volume threshold on globe; all tools in sidebar
  const globeTools = tools.filter((t) => (t.volume ?? 0) >= GLOBE_MIN_VOLUME);
  const RADIUS = 230;
  const n = globeTools.length;
  const positions = globeTools.map((_, idx) => fibonacciSpherePoint(idx, n));


  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      {/* Main layout: globe centered, sidebar right */}
      <div className="flex items-start justify-center">
        {/* Globe — centered */}
        <div className="flex flex-col items-center flex-1">
          {/* Atmospheric glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 440,
              marginTop: 40,
              background:
                "radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)",
            }}
          />

          {/* 3D Globe Scene */}
          <div
            className="globe-scene relative"
            style={{ width: 560, height: 500 }}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="globe-sphere"
              style={{ width: "100%", height: "100%" }}
            >
              {globeTools.map((tool, idx) => {
                const { yDeg, xDeg } = positions[idx];
                const Icon = iconMap[tool.icon] || Braces;
                const isHovered = hoveredId === tool.id;
                const vol = tool.volume ?? 0;

                return (
                  <div
                    key={tool.id}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: `rotateY(${yDeg}deg) rotateX(${xDeg}deg) translateZ(${RADIUS}px)`,
                    }}
                  >
                    <Link
                      href={tool.route}
                      className={`globe-card-inner ${
                        isHovered ? "globe-card-highlighted" : ""
                      }`}
                      style={{ transform: "translate(-50%, -50%)" }}
                      onMouseEnter={() => setHoveredId(tool.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      title={tool.description}
                    >
                      <div className="globe-card-content">
                        <Icon
                          size={13}
                          style={{ color: "var(--dp-accent)", flexShrink: 0 }}
                        />
                        <span className="globe-card-name">{tool.name}</span>
                        {vol > 0 && (
                          <span className="globe-card-volume">
                            {tool.trend === "down" ? (
                              <TrendingDown size={9} style={{ color: "var(--dp-error)" }} />
                            ) : (
                              <TrendingUp size={9} style={{ color: "var(--dp-success)" }} />
                            )}
                            {formatVolume(vol)}/mo
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description / count — centered under globe */}
          <div className="w-full flex items-center justify-center mt-8" style={{ maxWidth: 560 }}>
            {hoveredId ? (
              <span className="text-sm text-text-secondary bg-card-bg border border-card-border rounded-lg px-4 py-1.5 inline-block animate-fade-in">
                {tools.find((t) => t.id === hoveredId)?.description}
              </span>
            ) : (
              <p className="text-xs text-text-muted font-mono text-center">
                {tools.length} tools · click to use
              </p>
            )}
          </div>
        </div>

        {/* Right sidebar nav */}
        <ToolSidebar tools={tools} hoveredId={hoveredId} onHover={setHoveredId} />
      </div>
    </div>
  );
}
