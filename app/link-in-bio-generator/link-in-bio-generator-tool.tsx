"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Plus, Trash2, GripVertical } from "lucide-react";

type ButtonStyle = "rounded" | "square" | "pill";

interface BioLink {
  id: string;
  title: string;
  url: string;
  emoji: string;
}

const GRADIENT_PRESETS = [
  { label: "Sunset", value: "linear-gradient(135deg, #f97316, #ec4899)" },
  { label: "Ocean", value: "linear-gradient(135deg, #0ea5e9, #6366f1)" },
  { label: "Forest", value: "linear-gradient(135deg, #22c55e, #16a34a)" },
  { label: "Night", value: "linear-gradient(135deg, #1e1b4b, #312e81)" },
  { label: "Rose", value: "linear-gradient(135deg, #f43f5e, #fb7185)" },
  { label: "Mono", value: "#111111" },
];

const BUTTON_STYLES: { label: string; value: ButtonStyle; class: string }[] = [
  { label: "Rounded", value: "rounded", class: "rounded-lg" },
  { label: "Square", value: "square", class: "rounded-none" },
  { label: "Pill", value: "pill", class: "rounded-full" },
];

const newLink = (): BioLink => ({
  id: crypto.randomUUID(),
  title: "",
  url: "",
  emoji: "🔗",
});

