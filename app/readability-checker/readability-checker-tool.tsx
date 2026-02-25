"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Trash2 } from "lucide-react";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This is a simple sentence for testing readability scores. Clear writing communicates ideas effectively. Good writers use short sentences and common words. The best prose is easy to read and understand. Avoid unnecessary jargon. Write for your audience. Readability matters for user engagement and comprehension.

Complex sentences with multiple subordinate clauses and technical terminology can significantly reduce the readability of a text, making it harder for average readers to comprehend the intended meaning without considerable cognitive effort and prior domain knowledge.`;

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function countComplexWords(words: string[]): number {
  return words.filter((w) => countSyllables(w) >= 3).length;
}

interface ReadabilityScores {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexWordCount: number;
  avgSyllablesPerWord: number;
  avgWordsPerSentence: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  ari: number;
  letterCount: number;
}

function gradeLabel(grade: number): string {
  if (grade <= 6) return "Elementary";
  if (grade <= 8) return "Middle School";
  if (grade <= 12) return "High School";
  if (grade <= 16) return "College";
  return "Professional";
}

function fleschEaseLabel(score: number): string {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

function analyze(text: string): ReadabilityScores {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, " ").split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const letters = text.replace(/[^a-zA-Z]/g, "").length;

  const W = words.length;
  const S = sentences.length;
  const Sy = syllables;
  const L = letters;
  const CW = countComplexWords(words);

  const ASW = W / Math.max(S, 1);
  const SYW = Sy / Math.max(W, 1);

  // Flesch Reading Ease
  const fre = 206.835 - 1.015 * ASW - 84.6 * SYW;

  // Flesch-Kincaid Grade
  const fk = 0.39 * ASW + 11.8 * SYW - 15.59;

  // Gunning Fog
  const fog = 0.4 * (ASW + (CW / Math.max(W, 1)) * 100);

  // Coleman-Liau (per 100 words)
  const L100 = (L / Math.max(W, 1)) * 100;
  const S100 = (S / Math.max(W, 1)) * 100;
  const cl = 0.0588 * L100 - 0.296 * S100 - 15.8;

  // SMOG
  const smog = W >= 30 ? 1.0430 * Math.sqrt(CW * (30 / Math.max(S, 1))) + 3.1291 : 0;

  // ARI
  const ari = 4.71 * (L / Math.max(W, 1)) + 0.5 * ASW - 21.43;

  return {
    wordCount: W,
    sentenceCount: S,
    syllableCount: Sy,
    complexWordCount: CW,
    avgSyllablesPerWord: parseFloat(SYW.toFixed(2)),
    avgWordsPerSentence: parseFloat(ASW.toFixed(1)),
    fleschReadingEase: parseFloat(Math.min(100, Math.max(0, fre)).toFixed(1)),
    fleschKincaidGrade: parseFloat(Math.max(0, fk).toFixed(1)),
    gunningFog: parseFloat(Math.max(0, fog).toFixed(1)),
    colemanLiau: parseFloat(Math.max(0, cl).toFixed(1)),
    smog: parseFloat(Math.max(0, smog).toFixed(1)),
    ari: parseFloat(Math.max(0, ari).toFixed(1)),
    letterCount: L,
  };
}

function ScoreBar({ value, min, max, inverse = false }: { value: number; min: number; max: number; inverse?: boolean }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const effectivePct = inverse ? 100 - pct : pct;
  const color =
    effectivePct >= 70 ? "bg-emerald-500"
    : effectivePct >= 40 ? "bg-amber-500"
    : "bg-red-500";

  return (
    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReadabilityCheckerTool() {
  const [text, setText] = useState(SAMPLE_TEXT);

  const scores = useMemo(() => {
    if (!text.trim() || text.trim().split(/\s+/).length < 5) return null;
    return analyze(text);
  }, [text]);

  const metrics = scores ? [
    {
      name: "Flesch Reading Ease",
      value: scores.fleschReadingEase,
      display: `${scores.fleschReadingEase} / 100`,
      label: fleschEaseLabel(scores.fleschReadingEase),
      desc: "Higher is easier to read (0–100)",
      min: 0, max: 100, inverse: false,
    },
    {
      name: "Flesch-Kincaid Grade",
      value: scores.fleschKincaidGrade,
      display: `Grade ${scores.fleschKincaidGrade}`,
      label: gradeLabel(scores.fleschKincaidGrade),
      desc: "US school grade level equivalent",
      min: 0, max: 20, inverse: true,
    },
    {
      name: "Gunning Fog",
      value: scores.gunningFog,
      display: `Grade ${scores.gunningFog}`,
      label: gradeLabel(scores.gunningFog),
      desc: "Grade level based on complex words",
      min: 0, max: 20, inverse: true,
    },
    {
      name: "Coleman-Liau",
      value: scores.colemanLiau,
      display: `Grade ${scores.colemanLiau}`,
      label: gradeLabel(scores.colemanLiau),
      desc: "Based on characters per word & sentence",
      min: 0, max: 20, inverse: true,
    },
    {
      name: "SMOG Index",
      value: scores.smog,
      display: `Grade ${scores.smog}`,
      label: gradeLabel(scores.smog),
      desc: "Simple Measure of Gobbledygook",
      min: 0, max: 20, inverse: true,
    },
    {
      name: "ARI Score",
      value: scores.ari,
      display: `Grade ${scores.ari}`,
      label: gradeLabel(scores.ari),
      desc: "Automated Readability Index",
      min: 0, max: 20, inverse: true,
    },
  ] : [];

  return (
    <ToolLayout
      title="Readability Checker"
      description="Analyze text readability with Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, and ARI scoring algorithms."
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
            placeholder="Paste your text here to analyze readability…"
            className="tool-textarea w-full"
            rows={18}
          />
          <p className="text-xs text-text-ghost mt-1">Minimum 30 words recommended for accurate scores</p>
        </div>

        {/* Results */}
        <div>
          <div className="pane-label mb-3">Readability Scores</div>

          {!scores ? (
            <div className="text-text-ghost text-sm">Results will appear after you enter text…</div>
          ) : (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Words", value: scores.wordCount.toLocaleString() },
                  { label: "Sentences", value: scores.sentenceCount.toLocaleString() },
                  { label: "Syllables", value: scores.syllableCount.toLocaleString() },
                  { label: "Avg Words/Sent", value: scores.avgWordsPerSentence },
                  { label: "Avg Syl/Word", value: scores.avgSyllablesPerWord },
                  { label: "Complex Words", value: scores.complexWordCount.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle text-center">
                    <div className="text-[10px] text-text-ghost leading-tight">{label}</div>
                    <div className="text-sm font-bold text-text-primary font-mono mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {/* Score cards */}
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div key={m.name} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-border-subtle">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary">{m.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-text-primary">{m.display}</span>
                        <span className="text-[10px] text-text-secondary ml-2">{m.label}</span>
                      </div>
                    </div>
                    <ScoreBar value={m.value} min={m.min} max={m.max} inverse={m.inverse} />
                    <p className="text-[10px] text-text-ghost mt-1">{m.desc}</p>
                  </div>
                ))}
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
            { name: "Keyword Density Checker", href: "/keyword-density-checker" },
            { name: "Word Counter", href: "/character-counter" },
            { name: "Markdown Preview", href: "/markdown-preview" },
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
