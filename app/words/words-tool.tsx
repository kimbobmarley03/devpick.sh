"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

// ── Stop words (ignore in keyword density) ────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","it","its","this","that","was","are","be","by","as","not","from",
  "have","has","had","i","you","he","she","we","they","do","did","will",
  "would","could","should","can","may","might","then","than","so","if",
  "no","my","your","his","her","our","their","up","out","into",
]);

// ── Stats computation ─────────────────────────────────────────────────────────

function computeStats(text: string) {
  if (!text) {
    return {
      words: 0, chars: 0, charsNoSpaces: 0,
      sentences: 0, paragraphs: 0, lines: 0,
      readingMin: 0, speakingMin: 0,
      topWords: [] as { word: string; count: number; pct: number }[],
    };
  }

  const words = text.match(/\b\w+\b/g) ?? [];
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = (text.match(/[.!?]+\s*/g) ?? []).length || (text.trim() ? 1 : 0);
  const lines = text.split("\n").length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);

  const wpm = 238; // average reading speed
  const spm = 150; // average speaking speed
  const readingMin = Math.ceil(words.length / wpm * 10) / 10;
  const speakingMin = Math.ceil(words.length / spm * 10) / 10;

  // Keyword frequency (exclude stop words)
  const freq: Record<string, number> = {};
  for (const w of words) {
    const lw = w.toLowerCase();
    if (!STOP_WORDS.has(lw) && lw.length > 1) {
      freq[lw] = (freq[lw] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topTotal = sorted.reduce((s, [, c]) => s + c, 0);
  const topWords = sorted.map(([word, count]) => ({
    word,
    count,
    pct: topTotal ? Math.round((count / topTotal) * 100) : 0,
  }));

  return { words: words.length, chars, charsNoSpaces, sentences, paragraphs, lines, readingMin, speakingMin, topWords };
}

function fmtTime(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WordsTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => computeStats(text), [text]);

  return (
    <ToolLayout
      title="Word Counter"
      description="Real-time word, character, and sentence counter with reading time"
    >
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Textarea */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Text Input</span>
            <button onClick={() => setText("")} className="action-btn">
              <Trash2 size={13} />
              Clear
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here…"
            className="tool-textarea flex-1"
            style={{ minHeight: "400px" }}
            spellCheck
          />
        </div>

        {/* Stats panel */}
        <div className="lg:w-72 space-y-4">
          {/* Primary stats */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-3">
            {[
              { label: "Words", value: stats.words.toLocaleString() },
              { label: "Characters", value: stats.chars.toLocaleString() },
              { label: "Characters (no spaces)", value: stats.charsNoSpaces.toLocaleString() },
              { label: "Sentences", value: stats.sentences.toLocaleString() },
              { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
              { label: "Lines", value: stats.lines.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-text-dimmed">{label}</span>
                <span className="font-mono text-sm text-text-primary font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {/* Time estimates */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-3">
            <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider mb-1">Time Estimates</div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-dimmed">Reading time</span>
              <span className="font-mono text-sm text-blue-400 font-semibold">{fmtTime(stats.readingMin)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-dimmed">Speaking time</span>
              <span className="font-mono text-sm text-purple-400 font-semibold">{fmtTime(stats.speakingMin)}</span>
            </div>
            <p className="text-[10px] text-text-muted mt-1">Based on 238 wpm reading, 150 wpm speaking</p>
          </div>

          {/* Keyword density */}
          {stats.topWords.length > 0 && (
            <div className="bg-card-bg border border-card-border rounded-xl p-4">
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider mb-3">
                Top Keywords
              </div>
              <div className="space-y-2">
                {stats.topWords.map(({ word, count, pct }) => (
                  <div key={word}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-text-primary">{word}</span>
                      <span className="text-text-dimmed">{count}× ({pct}%)</span>
                    </div>
                    <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Readability Checker", href: "/readability-checker" },
            { name: "Case Converter", href: "/case-converter" },
            { name: "Slug Generator", href: "/slug-generator" },
            { name: "Lorem Ipsum Generator", href: "/lorem-ipsum-generator" },
            { name: "Markdown to HTML", href: "/markdown-to-html" },
            { name: "Regex Cheat Sheet", href: "/regex-cheat-sheet" },
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
