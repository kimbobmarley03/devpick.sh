"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

// ── SAML Decoding ──────────────────────────────────────────────────────────

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function inflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  // Use browser DecompressionStream (deflate-raw) for SAML Redirect binding
  const ds = new (globalThis as unknown as { DecompressionStream: new (format: string) => DecompressionStream })
    .DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];

  writer.write(compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength) as ArrayBuffer);
  writer.close();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value as Uint8Array);
  }
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

async function decodeSaml(input: string): Promise<{ xml: string; method: string }> {
  const trimmed = input.trim();

  // 1. Try URL-decode first (SAML Redirect binding uses URL encoding)
  let attempt = trimmed;
  const maybeUrlDecoded = (() => {
    try { return decodeURIComponent(trimmed); } catch { return null; }
  })();
  if (maybeUrlDecoded && maybeUrlDecoded !== trimmed) attempt = maybeUrlDecoded;

  // 2. Try base64 decode → see if it's XML already (POST binding)
  try {
    const decoded = atob(attempt.replace(/\s/g, ""));
    if (decoded.trimStart().startsWith("<")) {
      return { xml: decoded, method: "Base64 → XML (POST binding)" };
    }
    // 3. Try deflate-raw (Redirect binding: URL-decode → base64 → deflate)
    const bytes = base64ToBytes(attempt.replace(/\s/g, ""));
    try {
      const inflated = await inflateRaw(bytes);
      const xml = new TextDecoder().decode(inflated);
      if (xml.trimStart().startsWith("<")) {
        return { xml, method: "URL-decode → Base64 → Deflate-raw (Redirect binding)" };
      }
    } catch {
      // Not deflated — try raw bytes as UTF-8
    }
    if (decoded.trimStart().startsWith("<")) {
      return { xml: decoded, method: "Base64 → XML" };
    }
  } catch {
    // Not base64
  }

  // 4. Maybe it's already XML
  if (trimmed.trimStart().startsWith("<")) {
    return { xml: trimmed, method: "Raw XML" };
  }

  throw new Error("Could not decode input. Paste a base64-encoded SAML assertion or response.");
}

// ── XML Highlighting ───────────────────────────────────────────────────────

interface SAMLField {
  label: string;
  value: string;
}

function extractField(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<[^>]*:?${tag}[^>]*>([^<]*)<\/[^>]*:?${tag}>`));
  return match ? match[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<[^>]*:?${tag}[^>]*\\s${attr}="([^"]*)"[^>]*>`));
  return match ? match[1] : "";
}

