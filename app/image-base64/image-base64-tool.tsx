"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Upload, Trash2 } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageInfo {
  name: string;
  type: string;
  originalSize: number;
  dataUri: string;
}

export function ImageBase64Tool() {
  useWebMCP({
    name: "imageToBase64",
    description: "Convert image to Base64 data URI",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI — requires file upload" }] };
    },
  });

  const [image, setImage] = useState<ImageInfo | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, GIF, WebP, SVG, etc.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setImage({
        name: file.name,
        type: file.type,
        originalSize: file.size,
        dataUri,
      });
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const base64Only = image ? image.dataUri.split(",")[1] : "";
  const base64Size = image ? Math.ceil((image.originalSize / 3) * 4) : 0;
  const overhead = image ? Math.round((base64Size / image.originalSize - 1) * 100) : 0;

  return (
    <ToolLayout agentReady
      title="Image → Base64"
      description="Convert images to Base64 data URIs — drag & drop or pick a file"
    >
      {!image ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors min-h-[300px]
            ${dragging
              ? "border-blue-500 bg-blue-500/5"
              : "border-border-subtle hover:border-border-strong hover:bg-card-bg"
            }`}
        >
          <Upload size={40} className="text-text-muted" />
          <div className="text-center">
            <p className="text-text-secondary text-sm">Drop an image here or click to browse</p>
            <p className="text-text-muted text-xs mt-1">PNG, JPG, GIF, WebP, SVG…</p>
          </div>
          {error && <p className="text-[#ef4444] text-sm">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-mono text-text-secondary truncate max-w-xs">{image.name}</span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setImage(null)} className="action-btn">
                <Trash2 size={13} />
                Clear
              </button>
              <button onClick={() => inputRef.current?.click()} className="action-btn">
                <Upload size={13} />
                Change
              </button>
              <CopyButton text={image.dataUri} label="Copy Data URI" />
              <CopyButton text={base64Only} label="Copy Base64" />
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preview */}
            <div className="flex flex-col gap-2">
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">Preview</div>
              <div className="bg-output-bg border border-card-border rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.dataUri}
                  alt={image.name}
                  className="max-w-full max-h-64 object-contain rounded"
                />
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-card-bg border border-border-subtle rounded-lg p-3 text-center">
                  <div className="text-text-dimmed mb-1">Original</div>
                  <div className="text-text-primary">{formatBytes(image.originalSize)}</div>
                </div>
                <div className="bg-card-bg border border-border-subtle rounded-lg p-3 text-center">
                  <div className="text-text-dimmed mb-1">Base64</div>
                  <div className="text-text-primary">{formatBytes(base64Size)}</div>
                </div>
                <div className="bg-card-bg border border-border-subtle rounded-lg p-3 text-center">
                  <div className="text-text-dimmed mb-1">Overhead</div>
                  <div className="text-[#f59e0b]">+{overhead}%</div>
                </div>
              </div>
              <div className="text-xs font-mono text-text-muted">
                Type: <span className="text-text-dimmed">{image.type}</span>
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="text-xs text-text-dimmed font-mono uppercase tracking-wider">
                Base64 Output (Data URI)
              </div>
              <div className="flex-1 bg-output-bg border border-card-border rounded-lg overflow-auto p-3 min-h-[200px]">
                <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
                  {image.dataUri}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Base64", href: "/base64" },
            { name: "WebP to PNG", href: "/webp-to-png" },
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "Favicon Generator", href: "/favicon-generator" },
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
