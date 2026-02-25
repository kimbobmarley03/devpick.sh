"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { RefreshCw, ShieldCheck } from "lucide-react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

interface StrengthInfo {
  label: string;
  color: string;
  width: string;
  score: number;
}

function getStrength(password: string): StrengthInfo {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "25%", score };
  if (score <= 4) return { label: "Fair", color: "bg-yellow-500", width: "50%", score };
  if (score <= 5) return { label: "Good", color: "bg-blue-500", width: "75%", score };
  return { label: "Strong", color: "bg-green-500", width: "100%", score };
}

function generateSecurePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  let charset = "";
  const required: string[] = [];

  if (useUpper) { charset += UPPERCASE; required.push(UPPERCASE[secureRandInt(UPPERCASE.length)]); }
  if (useLower) { charset += LOWERCASE; required.push(LOWERCASE[secureRandInt(LOWERCASE.length)]); }
  if (useNumbers) { charset += NUMBERS; required.push(NUMBERS[secureRandInt(NUMBERS.length)]); }
  if (useSymbols) { charset += SYMBOLS; required.push(SYMBOLS[secureRandInt(SYMBOLS.length)]); }

  if (!charset) charset = LOWERCASE; // fallback

  // Fill remaining length
  const remaining = length - required.length;
  const extra = Array.from({ length: Math.max(0, remaining) }, () =>
    charset[secureRandInt(charset.length)]
  );

  // Shuffle required + extra together
  const all = [...required, ...extra];
  shuffleArray(all);
  return all.join("");
}

function secureRandInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function shuffleArray(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500 w-4 h-4"
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  );
}

export function PasswordTool() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);

  const generate = useCallback(() => {
    const list = Array.from({ length: Math.min(Math.max(count, 1), 20) }, () =>
      generateSecurePassword(length, useUpper, useLower, useNumbers, useSymbols)
    );
    setPasswords(list);
  }, [length, useUpper, useLower, useNumbers, useSymbols, count]);

  // Auto-generate on first render (using useCallback to avoid dep issues)
  const [generated, setGenerated] = useState(false);
  if (!generated) {
    setGenerated(true);
    const list = Array.from({ length: 5 }, () =>
      generateSecurePassword(16, true, true, true, true)
    );
    setPasswords(list);
  }

  const allText = passwords.join("\n");
  const sampleStrength = passwords.length > 0 ? getStrength(passwords[0]) : null;

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords using crypto.getRandomValues() — no data leaves your browser"
    >
      {/* Config panel */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Length slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Password Length</span>
              <span className="font-mono text-text-primary text-sm bg-surface-subtle border border-border-strong px-2 py-0.5 rounded">
                {length}
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1 font-mono">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          {/* Character options */}
          <div>
            <div className="text-sm text-text-secondary mb-3">Character Sets</div>
            <div className="grid grid-cols-2 gap-2">
              <CheckboxOption label="Uppercase (A-Z)" checked={useUpper} onChange={setUseUpper} />
              <CheckboxOption label="Lowercase (a-z)" checked={useLower} onChange={setUseLower} />
              <CheckboxOption label="Numbers (0-9)" checked={useNumbers} onChange={setUseNumbers} />
              <CheckboxOption label="Symbols (!@#...)" checked={useSymbols} onChange={setUseSymbols} />
            </div>
          </div>
        </div>

        {/* Count + Generate */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Generate</span>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              min={1}
              max={20}
              className="tool-textarea text-center"
              style={{ width: "60px", height: "32px", padding: "4px 6px", resize: "none" }}
            />
            <span className="text-sm text-text-secondary">passwords</span>
          </div>
          <button onClick={generate} className="action-btn primary">
            <RefreshCw size={13} />
            Generate
          </button>
          <div className="ml-auto">
            <CopyButton text={allText} label={`Copy All (${passwords.length})`} />
          </div>
        </div>
      </div>

      {/* Strength indicator */}
      {sampleStrength && passwords.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck size={15} className="text-text-dimmed" />
          <span className="text-xs text-text-dimmed">Strength:</span>
          <div className="flex-1 max-w-[200px] bg-surface-subtle rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${sampleStrength.color}`}
              style={{ width: sampleStrength.width }}
            />
          </div>
          <span
            className={`text-xs font-mono ${
              sampleStrength.label === "Strong"
                ? "text-green-400"
                : sampleStrength.label === "Good"
                ? "text-blue-400"
                : sampleStrength.label === "Fair"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {sampleStrength.label}
          </span>
        </div>
      )}

      {/* Password list */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        {passwords.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted font-mono text-sm">
            Click Generate to create passwords
          </div>
        ) : (
          passwords.map((pwd, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors group"
            >
              <span className="font-mono text-sm text-text-primary break-all pr-4">{pwd}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <CopyButton text={pwd} />
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-text-muted mt-3 text-right font-mono">
        {passwords.length} password{passwords.length !== 1 ? "s" : ""} ·{" "}
        crypto.getRandomValues()
      </p>
      {/* FAQ Section */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "How long should a password be?", a: "Security experts recommend at least 16 characters for important accounts. Longer is better — a 20+ character password is significantly harder to crack than a 12-character one, even if both are random." },
            { q: "What makes a strong password?", a: "A strong password is long, random, and uses a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid dictionary words, names, dates, and patterns. Never reuse passwords across sites." },
            { q: "Are generated passwords safe?", a: "Yes — our generator uses the browser's built-in crypto.getRandomValues() API, which produces cryptographically secure random numbers. No passwords are transmitted or stored anywhere." },
            { q: "Should I use a password manager?", a: "Absolutely. A password manager (like Bitwarden, 1Password, or Dashlane) lets you use a unique, strong password for every site without having to remember them. Just remember one strong master password." },
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
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "Slug Generator", href: "/slug-generator" },
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
