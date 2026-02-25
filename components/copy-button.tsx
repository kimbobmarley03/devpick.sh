"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  onCopied?: () => void;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, className = "", label = "Copy", onCopied }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`action-btn ${copied ? "success" : ""} ${className}`}
      title="Copy to clipboard"
      disabled={!text}
    >
      {copied ? (
        <Check size={13} className="animate-pop-in" />
      ) : (
        <Copy size={13} />
      )}
      <span className="transition-all duration-150">
        {copied ? "Copied!" : label}
      </span>
    </button>
  );
}
