"use client";

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Download } from "lucide-react";

type BarcodeType = "code128" | "ean13" | "code39";

// ─── Code 39 ────────────────────────────────────────────────────────────────
// Each char = 9 elements alternating bar/space, 0=narrow(1) 1=wide(3)
const C39: Record<string, string> = {
  "0":"000110100","1":"100100001","2":"001100001","3":"101100000","4":"000110001",
  "5":"100110000","6":"001110000","7":"000100101","8":"100100100","9":"001100100",
  "A":"100001001","B":"001001001","C":"101001000","D":"000011001","E":"100011000",
  "F":"001011000","G":"000001101","H":"100001100","I":"001001100","J":"000011100",
  "K":"100000011","L":"001000011","M":"101000010","N":"000010011","O":"100010010",
  "P":"001010010","Q":"000000111","R":"100000110","S":"001000110","T":"000010110",
  "U":"110000001","V":"011000001","W":"111000000","X":"010010001","Y":"110010000",
  "Z":"011010000","-":"010000101",".":"110000100"," ":"011000100","$":"010101000",
  "/":"010100010","+":"010001010","%":"000101010","*":"010010100",
};

function drawCode39(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, barH: number, narrowW: number) {
  const upper = text.toUpperCase();
  const chars = `*${upper}*`;
  let cx = x;
  for (let i = 0; i < chars.length; i++) {
    const pattern = C39[chars[i]];
    if (!pattern) continue;
    for (let j = 0; j < 9; j++) {
      const w = pattern[j] === "1" ? narrowW * 3 : narrowW;
      if (j % 2 === 0) { // bar
        ctx.fillStyle = "#000";
        ctx.fillRect(cx, y, w, barH);
      }
      cx += w;
    }
    if (i < chars.length - 1) cx += narrowW; // inter-char gap
  }
  return cx;
}

// ─── EAN-13 ─────────────────────────────────────────────────────────────────
const EAN_L: string[] = [
  "0001101","0011001","0010011","0111101","0100011",
  "0110001","0101111","0111011","0110111","0001011",
];
const EAN_G: string[] = [
  "0100111","0110011","0011011","0100001","0011101",
  "0111001","0000101","0010001","0001001","0010111",
];
const EAN_R: string[] = [
  "1110010","1100110","1101100","1000010","1011100",
  "1001110","1010000","1000100","1001000","1110100",
];
// Parity patterns for first digit
const EAN_PARITY = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];

function ean13CheckDigit(digits: string): number {
  let s = 0;
  for (let i = 0; i < 12; i++) s += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (s % 10)) % 10;
}

function drawEan13(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, barH: number, moduleW: number) {
  // Pad/truncate to 12 digits and compute check digit
  const raw = text.replace(/\D/g, "").padStart(12, "0").slice(0, 12);
  const check = ean13CheckDigit(raw);
  const digits = raw + check;
  const first = parseInt(digits[0]);
  const parity = EAN_PARITY[first] || "LLLLLL";



  function drawBitsAt(bits: string, cx: number, h = barH) {
    for (const b of bits) {
      if (b === "1") { ctx.fillStyle = "#000"; ctx.fillRect(cx, y, moduleW, h); }
      cx += moduleW;
    }
    return cx;
  }

  const guardH = barH + 5;
  let cx = x;

  // Left guard: 101
  cx = drawBitsAt("101", cx, guardH);
  // Left 6 digits
  for (let i = 1; i <= 6; i++) {
    const d = parseInt(digits[i]);
    const code = parity[i - 1] === "G" ? EAN_G[d] : EAN_L[d];
    cx = drawBitsAt(code, cx);
  }
  // Center guard: 01010
  cx = drawBitsAt("01010", cx, guardH);
  // Right 6 digits
  for (let i = 7; i <= 12; i++) {
    const d = parseInt(digits[i]);
    cx = drawBitsAt(EAN_R[d], cx);
  }
  // Right guard: 101
  cx = drawBitsAt("101", cx, guardH);

  // Draw human-readable digits below
  ctx.fillStyle = "#000";
  ctx.font = `${moduleW * 8}px monospace`;
  ctx.textAlign = "center";
  const startX = x + moduleW * 3;
  // First digit (outside left guard)
  ctx.fillText(digits[0], x - moduleW * 3, y + barH + 12);
  // Left 6 digits
  ctx.fillText(digits.slice(1, 7), startX + moduleW * 21, y + barH + 12);
  // Right 6 digits
  ctx.fillText(digits.slice(7, 13), startX + moduleW * 21 + moduleW * 42 + moduleW * 5, y + barH + 12);

  return cx;
}

