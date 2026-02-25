"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2, AlertCircle } from "lucide-react";

type Mode = "format" | "minify";

const INDENT = "  "; // 2 spaces

function formatXML(raw: string): string {
  // Use DOMParser to parse and re-serialize
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "application/xml");

  // Check for parse errors
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error(errorNode.textContent || "Invalid XML");
  }

  return serializeNode(doc.documentElement, 0);
}

function serializeNode(node: Node, depth: number): string {
  const indent = INDENT.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || "").trim();
    return text ? indent + text : "";
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${indent}<!--${node.textContent}-->`;
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction;
    return `${indent}<?${pi.target} ${pi.data}?>`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tagName = el.tagName;

  // Build attribute string
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${escapeXml(a.value)}"`)
    .join("");

  const children = Array.from(el.childNodes);

  if (children.length === 0) {
    return `${indent}<${tagName}${attrs}/>`;
  }

  // Check if content is purely text (no child elements)
  const hasElements = children.some((c) => c.nodeType === Node.ELEMENT_NODE);
  if (!hasElements) {
    const text = (el.textContent || "").trim();
    if (!text) return `${indent}<${tagName}${attrs}/>`;
    return `${indent}<${tagName}${attrs}>${escapeXml(text)}</${tagName}>`;
  }

  // Has child elements — serialize each on its own line
  const childLines: string[] = [];
  for (const child of children) {
    const serialized = serializeNode(child, depth + 1);
    if (serialized.trim()) {
      childLines.push(serialized);
    }
  }

  if (childLines.length === 0) {
    return `${indent}<${tagName}${attrs}/>`;
  }

  return `${indent}<${tagName}${attrs}>\n${childLines.join("\n")}\n${indent}</${tagName}>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function minifyXML(raw: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "application/xml");

  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error(errorNode.textContent || "Invalid XML");
  }

  // Serialize without any whitespace formatting
  const serializer = new XMLSerializer();
  return serializer
    .serializeToString(doc)
    .replace(/\s*\n\s*/g, "")
    .replace(/>\s+</g, "><")
    .trim();
}

function getXmlError(raw: string): string | null {
  if (!raw.trim()) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, "application/xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
      // Extract a short error message
      const text = errorNode.textContent || "Invalid XML";
      const firstLine = text.split("\n")[0].trim();
      return firstLine.slice(0, 200);
    }
    return null;
  } catch {
    return "Failed to parse XML";
  }
}

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog><book id="1"><title>Clean Code</title><author>Robert C. Martin</author><year>2008</year></book><book id="2"><title>The Pragmatic Programmer</title><author>David Thomas</author><year>1999</year></book></catalog>`;

export function XmlTool() {
  useWebMCP({
    name: "formatXML",
    description: "Format and prettify XML",
    inputSchema: {
      type: "object" as const,
      properties: {
      "xml": {
            "type": "string",
            "description": "XML string to format"
      }
},
      required: ["xml"],
    },
    execute: async (params) => {
      try { const parser = new DOMParser(); const doc = parser.parseFromString(params.xml as string, "text/xml"); const s = new XMLSerializer(); return { content: [{ type: "text", text: s.serializeToString(doc) }] }; } catch { return { content: [{ type: "text", text: "Error: Invalid XML" }] }; }
    },
  });

  const [mode, setMode] = useState<Mode>("format");
  const [input, setInput] = useState(SAMPLE_XML);

  const xmlError = getXmlError(input);

  const output = (() => {
    if (!input.trim()) return "";
    if (xmlError) return "";
    try {
      return mode === "format" ? formatXML(input) : minifyXML(input);
    } catch (e) {
      return `⚠ ${e instanceof Error ? e.message : "Failed to process XML"}`;
    }
  })();

  return (
    <ToolLayout agentReady
      title="XML Formatter"
      description="Beautify or minify XML — validates syntax and formats with proper indentation"
    >
      {/* Tabs + Actions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["format", "minify"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`tab-btn capitalize ${mode === m ? "active" : ""}`}
          >
            {m}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      {/* Validation error banner */}
      {xmlError && input.trim() && (
        <div className="flex items-start gap-2 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-sm text-red-300 font-mono">{xmlError}</span>
        </div>
      )}

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              XML Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your XML here..."
              className={`tool-textarea flex-1 ${xmlError && input.trim() ? "border-red-500/40" : ""}`}
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">
              {mode === "format" ? "Formatted XML" : "Minified XML"}
            </div>
            <div className="output-panel flex-1">
              {output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap text-text-primary">
                  {output}
                </pre>
              ) : xmlError && input.trim() ? (
                <span className="text-red-400 font-mono text-[13px]">Fix the XML error to see output</span>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Output will appear here...
                </span>
              )}
            </div>
          </div>
        }
      />
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "SQL Formatter", href: "/sql-formatter" },
            { name: "HTML Entities", href: "/html-entities" },
            { name: "YAML to JSON", href: "/yaml-formatter" },
            { name: "JSON Formatter", href: "/json-formatter" },
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
