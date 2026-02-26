import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Portable YAML parser (no external deps)
type YamlValue = string | number | boolean | null | YamlValue[] | YamlObject;
type YamlObject = { [key: string]: YamlValue };

function parseScalar(raw: string): YamlValue {
  const s = raw.trim();
  if (s === "null" || s === "~" || s === "") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseYaml(text: string): YamlValue {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/#[^'"]*$/g, "").trimEnd());
  let pos = 0;
  function getIndent(line: string): number { return line.search(/\S/); }
  function skipBlanks() { while (pos < lines.length && lines[pos].trim() === "") pos++; }
  function parseBlock(baseIndent: number): YamlValue {
    skipBlanks();
    if (pos >= lines.length) return null;
    const line = lines[pos];
    const indent = getIndent(line);
    if (indent < baseIndent) return null;
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed === "-") return parseSequence(indent);
    if (trimmed.includes(": ") || trimmed.endsWith(":")) return parseMapping(indent);
    pos++;
    return parseScalar(trimmed);
  }
  function parseSequence(seqIndent: number): YamlValue[] {
    const arr: YamlValue[] = [];
    while (pos < lines.length) {
      skipBlanks();
      if (pos >= lines.length) break;
      const line = lines[pos];
      if (line.trim() === "") { pos++; continue; }
      if (getIndent(line) < seqIndent) break;
      const trimmed = line.trim();
      if (!trimmed.startsWith("-")) break;
      const rest = trimmed.slice(1).trim();
      pos++;
      if (rest === "") {
        skipBlanks();
        if (pos < lines.length && getIndent(lines[pos]) > seqIndent) arr.push(parseBlock(getIndent(lines[pos])));
        else arr.push(null);
      } else if (rest.includes(": ") || rest.endsWith(":")) {
        const obj: YamlObject = {};
        const colonIdx = rest.indexOf(": ");
        const key = colonIdx === -1 ? rest.slice(0, -1) : rest.slice(0, colonIdx);
        const val = colonIdx === -1 ? "" : rest.slice(colonIdx + 2);
        if (val.trim() === "") {
          skipBlanks();
          if (pos < lines.length && getIndent(lines[pos]) > seqIndent) obj[key] = parseBlock(getIndent(lines[pos]));
          else obj[key] = null;
        } else { obj[key] = parseScalar(val); }
        while (pos < lines.length) {
          skipBlanks();
          if (pos >= lines.length) break;
          const l = lines[pos];
          if (!l.trim() || getIndent(l) <= seqIndent || l.trim().startsWith("-")) break;
          const t = l.trim();
          const ci = t.indexOf(": ");
          const tc = t.endsWith(":");
          if (ci !== -1) { obj[t.slice(0, ci)] = parseScalar(t.slice(ci + 2)); pos++; }
          else if (tc) { const k = t.slice(0, -1); pos++; skipBlanks(); obj[k] = pos < lines.length && getIndent(lines[pos]) > seqIndent ? parseBlock(getIndent(lines[pos])) : null; }
          else break;
        }
        arr.push(obj);
      } else { arr.push(parseScalar(rest)); }
    }
    return arr;
  }
  function parseMapping(mapIndent: number): YamlObject {
    const obj: YamlObject = {};
    while (pos < lines.length) {
      skipBlanks();
      if (pos >= lines.length) break;
      const line = lines[pos];
      if (line.trim() === "") { pos++; continue; }
      const indent = getIndent(line);
      if (indent !== mapIndent) break;
      const trimmed = line.trim();
      if (trimmed.startsWith("-")) break;
      const colonIdx = trimmed.indexOf(": ");
      const trailingColon = trimmed.endsWith(":");
      if (colonIdx === -1 && !trailingColon) break;
      let key: string, valStr: string;
      if (colonIdx !== -1) { key = trimmed.slice(0, colonIdx); valStr = trimmed.slice(colonIdx + 2); }
      else { key = trimmed.slice(0, -1); valStr = ""; }
      pos++;
      if (valStr.trim() === "") {
        skipBlanks();
        obj[key] = pos < lines.length && getIndent(lines[pos]) > mapIndent ? parseBlock(getIndent(lines[pos])) : null;
      } else { obj[key] = parseScalar(valStr); }
    }
    return obj;
  }
  return parseBlock(0);
}

export function register(server: McpServer) {
  server.tool(
    "yaml_to_json",
    "Convert YAML to JSON",
    {
      yaml: z.string().describe("YAML string to convert"),
      indent: z.number().optional().default(2).describe("JSON indent spaces"),
    },
    async ({ yaml, indent }) => {
      try {
        const parsed = parseYaml(yaml);
        return { content: [{ type: "text", text: JSON.stringify(parsed, null, indent) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Parse failed"}` }],
          isError: true,
        };
      }
    }
  );
}
