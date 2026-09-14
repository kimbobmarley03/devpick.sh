"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { trackEvent } from "@/lib/analytics";

const TEMPLATES: Record<string, { label: string; emoji: string; patterns: string[] }> = {
  nodejs: {
    label: "Node.js",
    emoji: "🟢",
    patterns: [
      "# Node.js",
      "node_modules/",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",
      ".npm",
      ".yarn/",
      ".pnp.*",
      "dist/",
      "build/",
      ".cache/",
      ".env",
      ".env.local",
      ".env.*.local",
    ],
  },
  python: {
    label: "Python",
    emoji: "🐍",
    patterns: [
      "# Python",
      "__pycache__/",
      "*.py[cod]",
      "*$py.class",
      "*.so",
      ".Python",
      "build/",
      "dist/",
      "*.egg-info/",
      ".eggs/",
      ".venv/",
      "venv/",
      "env/",
      ".env",
      "*.egg",
      ".pytest_cache/",
      ".mypy_cache/",
      ".ruff_cache/",
      "*.pyo",
    ],
  },
  java: {
    label: "Java",
    emoji: "☕",
    patterns: [
      "# Java",
      "*.class",
      "*.jar",
      "*.war",
      "*.ear",
      "*.nar",
      "target/",
      ".gradle/",
      "build/",
      "out/",
      "*.iml",
      ".idea/",
      "*.log",
    ],
  },
  go: {
    label: "Go",
    emoji: "🐹",
    patterns: [
      "# Go",
      "*.exe",
      "*.exe~",
      "*.dll",
      "*.so",
      "*.dylib",
      "*.test",
      "*.out",
      "vendor/",
    ],
  },
  rust: {
    label: "Rust",
    emoji: "🦀",
    patterns: [
      "# Rust",
      "target/",
      "**/*.rs.bk",
      "*.pdb",
    ],
  },
  ruby: {
    label: "Ruby",
    emoji: "💎",
    patterns: [
      "# Ruby",
      "*.gem",
      "*.rbc",
      ".bundle/",
      ".config",
      "coverage/",
      "tmp/",
      ".sass-cache",
      "vendor/bundle",
      ".byebug_history",
    ],
  },
  swift: {
    label: "Swift",
    emoji: "🦅",
    patterns: [
      "# Swift",
      ".DS_Store",
      "*.xcuserstate",
      "*.xccheckout",
      "*.xcscmblueprint",
      ".build/",
      "Packages/",
      "DerivedData/",
      "*.ipa",
      "*.dSYM.zip",
      "*.dSYM",
    ],
  },
  kotlin: {
    label: "Kotlin",
    emoji: "🎯",
    patterns: [
      "# Kotlin",
      "*.class",
      "*.jar",
      "build/",
      ".gradle/",
      "out/",
      ".kotlin/",
      "*.iml",
      ".idea/",
    ],
  },
  cpp: {
    label: "C/C++",
    emoji: "⚙️",
    patterns: [
      "# C/C++",
      "*.o",
      "*.lo",
      "*.la",
      "*.al",
      "*.libs",
      "*.so",
      "*.so.*",
      "*.a",
      "*.dll",
      "*.dylib",
      "*.exe",
      "*.out",
      "*.app",
      "build/",
      "cmake-build-*/",
      "CMakeCache.txt",
      "CMakeFiles/",
    ],
  },
  dotnet: {
    label: ".NET",
    emoji: "🔵",
    patterns: [
      "# .NET",
      "bin/",
      "obj/",
      "*.user",
      "*.suo",
      ".vs/",
      "*.nupkg",
      "*.snupkg",
      "project.lock.json",
      "project.fragment.lock.json",
      "artifacts/",
      "TestResults/",
    ],
  },
  react: {
    label: "React",
    emoji: "⚛️",
    patterns: [
      "# React",
      "node_modules/",
      "build/",
      ".env.local",
      ".env.development.local",
      ".env.test.local",
      ".env.production.local",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
    ],
  },
  vue: {
    label: "Vue",
    emoji: "💚",
    patterns: [
      "# Vue",
      "node_modules/",
      "dist/",
      ".env.local",
      ".env.*.local",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      ".DS_Store",
    ],
  },
  angular: {
    label: "Angular",
    emoji: "🔴",
    patterns: [
      "# Angular",
      "node_modules/",
      "dist/",
      ".angular/",
      "tmp/",
      "out-tsc/",
      "bazel-out/",
      ".env",
      "npm-debug.log",
      "yarn-error.log",
    ],
  },
  nextjs: {
    label: "Next.js",
    emoji: "▲",
    patterns: [
      "# Next.js",
      ".next/",
      "out/",
      "node_modules/",
      ".env*.local",
      "vercel.json",
      ".vercel",
      "*.tsbuildinfo",
      "next-env.d.ts",
    ],
  },
  turborepo: {
    label: "Turborepo",
    emoji: "▲",
    patterns: [
      "# Turborepo",
      ".turbo/",
    ],
  },
  nx: {
    label: "Nx",
    emoji: "◫",
    patterns: [
      "# Nx",
      ".nx/cache/",
      ".nx/workspace-data/",
    ],
  },
  macos: {
    label: "macOS",
    emoji: "🍎",
    patterns: [
      "# macOS",
      ".DS_Store",
      ".AppleDouble",
      ".LSOverride",
      "Icon",
      "._*",
      ".DocumentRevisions-V100",
      ".fseventsd",
      ".Spotlight-V100",
      ".TemporaryItems",
      ".Trashes",
      ".VolumeIcon.icns",
      ".com.apple.timemachine.donotpresent",
    ],
  },
  windows: {
    label: "Windows",
    emoji: "🪟",
    patterns: [
      "# Windows",
      "Thumbs.db",
      "Thumbs.db:encryptable",
      "ehthumbs.db",
      "ehthumbs_vista.db",
      "*.tmp",
      "*.stackdump",
      "[Dd]esktop.ini",
      "$RECYCLE.BIN/",
      "*.cab",
      "*.msi",
      "*.msix",
      "*.msm",
      "*.msp",
      "*.lnk",
    ],
  },
  linux: {
    label: "Linux",
    emoji: "🐧",
    patterns: [
      "# Linux",
      "*~",
      ".fuse_hidden*",
      ".directory",
      ".Trash-*",
      ".nfs*",
    ],
  },
  jetbrains: {
    label: "JetBrains",
    emoji: "🧠",
    patterns: [
      "# JetBrains IDEs",
      ".idea/",
      "*.iws",
      "*.iml",
      "*.ipr",
      "out/",
      ".idea_modules/",
      "atlassian-ide-plugin.xml",
      "com_crashlytics_export_strings.xml",
      "crashlytics.properties",
      "crashlytics-build.properties",
      "fabric.properties",
    ],
  },
  vscode: {
    label: "VS Code",
    emoji: "💙",
    patterns: [
      "# VS Code",
      ".vscode/*",
      "!.vscode/settings.json",
      "!.vscode/tasks.json",
      "!.vscode/launch.json",
      "!.vscode/extensions.json",
      "!.vscode/*.code-snippets",
      ".history/",
      "*.vsix",
    ],
  },
  vim: {
    label: "Vim",
    emoji: "📝",
    patterns: [
      "# Vim",
      "*.swp",
      "*.swo",
      "*~",
      "*.un~",
      "Session.vim",
      ".netrwhist",
      "tags",
    ],
  },
  emacs: {
    label: "Emacs",
    emoji: "🔧",
    patterns: [
      "# Emacs",
      "*~",
      "\\#*\\#",
      "/.emacs.desktop",
      "/.emacs.desktop.lock",
      "*.elc",
      "auto-save-list",
      "tramp",
      ".\\#*",
      ".org-id-locations",
      "*_archive",
    ],
  },
};