// ─── Code 128 ───────────────────────────────────────────────────────────────
// Width arrays: 6 elements (bar,space,bar,space,bar,space)
const C128_WIDTHS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[1,1,3,1,3,2],[1,1,3,2,3,1],[1,3,3,2,1,1],[1,3,1,2,3,1],
  [3,2,1,3,1,1],[1,2,3,2,1,2],[1,3,2,2,3,1],[3,2,2,1,3,1],[2,1,3,1,2,2],
  [1,2,2,1,2,2],[1,2,2,2,1,2],[2,1,1,2,2,2],[2,1,2,2,1,2],[2,2,1,1,2,2],
  [2,2,1,2,1,2],[2,2,2,1,1,2],[2,2,2,2,1,1],[1,2,1,2,2,2],[1,2,1,2,3,1],
  [1,2,2,1,2,3],[2,3,1,1,1,2],[1,1,3,1,1,3],[1,3,1,1,3,1],[3,1,1,1,3,1],
  [2,1,2,1,3,2],[2,1,3,1,2,3],[2,1,3,3,2,1],[2,1,3,1,3,2],[3,1,2,1,3,2],
  [3,1,2,3,2,1],[3,3,2,1,3,1],[3,1,3,1,2,2],[2,1,1,1,2,3],[2,1,1,3,2,1],
  [2,3,1,1,2,1],[2,1,2,1,1,3],[2,1,2,3,1,1],[2,3,2,1,1,1],[3,1,1,1,2,2],
  [3,1,2,1,1,2],[3,2,1,1,1,2],[3,2,2,1,1,1],[2,2,3,3,1,1], // 103 start B
  [1,1,4,3,1,1],[1,3,4,1,1,1],[2,1,1,1,4,1],[1,2,4,2,1,1], // 104 start A, 105 start C, 106 stop, 107 termination bar
  [2,2,1,1,4,1],[4,3,1,1,1,1], // 106 stop (actually [2,3,3,1,1,1,2] is 7 elements stop)
];
// Stop symbol for Code 128: bars pattern "2331112" (7 modules)
// We use a simpler termination bar approach