function extractAllAttrs(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<[^>]*:?${tag}[^>]*/?>`, "g");
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[0]);
  }
  return results;
}

function parseHighlightedFields(xml: string): SAMLField[] {
  const fields: SAMLField[] = [];

  // Issuer
  const issuer = extractField(xml, "Issuer");
  if (issuer) fields.push({ label: "Issuer", value: issuer });

  // NameID
  const nameId = extractField(xml, "NameID");
  if (nameId) fields.push({ label: "NameID", value: nameId });

  // Subject
  const subjectFormat = extractAttr(xml, "NameID", "Format");
  if (subjectFormat) fields.push({ label: "NameID Format", value: subjectFormat });

  // NotBefore / NotOnOrAfter (Conditions)
  const notBefore = extractAttr(xml, "Conditions", "NotBefore");
  if (notBefore) fields.push({ label: "Not Before", value: notBefore });
  const notAfter = extractAttr(xml, "Conditions", "NotOnOrAfter");
  if (notAfter) fields.push({ label: "Not On Or After", value: notAfter });

  // SubjectConfirmationData
  const recipient = extractAttr(xml, "SubjectConfirmationData", "Recipient");
  if (recipient) fields.push({ label: "Recipient (ACS URL)", value: recipient });

  const notOnOrAfter = extractAttr(xml, "SubjectConfirmationData", "NotOnOrAfter");
  if (notOnOrAfter) fields.push({ label: "SubjectConfirmation Expires", value: notOnOrAfter });

  // Status
  const status = extractField(xml, "StatusCode");
  if (!status) {
    const statusCodes = extractAllAttrs(xml, "StatusCode");
    if (statusCodes.length > 0) {
      const valMatch = statusCodes[0].match(/Value="([^"]*)"/);
      if (valMatch) fields.push({ label: "Status", value: valMatch[1].split(":").pop() || valMatch[1] });
    }
  }

  // Attribute assertions
  const attrMatches = [...xml.matchAll(/<[^>]*:?Attribute\s[^>]*Name="([^"]*)"[^>]*>([\s\S]*?)<\/[^>]*:?Attribute>/g)];
  for (const m of attrMatches) {
    const attrName = m[1];
    const attrBody = m[2];
    const vals = [...attrBody.matchAll(/<[^>]*:?AttributeValue[^>]*>([^<]*)<\/[^>]*:?AttributeValue>/g)];
    const values = vals.map((v) => v[1].trim()).filter(Boolean);
    if (values.length > 0) {
      fields.push({ label: `Attribute: ${attrName}`, value: values.join(", ") });
    }
  }

  return fields;
}

// Pretty-print XML
function prettyPrintXml(xml: string): string {
  let formatted = "";
  let indent = 0;
  const lines = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;
    if (stripped.startsWith("</")) indent -= 1;
    formatted += "  ".repeat(Math.max(0, indent)) + stripped + "\n";
    if (stripped.startsWith("<") && !stripped.startsWith("</") && !stripped.startsWith("<?") && !stripped.endsWith("/>") && !stripped.includes("</")) {
      indent += 1;
    }
  }
  return formatted.trimEnd();
}

const SAMPLE = `PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6
cHJvdG9jb2wiIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRp
b24iIElEPSJfYWJjMTIzIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAyNC0wMS0wMVQx
MjowMDowMFoiPjxzYW1sOklzc3Vlcj5odHRwczovL2lkcC5leGFtcGxlLmNvbTwvc2FtbDpJc3N1
ZXI+PHNhbWxwOlN0YXR1cz48c2FtbHA6U3RhdHVzQ29kZSBWYWx1ZT0idXJuOm9hc2lzOm5hbWVz
OnRjOlNBTUw6Mi4wOnN0YXR1czpTdWNjZXNzIi8+PC9zYW1scDpTdGF0dXM+PHNhbWw6QXNzZXJ0
aW9uIElEPSJfYXNzZXJ0MSIgVmVyc2lvbj0iMi4wIj48c2FtbDpJc3N1ZXI+aHR0cHM6Ly9pZHAu
ZXhhbXBsZS5jb208L3NhbWw6SXNzdWVyPjxzYW1sOlN1YmplY3Q+PHNhbWw6TmFtZUlEIEZvcm1h
dD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6ZW1haWxBZGRyZXNz
Ij51c2VyQGV4YW1wbGUuY29tPC9zYW1sOk5hbWVJRD48L3NhbWw6U3ViamVjdD48c2FtbDpDb25k
aXRpb25zIE5vdEJlZm9yZT0iMjAyNC0wMS0wMVQxMTowMDowMFoiIE5vdE9uT3JBZnRlcj0iMjAy
NC0wMS0wMVQxMzowMDowMFoiLz48c2FtbDpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWw6QXR0cmli
dXRlIE5hbWU9ImVtYWlsIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZT51c2VyQGV4YW1wbGUuY29tPC9z
YW1sOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDpBdHRyaWJ1dGU+PHNhbWw6QXR0cmlidXRlIE5hbWU9
InJvbGUiPjxzYW1sOkF0dHJpYnV0ZVZhbHVlPmFkbWluPC9zYW1sOkF0dHJpYnV0ZVZhbHVlPjwv
c2FtbDpBdHRyaWJ1dGU+PC9zYW1sOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWw6QXNzZXJ0aW9u
Pjwvc2FtbHA6UmVzcG9uc2U+`;

export function SamlDecoderTool() {
  useWebMCP({
    name: "samlDecode",
    description: "Decode a base64-encoded SAML response or assertion",
    inputSchema: {
      type: "object" as const,
      properties: {
        saml: { type: "string", description: "Base64-encoded SAML string" },
      },
      required: ["saml"],
    },
    execute: async (params) => {
      try {
        const { xml } = await decodeSaml(params.saml as string);
        return { content: [{ type: "text", text: prettyPrintXml(xml) }] };
      } catch (e) {
        return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Unknown error") }] };
      }
    },
  });

  const [input, setInput] = useState(SAMPLE);
  const [xml, setXml] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<SAMLField[]>([]);
  const [showXml, setShowXml] = useState(false);
  const [decoding, setDecoding] = useState(false);

  const decode = async (val: string) => {
    if (!val.trim()) { setXml(""); setFields([]); setError(""); setMethod(""); return; }
    setDecoding(true);
    try {
      const result = await decodeSaml(val);
      const pretty = prettyPrintXml(result.xml);
      setXml(pretty);
      setMethod(result.method);
      setFields(parseHighlightedFields(result.xml));
      setError("");
    } catch (e) {
      setXml("");
      setFields([]);
      setError((e as Error).message);
    } finally {
      setDecoding(false);
    }
  };

  return (
    <ToolLayout
      agentReady
      title="SAML Decoder"
      description="Decode base64-encoded SAML responses and assertions. Supports POST binding (base64), Redirect binding (URL-encoded + deflate), and raw XML."
    >
      <div className="flex flex-col gap-5">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="pane-label">SAML Input</label>
            <div className="flex gap-2">
              <button onClick={() => { setInput(""); setXml(""); setFields([]); setError(""); setMethod(""); }} className="action-btn">
                <Trash2 size={13} /> Clear
              </button>
              <button
                onClick={() => decode(input)}
                disabled={decoding || !input.trim()}
                className="action-btn primary"
              >
                {decoding ? "Decoding…" : "Decode"}
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste base64-encoded SAML response, URL-encoded SAML, or raw XML…"
            className="tool-textarea min-h-[120px]"
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void decode(input); }
            }}
          />
          <p className="text-xs text-text-muted font-mono">⌘↵ to decode · supports POST binding, Redirect binding, and raw XML</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-[var(--dp-error)] bg-[var(--dp-error)]/10 border border-[var(--dp-error)]/20 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Detected Fields */}
        {fields.length > 0 && (
          <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border-subtle bg-surface-subtle flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wide">Key Fields</span>
              {method && <span className="text-[11px] text-text-muted font-mono">{method}</span>}
            </div>
            <div className="divide-y divide-border-subtle">
              {fields.map((f, i) => (
                <div key={i} className="flex items-start gap-4 px-4 py-2.5 hover:bg-surface-subtle transition-colors">
                  <div className="text-xs font-mono text-text-muted w-52 shrink-0 pt-0.5">{f.label}</div>
                  <div className="text-sm text-text-primary font-mono break-all flex-1">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full XML */}
        {xml && (
          <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowXml((v) => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 border-b border-border-subtle hover:bg-surface-subtle transition-colors text-left"
            >
              {showXml ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-sm font-mono font-semibold text-text-secondary">Full XML</span>
              <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                <CopyButton text={xml} />
              </div>
            </button>
            {showXml && (
              <div className="overflow-auto max-h-[500px]">
                <pre className="text-[12px] font-mono leading-relaxed p-4 text-text-primary whitespace-pre-wrap break-all">
                  {xml}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JWT Decoder", href: "/jwt-decoder" },
            { name: "Base64", href: "/base64" },
            { name: "Certificate Decoder", href: "/certificate-decoder" },
            { name: "XML Formatter", href: "/xml-formatter" },
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
