"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Trash2, AlertCircle, ChevronDown, ChevronRight, Shield, FileText } from "lucide-react";

// ── ASN.1 DER Parser ────────────────────────────────────────────────────────

interface AsnNode {
  tag: number;
  constructed: boolean;
  bytes: Uint8Array;  // raw value bytes
  children?: AsnNode[];
}

function readLength(buf: Uint8Array, offset: number): { length: number; bytesRead: number } {
  const first = buf[offset];
  if (!(first & 0x80)) return { length: first, bytesRead: 1 };
  const numBytes = first & 0x7f;
  if (numBytes === 0) return { length: -1, bytesRead: 1 }; // indefinite — not supported
  let length = 0;
  for (let i = 0; i < numBytes; i++) length = (length * 256) + buf[offset + 1 + i];
  return { length, bytesRead: 1 + numBytes };
}

function parseNode(buf: Uint8Array, offset: number): { node: AsnNode; end: number } {
  const tagByte = buf[offset];
  const constructed = !!(tagByte & 0x20);
  let tag = tagByte & 0x1f;
  let off = offset + 1;
  if (tag === 0x1f) {
    tag = 0;
    while (buf[off] & 0x80) { tag = (tag << 7) | (buf[off++] & 0x7f); }
    tag = (tag << 7) | buf[off++];
  }
  // Context class: keep tag as-is but include class bits for distinguishing
  const fullTag = tagByte;

  const { length, bytesRead } = readLength(buf, off);
  off += bytesRead;
  const valueBytes = buf.slice(off, off + length);
  const end = off + length;

  const node: AsnNode = { tag: fullTag, constructed, bytes: valueBytes };
  if (constructed) {
    node.children = parseChildren(valueBytes);
  }
  return { node, end };
}

function parseChildren(buf: Uint8Array): AsnNode[] {
  const children: AsnNode[] = [];
  let offset = 0;
  while (offset < buf.length) {
    try {
      const { node, end } = parseNode(buf, offset);
      children.push(node);
      offset = end;
    } catch { break; }
  }
  return children;
}

function parseDer(der: Uint8Array): AsnNode {
  const { node } = parseNode(der, 0);
  return node;
}

// ── OID Decoding ─────────────────────────────────────────────────────────────

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const components: number[] = [];
  const first = bytes[0];
  components.push(Math.floor(first / 40));
  components.push(first % 40);
  let value = 0;
  for (let i = 1; i < bytes.length; i++) {
    value = (value << 7) | (bytes[i] & 0x7f);
    if (!(bytes[i] & 0x80)) { components.push(value); value = 0; }
  }
  return components.join(".");
}