export function LinkInBioGeneratorTool() {
  const [displayName, setDisplayName] = useState("Your Name");
  const [bio, setBio] = useState("Welcome to my page ✨");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [background, setBackground] = useState(GRADIENT_PRESETS[1].value);
  const [customBg, setCustomBg] = useState("");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("pill");
  const [links, setLinks] = useState<BioLink[]>([
    { id: crypto.randomUUID(), title: "My Website", url: "https://example.com", emoji: "🌐" },
    { id: crypto.randomUUID(), title: "Twitter / X", url: "https://x.com/username", emoji: "🐦" },
  ]);
  const [buttonBg, setButtonBg] = useState("#ffffff");
  const [buttonText, setButtonText] = useState("#111111");

  const addLink = () => setLinks((l) => [...l, newLink()]);
  const removeLink = (id: string) => setLinks((l) => l.filter((x) => x.id !== id));
  const updateLink = (id: string, field: keyof BioLink, value: string) =>
    setLinks((l) => l.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const bgValue = customBg || background;
  const btnRadiusMap: Record<ButtonStyle, string> = {
    rounded: "8px",
    square: "0px",
    pill: "9999px",
  };

  const generateHTML = () => {
    const linksHTML = links
      .filter((l) => l.title && l.url)
      .map(
        (l) => `
    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="bio-link">
      ${l.emoji ? `<span class="emoji">${l.emoji}</span>` : ""}
      <span>${l.title}</span>
    </a>`
      )
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} — Links</title>
  <meta name="description" content="${bio}">
  <!-- Analytics: Replace with your tracking script -->
  <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> -->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${bgValue};
      padding: 2rem 1rem;
    }
    .container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.4);
    }
    .avatar-placeholder {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      border: 3px solid rgba(255,255,255,0.4);
    }
    h1 {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .bio {
      color: rgba(255,255,255,0.85);
      font-size: 0.95rem;
      text-align: center;
      line-height: 1.5;
    }
    .links {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
    .bio-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: ${buttonBg};
      color: ${buttonText};
      border-radius: ${btnRadiusMap[buttonStyle]};
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 0.1s, opacity 0.1s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .bio-link:hover { transform: scale(1.02); opacity: 0.95; }
    .emoji { font-size: 1.1rem; }
    .footer {
      margin-top: 1rem;
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    ${profileImageUrl ? `<img src="${profileImageUrl}" alt="${displayName}" class="avatar" />` : `<div class="avatar-placeholder">👤</div>`}
    <h1>${displayName}</h1>
    ${bio ? `<p class="bio">${bio}</p>` : ""}
    <div class="links">
${linksHTML}
    </div>
    <p class="footer">Made with devpick.sh</p>
  </div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "link-in-bio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-full";

  return (
    <ToolLayout
      agentReady
      title="Link in Bio Generator"
      description="Build a beautiful link-in-bio page. Customize it, preview it in real-time, and export a self-contained HTML file you can host anywhere."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">👤 Profile</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">Display Name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">Profile Image URL</label>
                <input
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">🎨 Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-2 font-mono uppercase tracking-wide">Background</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => { setBackground(p.value); setCustomBg(""); }}
                      title={p.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${background === p.value && !customBg ? "border-accent scale-110" : "border-transparent"}`}
                      style={{ background: p.value }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-muted">Custom:</label>
                  <input
                    type="text"
                    value={customBg}
                    onChange={(e) => setCustomBg(e.target.value)}
                    placeholder="#hex or CSS gradient"
                    className={inputClass + " flex-1 text-xs"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-2 font-mono uppercase tracking-wide">Button Style</label>
                <div className="flex gap-2">
                  {BUTTON_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setButtonStyle(s.value)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        buttonStyle === s.value
                          ? "border-accent text-accent bg-accent/10"
                          : "border-border-subtle text-text-secondary hover:border-accent"
                      } ${s.class}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">Button BG</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className="w-9 h-9 rounded border border-border-subtle cursor-pointer" />
                    <input value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} className={inputClass + " text-xs"} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5 font-mono uppercase tracking-wide">Button Text</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-9 h-9 rounded border border-border-subtle cursor-pointer" />
                    <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className={inputClass + " text-xs"} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-card-bg border border-card-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">🔗 Links</h2>
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <GripVertical size={14} className="text-text-muted shrink-0" />
                  <input
                    value={link.emoji}
                    onChange={(e) => updateLink(link.id, "emoji", e.target.value)}
                    className="px-2 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-12 text-center"
                    placeholder="🔗"
                    maxLength={4}
                  />
                  <input
                    value={link.title}
                    onChange={(e) => updateLink(link.id, "title", e.target.value)}
                    placeholder="Link Title"
                    className={inputClass + " flex-1"}
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(link.id, "url", e.target.value)}
                    placeholder="https://..."
                    className={inputClass + " flex-1"}
                  />
                  <button onClick={() => removeLink(link.id)} className="text-text-muted hover:text-red-400 p-1 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addLink} className="action-btn text-xs flex items-center gap-1.5">
                <Plus size={13} /> Add Link
              </button>
            </div>
          </div>

          {/* Export */}
          <div className="flex gap-3">
            <button onClick={downloadHTML} className="action-btn flex-1 flex items-center justify-center gap-2">
              Export HTML
            </button>
            <CopyButton text={generateHTML()} label="Copy HTML" />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col items-center">
          <p className="text-xs text-text-muted mb-4 uppercase tracking-wide font-mono">Live Preview</p>
          {/* Phone mockup */}
          <div className="relative w-64 rounded-[2.5rem] border-[10px] border-gray-800 shadow-2xl overflow-hidden" style={{ height: "520px" }}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-800 rounded-b-2xl z-10" />
            <div
              className="w-full h-full overflow-y-auto flex flex-col items-center p-4 pt-8 gap-3"
              style={{ background: bgValue }}
            >
              {/* Avatar */}
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImageUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl">
                  👤
                </div>
              )}
              <h3 className="text-white font-bold text-base drop-shadow">{displayName || "Your Name"}</h3>
              {bio && (
                <p className="text-white/80 text-xs text-center leading-relaxed">{bio}</p>
              )}
              <div className="w-full space-y-2 mt-1">
                {links
                  .filter((l) => l.title)
                  .map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold shadow-md"
                      style={{
                        background: buttonBg,
                        color: buttonText,
                        borderRadius: btnRadiusMap[buttonStyle],
                      }}
                    >
                      {l.emoji && <span>{l.emoji}</span>}
                      <span>{l.title}</span>
                    </div>
                  ))}
              </div>
              <p className="text-white/40 text-[10px] mt-2">Made with devpick.sh</p>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 text-center max-w-xs">
            Export as a self-contained HTML file you can host on GitHub Pages, Netlify, or any static host — no backend needed.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