const STACK_PRESETS = [
  { label: "Next.js app", keys: ["nodejs", "nextjs", "macos", "vscode"] },
  { label: "Next.js monorepo", keys: ["nodejs", "nextjs", "turborepo", "macos", "vscode"] },
  { label: "Nx monorepo", keys: ["nodejs", "nx", "macos", "vscode"] },
  { label: "Python service", keys: ["python", "macos", "vscode"] },
  { label: "Rust CLI", keys: ["rust", "macos", "vscode"] },
  { label: "Java service", keys: ["java", "macos", "jetbrains"] },
];

function mergeTemplates(selected: string[], custom: string): string {
  const sections: string[] = [];
  for (const key of selected) {
    if (TEMPLATES[key]) {
      sections.push(TEMPLATES[key].patterns.join("\n"));
    }
  }
  if (custom.trim()) {
    sections.push("# Custom patterns", custom.trim());
  }
  // Deduplicate non-comment lines
  const lines = sections.join("\n").split("\n");
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") {
      result.push(line);
    } else if (!seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(line);
    }
  }
  return result.join("\n");
}

interface GitignoreAudit {
  ruleCount: number;
  missing: string[];
  duplicates: string[];
  risks: Array<{ rule: string; reason: string }>;
}

const REVIEW_RULES: Record<string, string> = {
  "package-lock.json": "Applications normally commit npm lockfiles for reproducible installs.",
  "pnpm-lock.yaml": "Applications normally commit pnpm lockfiles for reproducible installs.",
  "yarn.lock": "Applications normally commit Yarn lockfiles for reproducible installs.",
  "Cargo.lock": "Rust applications and command-line tools normally commit Cargo.lock.",
  "go.sum": "Go modules normally commit go.sum so dependency checksums remain reproducible.",
  "Gemfile.lock": "Ruby applications normally commit Gemfile.lock; reusable gems are the common exception.",
  "Package.resolved": "Swift applications normally commit Package.resolved; libraries may choose differently.",
  ".env.example": "Example environment files document required keys and usually belong in version control.",
  ".env.sample": "Sample environment files document required keys and usually belong in version control.",
  "src/": "Ignoring the source directory can hide the code you intended to commit.",
  "app/": "Ignoring the app directory can hide application source files.",
  "lib/": "Ignoring the lib directory can hide application or package source files.",
};