function drawCode128(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, barH: number, moduleW: number) {
  // Code Set B: ASCII 32-127 mapped to code values 0-95
  // Only support printable ASCII
  const filtered = text.replace(/[^\x20-\x7e]/g, "");
  const codes: number[] = [];

  // Start Code B = value 104
  codes.push(104);
  let checksum = 104;

  for (let i = 0; i < filtered.length; i++) {
    const v = filtered.charCodeAt(i) - 32;
    codes.push(v);
    checksum += v * (i + 1);
  }

  // Check symbol
  codes.push(checksum % 103);
  // Stop = 106
  codes.push(106);

  let cx = x;
  // Leading quiet zone = 10 modules
  cx += moduleW * 10;

  function drawSymbol(code: number) {
    const widths = C128_WIDTHS[code];
    if (!widths) return;
    let bar = true;
    for (const w of widths) {
      if (bar) {
        ctx.fillStyle = "#000";
        ctx.fillRect(cx, y, w * moduleW, barH);
      }
      cx += w * moduleW;
      bar = !bar;
    }
  }

  for (const code of codes) {
    drawSymbol(code);
  }
  // Termination bar (2 modules wide)
  ctx.fillStyle = "#000";
  ctx.fillRect(cx, y, 2 * moduleW, barH);
  cx += 2 * moduleW;
  // Trailing quiet zone
  cx += moduleW * 10;

  // Human-readable text below
  ctx.fillStyle = "#000";
  ctx.font = `${moduleW * 8}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(text, (x + cx) / 2, y + barH + 12);

  return cx;
}

function renderBarcode(canvas: HTMLCanvasElement, text: string, type: BarcodeType) {
  const dpr = window.devicePixelRatio || 1;
  const barH = 80;
  const narrow = 2;
  const modW = 2;
  const padding = 20;

  // Estimate canvas width
  let estimatedW = 400;
  if (type === "ean13") estimatedW = 95 * modW + padding * 2;
  else if (type === "code39") {
    const upper = text.toUpperCase();
    const chars = `*${upper}*`;
    let w = 0;
    for (const c of chars) {
      const p = C39[c];
      if (!p) continue;
      let cw = 0;
      for (let j = 0; j < 9; j++) cw += p[j] === "1" ? narrow * 3 : narrow;
      w += cw + narrow;
    }
    estimatedW = w + padding * 2;
  } else if (type === "code128") {
    const filtered = text.replace(/[^\x20-\x7e]/g, "");
    let w = 0;
    // Start(11) + n symbols(11 each) + check(11) + stop(13) + 2 quiet(10 each)
    w = (1 + filtered.length + 1 + 1) * 11 * modW + 13 * modW + 20 * modW;
    estimatedW = w + padding * 2;
  }

  const canvasW = Math.max(estimatedW, 200);
  const canvasH = barH + 40;

  canvas.width = canvasW * dpr;
  canvas.height = canvasH * dpr;
  canvas.style.width = `${canvasW}px`;
  canvas.style.height = `${canvasH}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  if (type === "code39") {
    const valid = text.toUpperCase().split("").every(c => C39[c] !== undefined);
    if (!valid) return "Invalid characters for Code 39 (use A-Z 0-9 - . space $ / + %)";
    drawCode39(ctx, text, padding, 10, barH, narrow);
  } else if (type === "ean13") {
    const digits = text.replace(/\D/g, "");
    if (digits.length < 12) return "EAN-13 requires at least 12 digits";
    drawEan13(ctx, digits, padding, 10, barH, modW);
  } else {
    if (!text) return "Enter text to generate barcode";
    drawCode128(ctx, text, padding, 10, barH, modW);
  }
  return null;
}

export function BarcodeTool() {
  const [input, setInput] = useState("DEVPICK");
  const [type, setType] = useState<BarcodeType>("code128");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !input.trim()) {
      setError(input.trim() ? null : "Enter text to generate barcode"); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const err = renderBarcode(canvasRef.current, input.trim(), type);
    setError(err); // eslint-disable-line react-hooks/set-state-in-effect
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [input, type]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `barcode-${type}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const TYPES: { value: BarcodeType; label: string; hint: string }[] = [
    { value: "code128", label: "Code 128", hint: "Text & numbers (most common)" },
    { value: "ean13", label: "EAN-13", hint: "13 digits (retail products)" },
    { value: "code39", label: "Code 39", hint: "A-Z, 0-9 (industrial)" },
  ];

  const placeholder = type === "ean13" ? "123456789012" : type === "code39" ? "DEVPICK" : "devpick.sh";

  return (
    <ToolLayout
      title="Barcode Generator"
      description="Generate Code 128, EAN-13, and Code 39 barcodes — download as PNG"
    >
      {/* Type selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`tab-btn ${type === t.value ? "active" : ""}`}
            title={t.hint}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="tool-textarea flex-1"
          style={{ height: "40px", padding: "8px 12px", resize: "none" }}
          spellCheck={false}
        />
      </div>

      {/* Canvas output */}
      <div className="bg-white border border-[var(--dp-border)] rounded-lg p-6 flex flex-col items-center gap-4 min-h-[160px]">
        {error && (
          <div className="text-[var(--dp-error)] text-sm">{error}</div>
        )}
        <canvas
          ref={canvasRef}
          className="max-w-full"
          style={{ imageRendering: "pixelated", display: error ? "none" : "block" }}
        />
      </div>

      {!error && (
        <div className="flex justify-center mt-4">
          <button onClick={download} className="action-btn">
            <Download size={13} />
            Download PNG
          </button>
        </div>
      )}

      <div className="mt-3 text-xs text-text-dimmed text-center">
        {TYPES.find(t => t.value === type)?.hint}
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-[var(--dp-border)]">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "QR Code Generator", href: "/qr-code-generator" },
            { name: "UUID Generator", href: "/uuid-generator" },
            { name: "Hash Generator", href: "/hash-generator" },
            { name: "Password Generator", href: "/password-generator" },
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
