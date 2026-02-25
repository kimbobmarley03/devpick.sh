"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog.

This is a second paragraph with multiple sentences. It contains several words. Here is another sentence.

A third paragraph appears here.`;

function countStats(text: string, withSpaces: boolean) {
  const chars = withSpaces ? text.length : text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) ?? []).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const lines = text ? text.split("\n").length : 0;
  const readingTime = Math.max(1, Math.round(words / 200));
  return { chars, words, sentences, paragraphs, lines, readingTime };
}

function getFrequency(text: string): [string, number][] {
  const freq: Record<string, number> = {};
  for (const ch of text.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) freq[ch] = (freq[ch] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

export function CounterTool() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [withSpaces, setWithSpaces] = useState(true);

  const stats = useMemo(() => countStats(text, withSpaces), [text, withSpaces]);
  const freq = useMemo(() => getFrequency(text), [text]);

  const maxFreq = freq[0]?.[1] ?? 1;

  const STAT_ITEMS = [
    { label: "Characters", value: stats.chars, accent: "#3b82f6" },
    { label: "Words", value: stats.words, accent: "#22c55e" },
    { label: "Sentences", value: stats.sentences, accent: "#f59e0b" },
    { label: "Paragraphs", value: stats.paragraphs, accent: "#a78bfa" },
    { label: "Lines", value: stats.lines, accent: "#f43f5e" },
    {
      label: "Reading Time",
      value: `${stats.readingTime} min`,
      accent: "#06b6d4",
    },
  ];

  return (
    <ToolLayout
      title="Character & Word Counter"
      description="Real-time character, word, sentence, and paragraph counting with reading time estimate"
    >
      {/* Toggle + clear */}
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={withSpaces}
            onChange={(e) => setWithSpaces(e.target.checked)}
            className="accent-blue-500"
          />
          <span className="text-sm text-text-secondary">Count spaces in characters</span>
        </label>
        <div className="ml-auto">
          <button onClick={() => setText("")} className="action-btn">
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing or paste your text here..."
        className="tool-textarea w-full mb-5"
        style={{ minHeight: "180px" }}
        spellCheck={false}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.label}
            className="bg-card-bg border border-card-border rounded-xl p-3 text-center"
          >
            <div
              className="text-2xl font-bold font-mono mb-1"
              style={{ color: item.accent }}
            >
              {item.value}
            </div>
            <div className="text-xs text-text-dimmed">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Character frequency */}
      {freq.length > 0 && (
        <div className="bg-card-bg border border-card-border rounded-xl p-4">
          <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider mb-3">
            Character Frequency (Top 10)
          </div>
          <div className="space-y-2">
            {freq.map(([ch, count]) => (
              <div key={ch} className="flex items-center gap-3">
                <div className="font-mono text-sm text-text-primary w-6 text-center">{ch}</div>
                <div className="flex-1 bg-output-bg rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / maxFreq) * 100}%`,
                      background: "#3b82f6",
                    }}
                  />
                </div>
                <div className="text-xs text-text-dimmed font-mono w-10 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* FAQ Section */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How do I count words online?", a: "Paste your text into the input box and the word count updates instantly. Words are counted by splitting on whitespace — consecutive spaces and newlines are treated as a single separator." },
            { q: "What is a good reading time?", a: "The average adult reads about 200-250 words per minute. Our tool calculates reading time based on 200 words per minute, so a 1,000-word article takes approximately 5 minutes to read." },
            { q: "How are characters counted?", a: "Characters are counted including spaces and punctuation. We also show a separate count for characters without spaces, which is useful for social media character limits." },
            { q: "What is the difference between words and sentences?", a: "Words are sequences of characters separated by whitespace. Sentences are counted by detecting ending punctuation (periods, exclamation marks, question marks) followed by a space or end of text." },
          ].map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Lorem Ipsum", href: "/lorem-ipsum-generator" },
            { name: "Case Converter", href: "/case-converter" },
            { name: "Markdown Preview", href: "/markdown-preview" },
            { name: "Text Sort & Dedupe", href: "/text-sort" },
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
