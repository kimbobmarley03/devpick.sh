"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2 } from "lucide-react";

const LICENSES = ["MIT", "Apache 2.0", "GPL 3.0", "BSD", "ISC", "Unlicense"];

const LICENSE_BADGE: Record<string, string> = {
  "MIT": "MIT-yellow",
  "Apache 2.0": "Apache_2.0-blue",
  "GPL 3.0": "GPLv3-blue",
  "BSD": "BSD-blue",
  "ISC": "ISC-blue",
  "Unlicense": "Unlicense-blue",
};

function generateReadme(config: {
  projectName: string;
  description: string;
  techStack: string;
  installation: string;
  usage: string;
  features: string[];
  license: string;
  authorName: string;
  authorGithub: string;
  includeBadges: boolean;
  includeToc: boolean;
  includeContributing: boolean;
  includeLicense: boolean;
}): string {
  const {
    projectName,
    description,
    techStack,
    installation,
    usage,
    features,
    license,
    authorName,
    authorGithub,
    includeBadges,
    includeToc,
    includeContributing,
    includeLicense,
  } = config;

  const name = projectName || "My Project";
  const lines: string[] = [];

  // Title
  lines.push(`# ${name}`);
  lines.push("");

  // Badges
  if (includeBadges) {
    const badgeColor = LICENSE_BADGE[license] || "blue";
    lines.push(`![License](https://img.shields.io/badge/license-${badgeColor}.svg)`);
    if (authorGithub) {
      lines.push(`![GitHub](https://img.shields.io/github/followers/${authorGithub}?style=social)`);
    }
    lines.push("");
  }

  // Description
  if (description) {
    lines.push(description);
    lines.push("");
  }

  // TOC
  if (includeToc) {
    lines.push("## Table of Contents");
    lines.push("");
    lines.push("- [Features](#features)");
    lines.push("- [Installation](#installation)");
    lines.push("- [Usage](#usage)");
    if (includeContributing) lines.push("- [Contributing](#contributing)");
    if (includeLicense) lines.push("- [License](#license)");
    lines.push("");
  }

  // Features
  if (features.length > 0) {
    lines.push("## Features");
    lines.push("");
    features.filter(Boolean).forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  // Tech Stack
  if (techStack) {
    lines.push("## Tech Stack");
    lines.push("");
    const stack = techStack.split(",").map((s) => s.trim()).filter(Boolean);
    stack.forEach((s) => lines.push(`- ${s}`));
    lines.push("");
  }

  // Installation
  lines.push("## Installation");
  lines.push("");
  if (installation) {
    lines.push("```bash");
    lines.push(installation);
    lines.push("```");
  } else {
    lines.push("```bash");
    lines.push(`git clone https://github.com/${authorGithub || "username"}/${name.toLowerCase().replace(/\s+/g, "-")}`);
    lines.push(`cd ${name.toLowerCase().replace(/\s+/g, "-")}`);
    lines.push("npm install");
    lines.push("```");
  }
  lines.push("");

  // Usage
  lines.push("## Usage");
  lines.push("");
  if (usage) {
    lines.push("```bash");
    lines.push(usage);
    lines.push("```");
  } else {
    lines.push("```bash");
    lines.push("npm start");
    lines.push("```");
  }
  lines.push("");

  // Contributing
  if (includeContributing) {
    lines.push("## Contributing");
    lines.push("");
    lines.push("Contributions are welcome! Please feel free to submit a Pull Request.");
    lines.push("");
    lines.push("1. Fork the project");
    lines.push("2. Create your feature branch (`git checkout -b feature/AmazingFeature`)");
    lines.push("3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)");
    lines.push("4. Push to the branch (`git push origin feature/AmazingFeature`)");
    lines.push("5. Open a Pull Request");
    lines.push("");
  }

  // License
  if (includeLicense) {
    lines.push("## License");
    lines.push("");
    lines.push(`Distributed under the ${license} License. See \`LICENSE\` for more information.`);
    lines.push("");
  }

  // Author
  if (authorName || authorGithub) {
    lines.push("## Author");
    lines.push("");
    if (authorName) lines.push(`**${authorName}**`);
    if (authorGithub) lines.push(`- GitHub: [@${authorGithub}](https://github.com/${authorGithub})`);
    lines.push("");
  }

  return lines.join("\n");
}

export function ReadmeGeneratorTool() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [installation, setInstallation] = useState("");
  const [usage, setUsage] = useState("");
  const [features, setFeatures] = useState<string[]>(["", ""]);
  const [license, setLicense] = useState("MIT");
  const [authorName, setAuthorName] = useState("");
  const [authorGithub, setAuthorGithub] = useState("");
  const [includeBadges, setIncludeBadges] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [includeContributing, setIncludeContributing] = useState(true);
  const [includeLicense, setIncludeLicense] = useState(true);

  const markdown = generateReadme({
    projectName,
    description,
    techStack,
    installation,
    usage,
    features,
    license,
    authorName,
    authorGithub,
    includeBadges,
    includeToc,
    includeContributing,
    includeLicense,
  });

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, val: string) => {
    const updated = [...features];
    updated[i] = val;
    setFeatures(updated);
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono";
  const labelCls = "block text-xs text-text-secondary font-mono uppercase tracking-wide mb-1.5";
  const toggleCls = (on: boolean) =>
    `relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${on ? "bg-accent" : "bg-border-subtle"}`;

  return (
    <ToolLayout
      agentReady
      title="README Generator"
      description="Generate a professional GitHub README.md with live preview. Fill in the form and copy or download the result."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5">
          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Project Info</h2>

            <div>
              <label className={labelCls}>Project Name</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-awesome-project" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your project..." rows={3} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tech Stack (comma-separated)</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, TypeScript, Node.js, PostgreSQL" className={inputCls} />
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Features</h2>
            {features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  className={inputCls}
                />
                <button onClick={() => removeFeature(i)} className="p-2 text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={addFeature} className="flex items-center gap-1.5 text-xs text-accent hover:underline">
              <Plus size={13} /> Add Feature
            </button>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Setup</h2>
            <div>
              <label className={labelCls}>Installation Steps</label>
              <textarea value={installation} onChange={(e) => setInstallation(e.target.value)} placeholder="npm install" rows={3} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Usage</label>
              <textarea value={usage} onChange={(e) => setUsage(e.target.value)} placeholder="npm start" rows={3} className={inputCls} />
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Author & License</h2>
            <div>
              <label className={labelCls}>License</label>
              <select value={license} onChange={(e) => setLicense(e.target.value)} className={inputCls}>
                {LICENSES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Author Name</label>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Author GitHub</label>
              <input type="text" value={authorGithub} onChange={(e) => setAuthorGithub(e.target.value)} placeholder="johndoe" className={inputCls} />
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Options</h2>
            <div className="space-y-3">
              {[
                { label: "Include Badges", value: includeBadges, set: setIncludeBadges },
                { label: "Include Table of Contents", value: includeToc, set: setIncludeToc },
                { label: "Include Contributing Section", value: includeContributing, set: setIncludeContributing },
                { label: "Include License Section", value: includeLicense, set: setIncludeLicense },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <button onClick={() => set(!value)} className={toggleCls(value)}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Preview</h2>
            <div className="flex gap-2">
              <CopyButton text={markdown} label="Copy Markdown" />
              <button onClick={handleDownload} className="action-btn text-xs">
                Download .md
              </button>
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-xl p-4 flex-1 overflow-auto">
            <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed">{markdown}</pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
