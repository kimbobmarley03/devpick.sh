"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  type LucideIcon,
} from "lucide-react";
import type { Tool } from "@/lib/tools";

const iconMap: Record<string, LucideIcon> = {
  Braces,
  Database,
  Code2,
  Binary,
  Link: LinkIcon,
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
};

function LiveTimestamp() {
  const [ts, setTs] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{ts || "..."}</span>;
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] || Braces;
  const isFeatured = tool.size === "featured";
  const isMedium = tool.size === "medium";

  return (
    <Link
      href={tool.route}
      className={`card-terminal block p-0 cursor-pointer group no-underline
        ${isFeatured ? "col-span-2 row-span-2" : ""}
        ${isMedium ? "row-span-1" : ""}
      `}
    >
      {/* Terminal title bar */}
      <div className="terminal-dots">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
      </div>

      {/* Content */}
      <div className={`p-4 ${isFeatured ? "p-5" : ""}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon
              size={isFeatured ? 18 : 15}
              className="text-accent flex-shrink-0 mt-0.5"
            />
            <h3
              className={`font-semibold text-text-primary leading-tight ${
                isFeatured ? "text-base" : "text-sm"
              }`}
            >
              {tool.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-text-dimmed mb-3 leading-relaxed">
          {tool.description}
        </p>

        {/* Preview */}
        {tool.preview && (
          <div
            className={`preview-text text-[11px] leading-relaxed whitespace-pre-wrap break-all ${
              isFeatured ? "text-xs" : ""
            }`}
          >
            {tool.live ? (
              <span className="text-accent">
                unix: <LiveTimestamp />
              </span>
            ) : tool.id === "diff" ? (
              <span>
                <span className="text-success">+ added line</span>
                {"\n"}
                <span className="text-error">- removed line</span>
              </span>
            ) : tool.id === "json" ? (
              <span>
                {"{\n"}
                {'  "name": "devpick",\n'}
                {'  "tools": 36\n'}
                {"}"}
              </span>
            ) : (
              tool.preview
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