const OID_NAMES: Record<string, string> = {
  // DN attributes
  "2.5.4.3": "CN", "2.5.4.4": "SN", "2.5.4.5": "serialNumber",
  "2.5.4.6": "C", "2.5.4.7": "L", "2.5.4.8": "ST", "2.5.4.9": "street",
  "2.5.4.10": "O", "2.5.4.11": "OU", "2.5.4.12": "title",
  "2.5.4.41": "name", "2.5.4.42": "givenName", "2.5.4.43": "initials",
  "2.5.4.97": "organizationIdentifier",
  "1.2.840.113549.1.9.1": "emailAddress",
  "0.9.2342.19200300.100.1.25": "DC",
  // Signature algorithms
  "1.2.840.113549.1.1.1": "rsaEncryption",
  "1.2.840.113549.1.1.4": "md5WithRSAEncryption",
  "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
  "1.2.840.10045.2.1": "ecPublicKey",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
  "1.3.101.110": "X25519", "1.3.101.111": "X448",
  "1.3.101.112": "Ed25519", "1.3.101.113": "Ed448",
  "2.16.840.1.101.3.4.2.1": "SHA-256",
  "2.16.840.1.101.3.4.2.2": "SHA-384",
  "2.16.840.1.101.3.4.2.3": "SHA-512",
  // EC curves
  "1.2.840.10045.3.1.7": "P-256 (prime256v1)",
  "1.3.132.0.34": "P-384 (secp384r1)",
  "1.3.132.0.35": "P-521 (secp521r1)",
  "1.3.132.0.10": "secp256k1",
  // Extensions
  "2.5.29.9": "subjectDirectoryAttributes",
  "2.5.29.14": "subjectKeyIdentifier",
  "2.5.29.15": "keyUsage",
  "2.5.29.17": "subjectAltName",
  "2.5.29.18": "issuerAltName",
  "2.5.29.19": "basicConstraints",
  "2.5.29.31": "cRLDistributionPoints",
  "2.5.29.32": "certificatePolicies",
  "2.5.29.35": "authorityKeyIdentifier",
  "2.5.29.37": "extKeyUsage",
  "1.3.6.1.5.5.7.1.1": "authorityInfoAccess",
  "1.3.6.1.4.1.11129.2.4.2": "signedCertificateTimestamps",
  // EKU
  "1.3.6.1.5.5.7.3.1": "serverAuth",
  "1.3.6.1.5.5.7.3.2": "clientAuth",
  "1.3.6.1.5.5.7.3.3": "codeSigning",
  "1.3.6.1.5.5.7.3.4": "emailProtection",
  "1.3.6.1.5.5.7.3.8": "timeStamping",
  "1.3.6.1.5.5.7.3.9": "ocspSigning",
  // AIA
  "1.3.6.1.5.5.7.48.1": "OCSP",
  "1.3.6.1.5.5.7.48.2": "caIssuers",
};

function oidName(oid: string): string {
  return OID_NAMES[oid] || oid;
}

// ── String Decoding ────────────────────────────────────────────────────────

