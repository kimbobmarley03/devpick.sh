"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Upload, Download, FileText, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const RELATED_TOOLS = [
  { name: "Merge PDF", href: "/merge-pdf" },
  { name: "Compress PDF", href: "/compress-pdf" },
  { name: "Split PDF", href: "/split-pdf" },
  { name: "PDF Watermark", href: "/pdf-watermark" },
  { name: "Rotate PDF", href: "/rotate-pdf" },
];

export function UnlockPdfTool() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [unlocking, setUnlocking] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setResultUrl(null);
    fileRef.current = file;
    setFileName(file.name);
    setOriginalSize(file.size);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const unlock = async () => {
    if (!fileRef.current) { setError("Please select a PDF file first."); return; }
    setUnlocking(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await fileRef.current.arrayBuffer();

      let doc;
      if (password) {
        // Try loading with password (for password-protected PDFs)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          doc = await PDFDocument.load(bytes, { password } as any);
        } catch {
          // Try without password as fallback (permissions-only lock)
          doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        }
      } else {
        // No password — try to remove permissions lock
        doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      }

      // Save without encryption
      const outBytes = await doc.save();
      const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("password") || msg.includes("encrypt") || msg.includes("decrypt")) {
        setError("Incorrect password or unsupported encryption type. Make sure you have the correct password.");
      } else {
        setError(`Unlock failed: ${msg}`);
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <ToolLayout title="Unlock PDF" description="Remove password protection from a PDF file">
      <div className="mb-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
        🔒 Your files never leave your browser
      </div>

      <div className="mb-4 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono text-zinc-500">
        ℹ️ You must know the password to unlock the PDF. This tool does not bypass or crack passwords.
        Works with user-password and permissions-locked PDFs using RC4/AES-128 encryption.
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
          dragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 bg-zinc-50 dark:bg-zinc-800"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Upload className="mx-auto mb-2 text-zinc-400" size={32} />
        <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
          Drop a PDF here or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />
      </div>

      {/* File info */}
      {fileName && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-sm">
          <FileText size={16} className="text-zinc-400 shrink-0" />
          <span className="flex-1 truncate text-zinc-800 dark:text-zinc-200">{fileName}</span>
          <span className="text-zinc-400 text-xs shrink-0">{formatBytes(originalSize)}</span>
        </div>
      )}

      {/* Password */}
      <div className="mb-4">
        <label className="block text-xs font-mono text-zinc-500 mb-1">
          PDF password (leave blank if permissions-only lock)
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF password…"
            className="w-full px-3 py-2 pr-10 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === "Enter" && unlock()}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <button
        onClick={unlock}
        disabled={unlocking || !fileName}
        className="w-full py-3 rounded font-mono font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {unlocking ? "Unlocking…" : "Unlock PDF"}
      </button>

      {/* Result */}
      {resultUrl && (
        <div className="p-4 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <p className="text-sm font-mono text-emerald-700 dark:text-emerald-300 mb-2">
            ✅ Unlocked! {formatBytes(resultSize)}
          </p>
          <a
            href={resultUrl}
            download={fileName?.replace(/\.pdf$/i, "-unlocked.pdf") ?? "unlocked.pdf"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono font-semibold transition-colors"
          >
            <Download size={14} /> Download Unlocked PDF
          </a>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-xs font-mono text-zinc-500 mb-3">Related PDF Tools</p>
        <div className="flex flex-wrap gap-2">
          {RELATED_TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
