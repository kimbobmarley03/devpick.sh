"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

const SAMPLE_TEXT = `Search engine optimization (SEO) is the practice of increasing the quantity and quality of traffic to your website through organic search engine results. SEO is important because search engines like Google want to provide the best service for their users. Good SEO practices help search engines understand your content and rank it appropriately. Keyword research is a fundamental SEO skill. By finding the right keywords, you can optimize your content to rank higher in search results. SEO takes time and consistent effort, but the results are worth it.`;

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","been","but","by","for","from","had","has","have",
  "he","her","him","his","how","i","if","in","is","it","its","just","me","my","no","not",
  "of","on","or","our","out","she","so","that","the","their","them","then","there","they",
  "this","to","up","us","was","we","were","what","which","who","will","with","you","your",
  "about","after","all","also","back","because","can","come","could","do","does","each",
  "even","get","go","into","just","like","make","more","most","much","now","only","other",
  "over","said","same","should","some","than","these","think","those","through","time",
  "two","way","when","where","while","who","why","would",
]);

export function KeywordDensityCheckerTool() {
  useWebMCP({
    name: "checkKeywordDensity",
    description: "Analyze keyword density in text",
    inputSchema: {
      type: "object" as const,
      properties: {
      "text": {
            "type": "string",
            "description": "Text to analyze"
      }
},
      required: ["text"],
    },
    execute: async (params) => {
      const words = (params.text as string).toLowerCase().split(/\s+/).filter(Boolean); const freq: Record<string,number> = {}; words.forEach(w => freq[w] = (freq[w]||0)+1); const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 10); return { content: [{ type: "text", text: JSON.stringify(top.map(([w,c]) => ({ word: w, count: c, density: (c/words.length*100).toFixed(1)+"%" })), null, 2) }] };
    },
  });

  const [text, setText] = useState(SAMPLE_TEXT);
  const [minLength, setMinLength] = useState(3);
  const [showStopWords, setShowStopWords] = useState(false);
  const [ngramSize, setNgramSize] = useState<1 | 2 | 3>(1);

  const analysis = useMemo(() => {
    if (!text.trim()) return null;

    const clean = text.toLowerCase().replace(/[^a-z0-9'\s-]/g, " ");
    const words = clean.split(/\s+/).filter((w) => w.length >= minLength);
    const totalWords = words.length;

    if (totalWords === 0) return null;

    // N-gram frequency
    const freq: Record<string, number> = {};
    for (let i = 0; i <= words.length - ngramSize; i++) {
      const gram = words.slice(i, i + ngramSize).join(" ");
      if (!showStopWords && ngramSize === 1 && STOP_WORDS.has(words[i])) continue;
      freq[gram] = (freq[gram] ?? 0) + 1;
    }

    const sorted = Object.entries(freq).sort(([, a], [, b]) => b - a);

    // Character stats
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim()).length;

    return {
      words: sorted,
      totalWords: words.length,
      uniqueWords: Object.keys(freq).length,
      charCount,
      charNoSpaces,
      sentences,
      paragraphs,
    };
  }, [text, minLength, showStopWords, ngramSize]);

  const maxCount = analysis?.words[0]?.[1] ?? 1;

  return (
    <ToolLayout agentReady
      title="Keyword Density Checker"
      description="Analyze keyword frequency and density in your text. Essential for SEO optimization."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="pane-label">Text Input</div>
            <button onClick={() => setText("")} className="action-btn">
              <Trash2 size={13} />
              Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to analyze keyword density…"
            className="tool-textarea w-full"
            rows={16}
          />

          {/* Options */}
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              Min word length:
              <select
                value={minLength}
                onChange={(e) => setMinLength(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none"
              >
                {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              Keywords:
              <select
                value={ngramSize}
                onChange={(e) => setNgramSize(Number(e.target.value) as 1 | 2 | 3)}
                className="px-2 py-1 text-xs border border-border-subtle rounded bg-surface-raised text-text-primary focus:outline-none"
              >
                <option value={1}>Single words</option>
                <option value={2}>2-word phrases</option>
                <option value={3}>3-word phrases</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showStopWords}
                onChange={(e) => setShowStopWords(e.target.checked)}
                className="w-3 h-3 accent-emerald-600"
              />
              Include stop words
            </label>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="pane-label mb-2">Analysis</div>

          {!analysis ? (
            <div className="text-text-ghost text-sm">Results will appear here…</div>
          ) : (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total Words", value: analysis.totalWords.toLocaleString() },
                  { label: "Unique Keywords", value: analysis.uniqueWords.toLocaleString() },
                  { label: "Characters", value: analysis.charCount.toLocaleString() },
                  { label: "Chars (no spaces)", value: analysis.charNoSpaces.toLocaleString() },
                  { label: "Sentences", value: analysis.sentences.toLocaleString() },
                  { label: "Paragraphs", value: analysis.paragraphs.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle">
                    <div className="text-xs text-text-ghost">{label}</div>
                    <div className="text-lg font-bold text-text-primary font-mono">{value}</div>
                  </div>
                ))}
              </div>

              {/* Keyword table */}
              <div className="rounded-lg border border-border-subtle overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-800 px-3 py-2 grid grid-cols-[1fr_60px_80px_80px] text-xs font-semibold text-text-secondary">
                  <span>Keyword</span>
                  <span className="text-center">Count</span>
                  <span className="text-center">Density</span>
                  <span className="text-center">Relative</span>
                </div>
                <div className="overflow-y-auto max-h-[400px] divide-y divide-border-subtle">
                  {analysis.words.slice(0, 50).map(([word, count]) => {
                    const density = ((count / analysis.totalWords) * 100).toFixed(2);
                    const relative = (count / maxCount) * 100;
                    return (
                      <div
                        key={word}
                        className="px-3 py-2 grid grid-cols-[1fr_60px_80px_80px] items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <span className="text-xs font-mono text-text-primary truncate">{word}</span>
                        <span className="text-xs font-mono text-text-secondary text-center">{count}</span>
                        <span className="text-xs font-mono text-accent text-center">{density}%</span>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${relative}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Readability Checker", href: "/readability-checker" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Text Sort & Dedupe", href: "/text-sort" },
            { name: "Text Compare", href: "/text-compare" },
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