function decodeString(node: AsnNode): string {
  // UTF8String, PrintableString, IA5String, T61String, VisibleString, BMPString, UTF8String
  const tag = node.tag & 0x1f;
  if (tag === 0x1e) {
    // BMPString: UTF-16 BE
    const chars: string[] = [];
    for (let i = 0; i + 1 < node.bytes.length; i += 2)
      chars.push(String.fromCharCode((node.bytes[i] << 8) | node.bytes[i + 1]));
    return chars.join("");
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(node.bytes);
}

function decodeTime(node: AsnNode): string {
  const s = decodeString(node);
  if (node.tag === 0x17) {
    // UTCTime: YYMMDDHHMMSSZ
    const year = parseInt(s.slice(0, 2)) >= 50 ? "19" + s.slice(0, 2) : "20" + s.slice(0, 2);
    return `${year}-${s.slice(2, 4)}-${s.slice(4, 6)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)} UTC`;
  }
  if (node.tag === 0x18) {
    // GeneralizedTime: YYYYMMDDHHMMSSZ
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)} UTC`;
  }
  return s;
}

function decodeInteger(bytes: Uint8Array): string {
  // Remove leading zero byte (sign indicator for positive)
  let start = 0;
  while (start < bytes.length - 1 && bytes[start] === 0) start++;
  const hex = Array.from(bytes.slice(start)).map((b) => b.toString(16).padStart(2, "0")).join(":");
  return hex.toUpperCase();
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(":").toUpperCase();
}

// ── Name Parsing ───────────────────────────────────────────────────────────

function parseName(seq: AsnNode): string {
  const parts: string[] = [];
  for (const rdnSet of seq.children || []) {
    for (const atv of rdnSet.children || []) {
      const [oidNode, valNode] = atv.children || [];
      if (!oidNode || !valNode) continue;
      const oid = decodeOid(oidNode.bytes);
      const name = OID_NAMES[oid] || oid;
      const value = decodeString(valNode);
      parts.push(`${name}=${value}`);
    }
  }
  return parts.join(", ");
}

// ── Key Usage ─────────────────────────────────────────────────────────────

const KEY_USAGE_BITS = [
  "digitalSignature", "nonRepudiation", "keyEncipherment", "dataEncipherment",
  "keyAgreement", "keyCertSign", "cRLSign", "encipherOnly", "decipherOnly",
];

function parseKeyUsage(bytes: Uint8Array): string {
  // BIT STRING: first byte = unused bits count
  if (bytes.length < 2) return "";
  const _unusedBits = bytes[0]; // eslint-disable-line @typescript-eslint/no-unused-vars
  const usages: string[] = [];
  for (let byteIdx = 1; byteIdx < bytes.length; byteIdx++) {
    for (let bit = 7; bit >= 0; bit--) {
      const idx = (byteIdx - 1) * 8 + (7 - bit);
      if (idx < KEY_USAGE_BITS.length && (bytes[byteIdx] >> bit) & 1) {
        usages.push(KEY_USAGE_BITS[idx]);
      }
    }
  }
  return usages.join(", ");
}

// ── SAN Parsing ────────────────────────────────────────────────────────────

function parseSAN(bytes: Uint8Array): string[] {
  const names: string[] = [];
  const seq = parseDer(bytes);
  for (const item of seq.children || []) {
    const tagLow = item.tag & 0x1f;
    switch (tagLow) {
      case 0: names.push(`otherName`); break;
      case 1: names.push(`email:${new TextDecoder().decode(item.bytes)}`); break;
      case 2: names.push(`DNS:${new TextDecoder().decode(item.bytes)}`); break;
      case 6: names.push(`URI:${new TextDecoder().decode(item.bytes)}`); break;
      case 7: {
        if (item.bytes.length === 4) {
          names.push(`IP:${Array.from(item.bytes).join(".")}`);
        } else if (item.bytes.length === 16) {
          const parts: string[] = [];
          for (let i = 0; i < 16; i += 2)
            parts.push(((item.bytes[i] << 8) | item.bytes[i + 1]).toString(16));
          names.push(`IP:${parts.join(":")}`);
        }
        break;
      }
    }
  }
  return names;
}

// ── EKU Parsing ───────────────────────────────────────────────────────────

function parseEKU(bytes: Uint8Array): string[] {
  const seq = parseDer(bytes);
  return (seq.children || []).map((c) => oidName(decodeOid(c.bytes)));
}

// ── Public Key Info ────────────────────────────────────────────────────────

interface PubKeyInfo {
  algorithm: string;
  keySize: string;
  curve?: string;
}

function parsePublicKeyInfo(node: AsnNode): PubKeyInfo {
  const [algSeq, keyBitStr] = node.children || [];
  if (!algSeq) return { algorithm: "unknown", keySize: "" };
  const [algOidNode, algParamNode] = algSeq.children || [];
  const algOid = algOidNode ? decodeOid(algOidNode.bytes) : "";
  const algName = oidName(algOid);

  if (algOid === "1.2.840.113549.1.1.1") {
    // RSA: parse modulus from public key
    if (keyBitStr && keyBitStr.bytes.length > 1) {
      try {
        const keyData = keyBitStr.bytes.slice(1); // skip unused-bits byte
        const rsaSeq = parseDer(keyData);
        const modulusNode = rsaSeq.children?.[0];
        if (modulusNode) {
          let modLen = modulusNode.bytes.length;
          if (modulusNode.bytes[0] === 0) modLen--;
          return { algorithm: "RSA", keySize: `${modLen * 8} bits` };
        }
      } catch { /* fall through */ }
    }
    return { algorithm: "RSA", keySize: "" };
  }
  if (algOid === "1.2.840.10045.2.1") {
    // EC
    const curveOid = algParamNode ? decodeOid(algParamNode.bytes) : "";
    const curveName = oidName(curveOid);
    return { algorithm: "EC", keySize: "", curve: curveName };
  }
  if (algOid === "1.3.101.112") return { algorithm: "Ed25519", keySize: "256 bits" };
  if (algOid === "1.3.101.113") return { algorithm: "Ed448", keySize: "448 bits" };
  return { algorithm: algName, keySize: "" };
}

// ── Extensions ─────────────────────────────────────────────────────────────

interface Extension {
  oid: string;
  name: string;
  critical: boolean;
  value: string | string[];
}

function parseExtensions(extNode: AsnNode): Extension[] {
  const exts: Extension[] = [];
  // extNode is [3] CONTEXT, its child is SEQUENCE OF Extension
  const extSeq = extNode.children?.[0];
  if (!extSeq) return exts;
  for (const extItem of extSeq.children || []) {
    const children = extItem.children || [];
    let idx = 0;
    const oidNode = children[idx++];
    if (!oidNode) continue;
    const oid = decodeOid(oidNode.bytes);
    let critical = false;
    if (children[idx]?.tag === 0x01) {
      critical = children[idx].bytes[0] === 0xff;
      idx++;
    }
    const valueNode = children[idx];
    if (!valueNode) continue;
    // The value is an OCTET STRING wrapping the DER-encoded extension value
    const extValue = valueNode.bytes;

    let parsedValue: string | string[] = toHex(extValue).slice(0, 100) + (extValue.length > 50 ? "…" : "");

    try {
      switch (oid) {
        case "2.5.29.15": { // keyUsage
          const inner = parseDer(extValue);
          parsedValue = parseKeyUsage(inner.bytes) || "none";
          break;
        }
        case "2.5.29.17": { // SAN
          parsedValue = parseSAN(extValue);
          break;
        }
        case "2.5.29.37": { // EKU
          parsedValue = parseEKU(extValue);
          break;
        }
        case "2.5.29.19": { // basicConstraints
          const inner = parseDer(extValue);
          const isCA = inner.children?.some((c) => c.tag === 0x01 && c.bytes[0] === 0xff);
          const pathLenNode = inner.children?.find((c) => c.tag === 0x02);
          parsedValue = `CA: ${isCA ? "true" : "false"}${pathLenNode ? `, pathLen: ${pathLenNode.bytes[0]}` : ""}`;
          break;
        }
        case "2.5.29.14": { // SKI
          const inner = parseDer(extValue);
          parsedValue = toHex(inner.bytes);
          break;
        }
      }
    } catch { /* use default hex */ }

    exts.push({ oid, name: oidName(oid), critical, value: parsedValue });
  }
  return exts;
}

// ── Certificate Parsing ────────────────────────────────────────────────────

interface CertInfo {
  type: "certificate" | "csr";
  version?: string;
  serialNumber?: string;
  signatureAlgorithm: string;
  subject: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
  publicKey: PubKeyInfo;
  extensions?: Extension[];
  fingerprint?: string;
}

async function pemToDer(pem: string): Promise<Uint8Array> {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function detectType(pem: string): "certificate" | "csr" {
  if (pem.includes("CERTIFICATE REQUEST") || pem.includes("NEW CERTIFICATE REQUEST")) return "csr";
  return "certificate";
}

async function computeFingerprint(der: Uint8Array): Promise<string> {
  const hashBuf = await crypto.subtle.digest("SHA-256", der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer);
  const arr = Array.from(new Uint8Array(hashBuf));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join(":").toUpperCase();
}

async function parseCertificate(pem: string): Promise<CertInfo> {
  const type = detectType(pem);
  const der = await pemToDer(pem);
  const root = parseDer(der);
  const topChildren = root.children || [];

  if (type === "csr") {
    // PKCS#10: SEQUENCE { certRequestInfo, algId, sig }
    const cri = topChildren[0];
    if (!cri?.children) throw new Error("Invalid CSR structure");
    const criChildren = cri.children;
    // version, subject, subjectPKInfo, [attributes]
    const subjectNode = criChildren[1];
    const spkiNode = criChildren[2];
    const algNode = topChildren[1];

    const algOidNode = algNode?.children?.[0];
    const algOid = algOidNode ? decodeOid(algOidNode.bytes) : "";

    return {
      type: "csr",
      subject: subjectNode ? parseName(subjectNode) : "",
      signatureAlgorithm: oidName(algOid),
      publicKey: spkiNode ? parsePublicKeyInfo(spkiNode) : { algorithm: "unknown", keySize: "" },
    };
  }

  // Certificate: SEQUENCE { tbsCert, algId, sig }
  const tbs = topChildren[0];
  if (!tbs?.children) throw new Error("Invalid certificate structure");
  const tbsChildren = tbs.children;
  let idx = 0;

  // Version [0] EXPLICIT INTEGER
  let version = "v1";
  if (tbsChildren[idx]?.tag === 0xa0) {
    const vInt = tbsChildren[idx].children?.[0];
    if (vInt) version = `v${(vInt.bytes[0] || 0) + 1}`;
    idx++;
  }

  const serialNode = tbsChildren[idx++]; // INTEGER
  idx++; // AlgorithmIdentifier (in tbs) — skip
  const issuerNode = tbsChildren[idx++]; // Name
  const validityNode = tbsChildren[idx++]; // Validity
  const subjectNode = tbsChildren[idx++]; // Name
  const spkiNode = tbsChildren[idx++]; // SubjectPublicKeyInfo

  // Skip [1], [2] if present
  while (idx < tbsChildren.length && (tbsChildren[idx].tag === 0x81 || tbsChildren[idx].tag === 0x82)) idx++;

  // Extensions [3]
  const extContextNode = tbsChildren[idx]; // May be [3] (0xa3)

  // Outer sig algorithm
  const outerAlgNode = topChildren[1];
  const outerAlgOid = outerAlgNode?.children?.[0] ? decodeOid(outerAlgNode.children[0].bytes) : "";

  const serial = serialNode ? decodeInteger(serialNode.bytes) : "";
  const subject = subjectNode ? parseName(subjectNode) : "";
  const issuer = issuerNode ? parseName(issuerNode) : "";
  const notBefore = validityNode?.children?.[0] ? decodeTime(validityNode.children[0]) : "";
  const notAfter = validityNode?.children?.[1] ? decodeTime(validityNode.children[1]) : "";

  const pubKey = spkiNode ? parsePublicKeyInfo(spkiNode) : { algorithm: "unknown", keySize: "" };

  let extensions: Extension[] | undefined;
  if (extContextNode?.tag === 0xa3) {
    extensions = parseExtensions(extContextNode);
  }

  const fingerprint = await computeFingerprint(der);

  return {
    type: "certificate",
    version,
    serialNumber: serial,
    signatureAlgorithm: oidName(outerAlgOid),
    subject,
    issuer,
    notBefore,
    notAfter,
    publicKey: pubKey,
    extensions,
    fingerprint,
  };
}

// ── Sample PEM ─────────────────────────────────────────────────────────────

const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDU+pQ4pHgSpDANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjQwMTAxMTIwMDAwWhcNMjUwMTAxMTIwMDAwWjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
o4qne60TB3pMDnFEuL7wKoAGWLohcuCi9t3k6kHMmzL1LM74o4TMFR+E7KRbklXa
yGBQDLMbK3vJAAWTxG3BVHQ9bfkr2O0lJHG/J7N5bJnN2pLlzS6pHGDAcxVGXHKS
lmXiV0pBm9giBdGb7PJ42OUJR1+hs30mvlSdLOhBUPkjgDHNv3Xf6FrAVgn5R+yF
b5BQKH2bqyUhfJDzchFKNb8OzDZ3G26Ds7G3VfzmEAFW2A8OBLijHFfH4omn5yJ3
aeTfULg2nIBwbdcJ4A8RCMDB/2aO4AENR8F7k7+c4UdgR5VRpWFbNkpSuJBHCZ6w
NRxzLq1qKAfKH8ZFAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABrXkXhcoRSiRojo
bIJMoJpVyHaTn5ORd3rKWjAmcxWpU6W43lXFfBQwi3pkp/I7DblHZ1XxjIqPBYvH
HoVyFrUz3lMvJpOdJG0fWlXIyqoG/oBNOPh1OJflWnMfFW2k3gN1DZMYHjL6HpYi
TRNbvTy2Z7P3L9fKKELNBr2Q1Tk8bJOqHAMIVNKdRxeVJD4Z+kNJnWXvl9y4OLK7
zFRZGVH4bI9uNf1RiHfFQCPIyTZvtnjFLRzpZtknSqGJvE5j9eHQ1E4b0jLDgOj4
X1c4Qb9uWYiHMmMkXETa0JaXeXnj7kCGDH9vfQqD7VBQ0Yt1FGkxHTsPNmj+ym0=
-----END CERTIFICATE-----`;

// ── Component ─────────────────────────────────────────────────────────────

interface Section {
  title: string;
  rows: { label: string; value: string | string[]; mono?: boolean }[];
}

function FieldRow({ label, value, mono }: { label: string; value: string | string[]; mono?: boolean }) {
  const display = Array.isArray(value) ? value : [value];
  return (
    <div className="flex items-start gap-4 px-4 py-2.5 hover:bg-surface-subtle transition-colors border-b border-border-subtle last:border-0">
      <div className="text-xs text-text-muted font-mono w-44 shrink-0 pt-0.5">{label}</div>
      <div className={`flex-1 ${mono ? "font-mono text-xs" : "text-sm"} text-text-primary break-all`}>
        {display.map((v, i) => <div key={i}>{v}</div>)}
      </div>
    </div>
  );
}

function InfoSection({ title, rows, icon }: { title: string; rows: Section["rows"]; icon: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-surface-subtle hover:bg-surface-raised transition-colors text-left"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {icon}
        <span className="text-sm font-semibold text-text-primary">{title}</span>
      </button>
      {open && (
        <div className="divide-y divide-border-subtle">
          {rows.map((r, i) => <FieldRow key={i} label={r.label} value={r.value} mono={r.mono} />)}
        </div>
      )}
    </div>
  );
}

export function CertificateDecoderTool() {
  useWebMCP({
    name: "decodeCertificate",
    description: "Decode a PEM certificate or CSR and return parsed fields",
    inputSchema: {
      type: "object" as const,
      properties: {
        pem: { type: "string", description: "PEM-encoded certificate or CSR" },
      },
      required: ["pem"],
    },
    execute: async (params) => {
      try {
        const info = await parseCertificate(params.pem as string);
        const lines = [
          `Type: ${info.type.toUpperCase()}`,
          info.version ? `Version: ${info.version}` : "",
          info.subject ? `Subject: ${info.subject}` : "",
          info.issuer ? `Issuer: ${info.issuer}` : "",
          info.notBefore ? `Not Before: ${info.notBefore}` : "",
          info.notAfter ? `Not After: ${info.notAfter}` : "",
          `Signature Algorithm: ${info.signatureAlgorithm}`,
          `Public Key: ${info.publicKey.algorithm}${info.publicKey.keySize ? " " + info.publicKey.keySize : ""}${info.publicKey.curve ? " " + info.publicKey.curve : ""}`,
        ].filter(Boolean);
        return { content: [{ type: "text", text: lines.join("\n") }] };
      } catch (e) {
        return { content: [{ type: "text", text: "Error: " + (e instanceof Error ? e.message : "Unknown") }] };
      }
    },
  });

  const [input, setInput] = useState(SAMPLE_PEM);
  const [info, setInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState("");
  const [parsing, setParsing] = useState(false);

  const decode = async (val: string) => {
    if (!val.trim()) { setInfo(null); setError(""); return; }
    setParsing(true);
    try {
      const result = await parseCertificate(val.trim());
      setInfo(result);
      setError("");
    } catch (e) {
      setInfo(null);
      setError((e as Error).message);
    } finally {
      setParsing(false);
    }
  };

  const sanExtension = info?.extensions?.find((e) => e.oid === "2.5.29.17");

  return (
    <ToolLayout
      agentReady
      title="Certificate Decoder"
      description="Decode PEM certificates and CSRs. Parses Subject, Issuer, validity dates, SANs, key usage, and all extensions. 100% client-side."
    >
      <div className="flex flex-col gap-5">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="pane-label">PEM Input (Certificate or CSR)</label>
            <div className="flex gap-2">
              <button onClick={() => { setInput(""); setInfo(null); setError(""); }} className="action-btn">
                <Trash2 size={13} /> Clear
              </button>
              <button
                onClick={() => decode(input)}
                disabled={parsing || !input.trim()}
                className="action-btn primary"
              >
                {parsing ? "Parsing…" : "Decode"}
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste PEM certificate (-----BEGIN CERTIFICATE-----) or CSR (-----BEGIN CERTIFICATE REQUEST-----)"
            className="tool-textarea min-h-[140px]"
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void decode(input); }
            }}
          />
          <p className="text-xs text-text-muted font-mono">⌘↵ to decode</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-[var(--dp-error)] bg-[var(--dp-error)]/10 border border-[var(--dp-error)]/20 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {/* Results */}
        {info && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-full ${info.type === "certificate" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                {info.type === "certificate" ? "X.509 Certificate" : "CSR (PKCS#10)"}
              </span>
              {info.fingerprint && <CopyButton text={info.fingerprint} label="Copy Fingerprint" />}
            </div>

            <InfoSection
              title="Subject"
              icon={<FileText size={14} />}
              rows={[
                { label: "Subject DN", value: info.subject || "(none)" },
                ...(info.issuer ? [{ label: "Issuer DN", value: info.issuer }] : []),
                ...(sanExtension ? [{ label: "Alt Names (SANs)", value: Array.isArray(sanExtension.value) ? sanExtension.value : [sanExtension.value] }] : []),
              ]}
            />

            {info.type === "certificate" && (
              <InfoSection
                title="Validity"
                icon={<Shield size={14} />}
                rows={[
                  { label: "Version", value: info.version || "" },
                  { label: "Serial Number", value: info.serialNumber || "", mono: true },
                  { label: "Not Before", value: info.notBefore || "" },
                  { label: "Not After", value: info.notAfter || "" },
                ]}
              />
            )}

            <InfoSection
              title="Public Key"
              icon={<Shield size={14} />}
              rows={[
                { label: "Algorithm", value: info.publicKey.algorithm },
                ...(info.publicKey.keySize ? [{ label: "Key Size", value: info.publicKey.keySize }] : []),
                ...(info.publicKey.curve ? [{ label: "Curve", value: info.publicKey.curve }] : []),
                { label: "Signature Algorithm", value: info.signatureAlgorithm },
              ]}
            />

            {info.fingerprint && (
              <InfoSection
                title="Fingerprint"
                icon={<Shield size={14} />}
                rows={[{ label: "SHA-256", value: info.fingerprint, mono: true }]}
              />
            )}

            {info.extensions && info.extensions.length > 0 && (
              <InfoSection
                title={`Extensions (${info.extensions.length})`}
                icon={<Shield size={14} />}
                rows={info.extensions.map((ext) => ({
                  label: `${ext.name}${ext.critical ? " ⚠️" : ""}`,
                  value: Array.isArray(ext.value) ? ext.value : [ext.value],
                  mono: true,
                }))}
              />
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
            { name: "SAML Decoder", href: "/saml-decoder" },
            { name: "Hash Generator", href: "/hash-generator" },
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
