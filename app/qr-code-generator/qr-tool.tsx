"use client";

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download, RefreshCw } from "lucide-react";

const SIZES = [150, 300, 500] as const;
type QrSize = (typeof SIZES)[number];

export function QrTool() {
  const [input, setInput] = useState("https://devpick.sh");
  const [size, setSize] = useState<QrSize>(300);
  const [generated, setGenerated] = useState("https://devpick.sh");
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const apiUrl = (text: string, sz: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${sz}x${sz}&data=${encodeURIComponent(text)}&format=png&ecc=M`;

  const generate = () => {
    if (!input.trim()) return;
    setImgError(false);
    setLoading(true);
    setGenerated(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") generate();
  };

  const downloadQr = async () => {
    if (!generated) return;
    const url = apiUrl(generated, size);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `qr-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes from any text or URL"
    >
      {/* Input */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text or URL..."
          className="tool-textarea flex-1"
          style={{ height: "40px", padding: "8px 12px", resize: "none" }}
          spellCheck={false}
        />
        <button onClick={generate} className="action-btn primary" disabled={!input.trim()}>
          <RefreshCw size={13} />
          Generate
        </button>
      </div>

      {/* Size selector */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-text-dimmed font-mono">Size:</span>
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setSize(s);
              setImgError(false);
              setLoading(true);
            }}
            className={`tab-btn ${size === s ? "active" : ""}`}
          >
            {s}×{s}
          </button>
        ))}
      </div>

      {/* QR display */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="bg-white rounded-2xl p-4 border border-card-border flex items-center justify-center"
          style={{ minWidth: Math.min(size, 320) + 32, minHeight: Math.min(size, 320) + 32 }}
        >
          {generated ? (
            imgError ? (
              <div className="text-text-dimmed text-sm text-center p-8">
                <div className="text-2xl mb-2">⚠</div>
                <div>Failed to generate QR code</div>
                <div className="text-xs mt-1 text-text-muted">Check your connection and try again</div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={apiUrl(generated, Math.min(size, 500))}
                alt={`QR code for: ${generated}`}
                width={Math.min(size, 300)}
                height={Math.min(size, 300)}
                onLoad={() => setLoading(false)}
                onError={() => { setImgError(true); setLoading(false); }}
                style={{
                  imageRendering: "pixelated",
                  opacity: loading ? 0 : 1,
                  transition: "opacity 0.2s",
                }}
              />
            )
          ) : (
            <div className="text-text-dimmed text-sm">Enter text to generate QR code</div>
          )}
        </div>

        {generated && !imgError && (
          <div className="text-center">
            <div className="text-xs text-text-dimmed font-mono mb-3 max-w-sm truncate">{generated}</div>
            <button onClick={downloadQr} className="action-btn primary">
              <Download size={13} />
              Download PNG ({size}×{size})
            </button>
          </div>
        )}
      </div>
      {/* FAQ Section */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What is a QR code?", a: "A QR code (Quick Response code) is a 2D barcode that can be scanned by smartphones and cameras. It stores data like URLs, text, contact info, and more in a grid of black and white squares." },
            { q: "Are QR codes free to make?", a: "Yes! Our QR code generator is completely free with no limits. You can generate as many QR codes as you need and download them as PNG images." },
            { q: "What data can a QR code store?", a: "QR codes can store up to 4,296 characters of text, including URLs, plain text, email addresses, phone numbers, Wi-Fi credentials, and vCard contacts." },
            { q: "How do I scan a QR code?", a: "Open your phone camera app and point it at the QR code — most modern iOS and Android phones will detect it automatically. You can also use a dedicated QR scanner app." },
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
            { name: "UTM Builder", href: "/utm-builder" },
            { name: "URL Encoder", href: "/url-encoder" },
            { name: "Barcode Generator", href: "/barcode-generator" },
            { name: "Password Generator", href: "/password-generator" },
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
