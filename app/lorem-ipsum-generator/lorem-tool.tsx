"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { RefreshCw } from "lucide-react";

type Unit = "paragraphs" | "sentences" | "words";

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit",
  "sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore",
  "magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation",
  "ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat","duis",
  "aute","irure","in","reprehenderit","voluptate","velit","esse","cillum",
  "fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non",
  "proident","sunt","culpa","qui","officia","deserunt","mollit","anim","id","est",
  "laborum","perspiciatis","unde","omnis","iste","natus","error","accusantium",
  "doloremque","laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab",
  "inventore","veritatis","architecto","beatae","vitae","dicta","explicabo",
  "nemo","ipsam","voluptatem","quia","voluptas","aspernatur","aut","odit","fugit",
  "sed","quia","consequuntur","magni","dolores","eos","ratione","sequi","nesciunt",
  "neque","porro","quisquam","qui","dolorem","ipsum","quia","dolor","sit","amet",
  "adipisci","velit","numquam","eius","modi","tempora","incidunt","ut","labore",
  "magnam","aliquam","quaerat","voluptatem","facilis","distinctio","nam","libero",
];

const CLASSIC_OPENING =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return LOREM_WORDS[randInt(0, LOREM_WORDS.length - 1)];
}

function generateSentence(): string {
  const wordCount = randInt(8, 20);
  const words = Array.from({ length: wordCount }, (_, i) => {
    const w = randomWord();
    return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  return words.join(" ") + ".";
}

function generateParagraph(classic: boolean, index: number): string {
  const sentenceCount = randInt(4, 8);
  const sentences = Array.from({ length: sentenceCount }, (_, i) => {
    if (classic && index === 0 && i === 0) return CLASSIC_OPENING;
    return generateSentence();
  });
  return sentences.join(" ");
}

function generate(unit: Unit, count: number, classic: boolean): string {
  const n = Math.max(1, Math.min(count, unit === "paragraphs" ? 20 : unit === "sentences" ? 100 : 500));

  if (unit === "paragraphs") {
    return Array.from({ length: n }, (_, i) => generateParagraph(classic, i)).join("\n\n");
  }
  if (unit === "sentences") {
    const sentences = Array.from({ length: n }, (_, i) => {
      if (classic && i === 0) return CLASSIC_OPENING;
      return generateSentence();
    });
    return sentences.join(" ");
  }
  // words
  const words = Array.from({ length: n }, (_, i) => {
    if (classic && i === 0) return "Lorem";
    if (classic && i === 1) return "ipsum";
    return randomWord();
  });
  return words.join(" ");
}

const UNIT_MAX: Record<Unit, number> = {
  paragraphs: 20,
  sentences: 100,
  words: 500,
};

export function LoremTool() {
  useWebMCP({
    name: "generateLoremIpsum",
    description: "Generate placeholder lorem ipsum text",
    inputSchema: {
      type: "object" as const,
      properties: {
      "paragraphs": {
            "type": "string",
            "description": "Number of paragraphs (default 3)"
      }
},
      required: [],
    },
    execute: async (params) => {
      const n = Math.min((params.paragraphs as number) || 3, 20); const p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."; return { content: [{ type: "text", text: Array(n).fill(p).join("\n\n") }] };
    },
  });

  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [output, setOutput] = useState(() => generate("paragraphs", 3, true));

  const handleGenerate = () => {
    setOutput(generate(unit, count, classic));
  };

  const wordCount = output.split(/\s+/).filter(Boolean).length;
  const charCount = output.length;

  return (
    <ToolLayout agentReady
      title="Lorem Ipsum Generator"
      description="Generate placeholder text — paragraphs, sentences, or words on demand"
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`tab-btn capitalize ${unit === u ? "active" : ""}`}
          >
            {u}
          </button>
        ))}

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.min(parseInt(e.target.value) || 1, UNIT_MAX[unit]))}
            min={1}
            max={UNIT_MAX[unit]}
            className="tool-textarea text-center"
            style={{ width: "70px", height: "34px", padding: "6px 8px", resize: "none" }}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={classic}
            onChange={(e) => setClassic(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-sm text-text-secondary">Classic lorem ipsum</span>
        </label>

        <button onClick={handleGenerate} className="action-btn primary">
          <RefreshCw size={13} />
          Generate
        </button>

        <div className="ml-auto">
          <CopyButton text={output} />
        </div>
      </div>

      {/* Output */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5">
        <p className="text-[14px] text-text-muted leading-[1.8] whitespace-pre-wrap font-sans">
          {output}
        </p>
      </div>

      <p className="text-xs text-text-muted mt-3 text-right font-mono">
        {wordCount} words · {charCount} chars
      </p>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Word Counter", href: "/character-counter" },
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "Slug Generator", href: "/slug-generator" },
            { name: "Case Converter", href: "/case-converter" },
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