function ruleKey(rule: string): string {
  return rule.replace(/^\/+/, "").replace(/^\*\*\//, "");
}

function auditGitignore(content: string, selectedTemplates: string[]): GitignoreAudit {
  const rules = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const counts = new Map<string, number>();
  for (const rule of rules) counts.set(rule, (counts.get(rule) ?? 0) + 1);

  const expected = new Set(
    selectedTemplates.flatMap((key) =>
      (TEMPLATES[key]?.patterns ?? []).filter((line) => line && !line.startsWith("#")),
    ),
  );
  const existing = new Set(rules);
  const missing = [...expected].filter((rule) => !existing.has(rule));
  const duplicates = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([rule]) => rule);
  const risks = [...existing]
    .filter((rule) => !rule.startsWith("!"))
    .map((rule) => ({ rule, reason: REVIEW_RULES[ruleKey(rule)] }))
    .filter((item): item is { rule: string; reason: string } => Boolean(item.reason));

  return { ruleCount: rules.length, missing, duplicates, risks };
}

function appendMissingRules(content: string, missing: string[]): string {
  if (missing.length === 0) return content;
  const prefix = content.trimEnd();
  const addition = ["# Suggested by DevPick for the selected stack", ...missing].join("\n");
  return prefix ? `${prefix}\n\n${addition}\n` : `${addition}\n`;
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GitignoreGeneratorTool() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["nodejs", "macos", "vscode"]));
  const [custom, setCustom] = useState("");
  const [auditInput, setAuditInput] = useState("");
  const [audit, setAudit] = useState<GitignoreAudit | null>(null);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyPreset = (label: string, keys: string[]) => {
    setSelected(new Set(keys));
    trackEvent("tool_preset_applied", { tool_id: "gitignore-generator", preset: label });
  };

  const output = selected.size > 0 || custom.trim() ? mergeTemplates([...selected], custom) : "";

  const downloadGitignore = () => {
    if (!output) return;
    downloadFile(output, ".gitignore");
    trackEvent("tool_download", {
      tool_id: "gitignore-generator",
      template_count: selected.size,
      has_custom_patterns: Boolean(custom.trim()),
    });
  };

  const runAudit = (content = auditInput) => {
    if (!content.trim()) return;
    const result = auditGitignore(content, [...selected]);
    setAudit(result);
    trackEvent("tool_complete", {
      tool_id: "gitignore-auditor",
      missing_rule_count: result.missing.length,
      duplicate_rule_count: result.duplicates.length,
      review_rule_count: result.risks.length,
    });
  };

  const useGeneratedOutput = () => {
    setAuditInput(output);
    runAudit(output);
  };

  const addMissingRules = () => {
    if (!audit || audit.missing.length === 0) return;
    const merged = appendMissingRules(auditInput, audit.missing);
    setAuditInput(merged);
    setAudit(auditGitignore(merged, [...selected]));
    trackEvent("tool_complete", {
      tool_id: "gitignore-auditor",
      action: "append_missing_rules",
      rule_count: audit.missing.length,
    });
  };

  const groups = [
    { label: "Languages", keys: ["nodejs", "python", "java", "go", "rust", "ruby", "swift", "kotlin", "cpp", "dotnet"] },
    { label: "Frameworks & monorepos", keys: ["react", "vue", "angular", "nextjs", "turborepo", "nx"] },
    { label: "OS", keys: ["macos", "windows", "linux"] },
    { label: "Editors", keys: ["jetbrains", "vscode", "vim", "emacs"] },
  ];

  return (
    <ToolLayout
      title=".gitignore Generator"
      description="Select templates for your stack, merge them, and download a clean .gitignore file."
    >
      <section className="mb-5" aria-labelledby="stack-presets-heading">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 id="stack-presets-heading" className="text-xs font-mono uppercase tracking-wide text-text-muted">Stack presets</h2>
          {STACK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.label, preset.keys)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border-subtle text-text-secondary hover:border-accent hover:text-accent bg-surface-raised transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selector */}
        <div className="space-y-4">
          {groups.map(({ label, keys }) => (
            <div key={label} className="bg-card-bg border border-card-border rounded-xl p-4">
              <h3 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-3">{label}</h3>
              <div className="flex flex-wrap gap-2">
                {keys.map((key) => {
                  const t = TEMPLATES[key];
                  const active = selected.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-colors flex items-center gap-1.5 ${
                        active
                          ? "bg-accent text-white border-accent"
                          : "border-border-subtle text-text-secondary hover:border-accent hover:text-accent bg-surface-raised"
                      }`}
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom patterns */}
          <div className="bg-card-bg border border-card-border rounded-xl p-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-text-muted mb-3">Custom Patterns</h3>
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={"# Add your own patterns\n*.local\nmy-secrets/"}
              rows={5}
              className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono resize-none"
            />
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="bg-card-bg border border-card-border rounded-xl p-4 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-secondary font-mono uppercase tracking-wide">
                .gitignore output
                {selected.size > 0 && (
                  <span className="ml-2 text-xs text-text-muted normal-case font-normal">({selected.size} template{selected.size !== 1 ? "s" : ""})</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <CopyButton text={output} label="Copy" />
                <button
                  onClick={downloadGitignore}
                  disabled={!output}
                  className="action-btn text-xs"
                >
                  ↓ Download
                </button>
              </div>
            </div>
            <pre className="flex-1 min-h-[400px] p-3 rounded-lg bg-surface-raised border border-border-subtle font-mono text-xs text-text-primary overflow-auto whitespace-pre leading-relaxed">
              {output || <span className="text-text-muted">Select templates on the left to generate your .gitignore…</span>}
            </pre>
          </div>
        </div>
      </div>

      <section id="gitignore-auditor" className="mt-10 scroll-mt-6" aria-labelledby="gitignore-auditor-heading">
        <div className="mb-4">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Monorepo workflow · processed locally</p>
          <h2 id="gitignore-auditor-heading" className="text-xl font-semibold text-text-primary mb-2">
            Audit an existing .gitignore before it reaches code review
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Paste your current file, select the stack it should support above, and check for missing build/cache rules,
            duplicates, and risky lockfile or source-directory ignores. Nothing leaves your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-card-border bg-card-bg p-4">
            <label htmlFor="gitignore-audit-input" className="block text-xs font-mono uppercase tracking-wide text-text-muted mb-3">
              Existing .gitignore
            </label>
            <textarea
              id="gitignore-audit-input"
              value={auditInput}
              onChange={(event) => {
                setAuditInput(event.target.value);
                setAudit(null);
              }}
              placeholder={"node_modules/\n.next/\npackage-lock.json"}
              rows={14}
              spellCheck={false}
              className="w-full px-3 py-2 text-xs border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono resize-y"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" onClick={() => runAudit()} disabled={!auditInput.trim()} className="action-btn primary text-xs">
                Audit file
              </button>
              <button type="button" onClick={useGeneratedOutput} disabled={!output} className="action-btn text-xs">
                Use generated output
              </button>
              <CopyButton text={auditInput} label="Copy audited file" />
            </div>
          </div>

          <div className="rounded-xl border border-card-border bg-card-bg p-4" aria-live="polite">
            {!audit ? (
              <div className="h-full min-h-[260px] flex items-center justify-center text-center">
                <p className="text-sm text-text-muted max-w-sm">
                  Select the intended stack, paste a .gitignore, and run the audit. File contents are never included in analytics.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Rules", value: audit.ruleCount },
                    { label: "Missing", value: audit.missing.length },
                    { label: "Review", value: audit.risks.length + audit.duplicates.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border-subtle bg-surface-raised p-3 text-center">
                      <p className="text-lg font-mono text-text-primary">{item.value}</p>
                      <p className="text-[11px] uppercase tracking-wide text-text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary">Missing stack rules</h3>
                    {audit.missing.length > 0 && (
                      <button type="button" onClick={addMissingRules} className="text-xs text-accent hover:underline">
                        Append all
                      </button>
                    )}
                  </div>
                  {audit.missing.length === 0 ? (
                    <p className="text-xs text-emerald-400">All selected stack rules are covered.</p>
                  ) : (
                    <code className="block max-h-32 overflow-auto whitespace-pre text-xs text-text-secondary bg-surface-raised rounded-lg p-3">
                      {audit.missing.join("\n")}
                    </code>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Rules to review</h3>
                  {audit.risks.length === 0 && audit.duplicates.length === 0 ? (
                    <p className="text-xs text-emerald-400">No risky lockfile/source rules or duplicates detected.</p>
                  ) : (
                    <ul className="space-y-2 text-xs text-text-secondary">
                      {audit.risks.map((item) => (
                        <li key={item.rule} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                          <code className="text-amber-300">{item.rule}</code>
                          <span className="block mt-1">{item.reason}</span>
                        </li>
                      ))}
                      {audit.duplicates.map((rule) => (
                        <li key={`duplicate-${rule}`} className="rounded-lg border border-border-subtle bg-surface-raised p-3">
                          Duplicate rule: <code className="text-text-primary">{rule}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-8" aria-labelledby="gitignore-guide">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent mb-2">Template notes · reviewed August 2026</p>
          <h2 id="gitignore-guide" className="text-xl font-semibold text-text-primary mb-3">
            Build a .gitignore you can explain in code review
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            The generator merges only the stacks you choose, keeps section comments, and removes repeated non-comment
            rules. Templates are maintained locally by DevPick rather than fetched at runtime, so the generated result is
            deterministic and your project details stay in the browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article id="gitignore-lockfiles" className="rounded-xl border border-card-border bg-card-bg p-4 scroll-mt-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Commit dependency locks</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              The Go template keeps <code>go.sum</code>, and the Rust template keeps <code>Cargo.lock</code>. Reproducible dependency resolution is safer than blanket lockfile ignores.
            </p>
          </article>
          <article id="gitignore-negation" className="rounded-xl border border-card-border bg-card-bg p-4 scroll-mt-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Order affects negation</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              A later rule beginning with <code>!</code> can re-include a file. Review custom rules after merging when a parent directory is ignored.
            </p>
          </article>
          <article id="gitignore-secrets" className="rounded-xl border border-card-border bg-card-bg p-4 scroll-mt-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Ignoring is not secret management</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ignore local environment files, but rotate any credential that was committed. A .gitignore cannot erase a secret from Git history.
            </p>
          </article>
        </div>

        <div id="gitignore-troubleshooting" className="scroll-mt-6 rounded-xl border border-border-subtle bg-surface-subtle p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-2">If Git still tracks an ignored file</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Ignore rules only affect untracked files. Remove an already tracked file from the index while keeping the local copy, then commit the change:
          </p>
          <code className="block text-xs text-accent bg-surface-raised rounded-lg p-3 overflow-x-auto">git rm --cached path/to/file</code>
        </div>
      </section>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "README Generator", href: "/readme-generator" },
            { name: "License Generator", href: "/license-generator" },
            { name: "Docker Compose Generator", href: "/docker-compose-generator" },
            { name: "Nginx Config Generator", href: "/nginx-config-generator" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-surface-subtle">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
