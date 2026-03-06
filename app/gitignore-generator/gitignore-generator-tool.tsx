"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

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
      "go.sum",
    ],
  },
  rust: {
    label: "Rust",
    emoji: "🦀",
    patterns: [
      "# Rust",
      "target/",
      "Cargo.lock",
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
      "Gemfile.lock",
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
      "*.resolved",
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

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const output = selected.size > 0 || custom.trim() ? mergeTemplates([...selected], custom) : "";

  const groups = [
    { label: "Languages", keys: ["nodejs", "python", "java", "go", "rust", "ruby", "swift", "kotlin", "cpp", "dotnet"] },
    { label: "Frameworks", keys: ["react", "vue", "angular", "nextjs"] },
    { label: "OS", keys: ["macos", "windows", "linux"] },
    { label: "Editors", keys: ["jetbrains", "vscode", "vim", "emacs"] },
  ];

  return (
    <ToolLayout
      title=".gitignore Generator"
      description="Select templates for your stack, merge them, and download a clean .gitignore file."
    >
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
                  onClick={() => output && downloadFile(output, ".gitignore")}
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
