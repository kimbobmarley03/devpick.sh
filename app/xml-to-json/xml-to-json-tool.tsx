"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

function xmlNodeToObject(node: Element): unknown {
  const obj: Record<string, unknown> = {};

  // Add attributes
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    obj[`@${attr.name}`] = attr.value;
  }

  const children = Array.from(node.childNodes);
  const elementChildren = children.filter((n) => n.nodeType === Node.ELEMENT_NODE) as Element[];
  const textChildren = children.filter(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
  );

  if (elementChildren.length === 0) {
    // Leaf node
    const text = node.textContent?.trim() ?? "";
    if (Object.keys(obj).length === 0) {
      // Just return the text value
      return text || null;
    }
    if (text) obj["#text"] = text;
    return obj;
  }

  // Group children by tag name
  const tagGroups: Record<string, Element[]> = {};
  for (const child of elementChildren) {
    const tag = child.tagName;
    if (!tagGroups[tag]) tagGroups[tag] = [];
    tagGroups[tag].push(child);
  }

  for (const [tag, els] of Object.entries(tagGroups)) {
    if (els.length === 1) {
      obj[tag] = xmlNodeToObject(els[0]);
    } else {
      obj[tag] = els.map(xmlNodeToObject);
    }
  }

  if (textChildren.length > 0) {
    const text = textChildren.map((n) => n.textContent?.trim()).join(" ").trim();
    if (text) obj["#text"] = text;
  }

  return obj;
}

function convertXmlToJson(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid XML: " + (parseError.textContent?.slice(0, 100) ?? "parse error"));
  }

  const root = doc.documentElement;
  const result: Record<string, unknown> = {};
  result[root.tagName] = xmlNodeToObject(root);
  return JSON.stringify(result, null, 2);
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>9.99</price>
  </book>
  <book category="tech">
    <title lang="en">Clean Code</title>
    <author>Robert C. Martin</author>
    <year>2008</year>
    <price>34.99</price>
  </book>
</bookstore>`;

export function XmlToJsonTool() {
  useWebMCP({
    name: "xmlToJson",
    description: "Convert XML to JSON format",
    inputSchema: {
      type: "object" as const,
      properties: {
      "xml": {
            "type": "string",
            "description": "XML to convert"
      }
},
      required: ["xml"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for XML to JSON" }] };
    },
  });

  const [input, setInput] = useState(SAMPLE);
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      output = convertXmlToJson(input);
      if (error) setError("");
    } catch (e) {
      output = "";
      const msg = (e as Error).message;
      if (msg !== error) setTimeout(() => setError(msg), 0);
    }
  }

  return (
    <ToolLayout agentReady
      title="XML to JSON"
      description="Convert XML to JSON instantly — runs entirely in your browser using the native DOMParser."
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="ml-auto flex gap-2">
          <button onClick={() => setInput("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">XML Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Paste XML here..."
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">JSON Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
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
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSON to YAML", href: "/json-to-yaml" },
            { name: "XML Formatter", href: "/xml-formatter" },
            { name: "CSV to JSON", href: "/csv-to-json" },
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
