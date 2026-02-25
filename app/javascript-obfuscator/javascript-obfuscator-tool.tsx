"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";
import { Trash2 } from "lucide-react";

const SAMPLE_JS = `function calculateTotal(items, taxRate) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    total += item.price * item.quantity;
  }
  const tax = total * taxRate;
  const finalAmount = total + tax;
  return { total, tax, finalAmount };
}

const cart = [
  { name: "Widget", price: 9.99, quantity: 3 },
  { name: "Gadget", price: 24.99, quantity: 1 },
];

const result = calculateTotal(cart, 0.08);
console.log("Total:", result.finalAmount);`;

// Simple identifier renamer
function obfuscate(code: string, opts: ObfuscateOptions): string {
  let result = code;

  // Step 1: Remove comments
  if (opts.removeComments) {
    result = result.replace(/\/\/[^\n]*/g, "");
    result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  // Step 2: Rename variables/functions
  if (opts.renameVars) {
    // Collect declared identifiers (let, const, var, function declarations, params)
    const identifiers = new Map<string, string>();
    let counter = 0;

    const genName = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const name = `_0x${(counter++).toString(16).padStart(3, "0")}`;
      void chars;
      return name;
    };

    // Find all identifiers declared with let/const/var/function/param patterns
    const declPattern = /\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const funcPattern = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

    let m: RegExpExecArray | null;
    while ((m = declPattern.exec(result)) !== null) {
      const id = m[2];
      if (!identifiers.has(id) && !RESERVED.has(id)) {
        identifiers.set(id, genName());
      }
    }
    declPattern.lastIndex = 0;

    while ((m = funcPattern.exec(result)) !== null) {
      const id = m[1];
      if (!identifiers.has(id) && !RESERVED.has(id)) {
        identifiers.set(id, genName());
      }
    }
    funcPattern.lastIndex = 0;

    // Replace all occurrences (word-boundary)
    identifiers.forEach((newName, oldName) => {
      result = result.replace(new RegExp(`\\b${escapeRe(oldName)}\\b`, "g"), newName);
    });
  }

  // Step 3: Encode strings
  if (opts.encodeStrings) {
    result = result.replace(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g, (match) => {
      const inner = match.slice(1, -1);
      const encoded = Array.from(inner)
        .map((c) => "\\x" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
      return `"${encoded}"`;
    });
  }

  // Step 4: Remove whitespace / minify
  if (opts.removeWhitespace) {
    // Remove leading/trailing whitespace per line, collapse blank lines
    result = result
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join(";")
      // Clean up double semicolons
      .replace(/;{2,}/g, ";")
      .replace(/;\}/g, "}")
      .replace(/\{;/g, "{")
      .replace(/;{/g, "{")
      .replace(/};/g, "}")
      .replace(/\);/g, ")")
      .replace(/\),/g, ",")
      // Spaces around operators are kept for validity
      .replace(/\s*([=+\-*/<>!&|,{}()\[\];:])\s*/g, "$1")
      .replace(/\s+/g, " ");
  }

  return result;
}

const RESERVED = new Set([
  "break","case","catch","continue","debugger","default","delete","do","else",
  "finally","for","function","if","in","instanceof","new","return","switch",
  "this","throw","try","typeof","var","void","while","with","class","const",
  "enum","export","extends","import","super","implements","interface","let",
  "package","private","protected","public","static","yield","null","true",
  "false","undefined","NaN","Infinity","console","window","document","Math",
  "JSON","Object","Array","String","Number","Boolean","Date","RegExp","Error",
  "Promise","Symbol","Map","Set","WeakMap","WeakSet","parseInt","parseFloat",
  "isNaN","isFinite","encodeURIComponent","decodeURIComponent","setTimeout",
  "setInterval","clearTimeout","clearInterval","fetch","async","await","of",
  "from","length","push","pop","shift","unshift","splice","slice","map",
  "filter","reduce","forEach","indexOf","find","includes","join","split",
  "toString","valueOf","hasOwnProperty","prototype","constructor","log",
  "warn","error","info","require","module","exports","__dirname","__filename",
]);

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ObfuscateOptions {
  renameVars: boolean;
  removeWhitespace: boolean;
  encodeStrings: boolean;
  removeComments: boolean;
}

export function JavascriptObfuscatorTool() {
  useWebMCP({
    name: "obfuscateJS",
    description: "Obfuscate JavaScript code",
    inputSchema: {
      type: "object" as const,
      properties: {
      "code": {
            "type": "string",
            "description": "JavaScript to obfuscate"
      }
},
      required: ["code"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for JS obfuscation" }] };
    },
  });

  const [input, setInput] = useState(SAMPLE_JS);
  const [opts, setOpts] = useState<ObfuscateOptions>({
    renameVars: true,
    removeWhitespace: true,
    encodeStrings: true,
    removeComments: true,
  });
  const [error, setError] = useState("");

  let output = "";
  if (input.trim()) {
    try {
      output = obfuscate(input, opts);
      if (error) setError("");
    } catch (e) {
      output = "";
      if ((e as Error).message !== error) setTimeout(() => setError((e as Error).message), 0);
    }
  }

  const toggle = (k: keyof ObfuscateOptions) =>
    setOpts((o) => ({ ...o, [k]: !o[k] }));

  const originalSize = new Blob([input]).size;
  const obfSize = new Blob([output]).size;
  const savings = originalSize > 0 ? Math.round(((originalSize - obfSize) / originalSize) * 100) : 0;

  return (
    <ToolLayout agentReady
      title="JavaScript Obfuscator"
      description="Obfuscate JavaScript code to make it harder to read. Renames variables, removes whitespace, and encodes strings. 100% client-side."
    >
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-border-subtle">
        {(
          [
            { key: "renameVars", label: "Rename variables" },
            { key: "removeWhitespace", label: "Remove whitespace" },
            { key: "encodeStrings", label: "Encode strings" },
            { key: "removeComments", label: "Remove comments" },
          ] as { key: keyof ObfuscateOptions; label: string }[]
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={() => toggle(key)}
              className="w-4 h-4 accent-emerald-600"
            />
            {label}
          </label>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setInput(""); setError(""); }} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
          <CopyButton text={output} />
        </div>
      </div>

      {output && (
        <div className="flex gap-4 text-xs text-text-ghost mb-3 font-mono">
          <span>Original: {originalSize.toLocaleString()} bytes</span>
          <span>Obfuscated: {obfSize.toLocaleString()} bytes</span>
          {savings > 0 && <span className="text-emerald-600 dark:text-emerald-400">−{savings}% size</span>}
        </div>
      )}

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="pane-label">JavaScript Input</div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Paste JavaScript code here…"
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="pane-label">Obfuscated Output</div>
            <div className="output-panel flex-1">
              {error ? (
                <span className="text-[var(--dp-error)] text-xs font-mono">{error}</span>
              ) : output ? (
                <pre className="text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary animate-fade-in">
                  {output}
                </pre>
              ) : (
                <span className="text-text-ghost font-mono text-[13px]">
                  Obfuscated code will appear here…
                </span>
              )}
            </div>
          </div>
        }
      />

      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          ⚠️ This tool provides basic obfuscation, not security. Determined attackers can still reverse-engineer obfuscated code. For sensitive logic, use server-side code.
        </p>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JS/TS Formatter", href: "/js-formatter" },
            { name: "HTML Minifier", href: "/html-minifier" },
            { name: "Code Minifier", href: "/js-minifier" },
            { name: "Base64 Encoder", href: "/base64" },
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
