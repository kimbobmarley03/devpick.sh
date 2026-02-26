import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type YamlValue = string | number | boolean | null | YamlValue[] | { [k: string]: YamlValue };

function jsonToYaml(value: YamlValue, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (value === true) return "true";
  if (value === false) return "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (
      value === "" ||
      /^(true|false|null|~)$/i.test(value) ||
      /^-?\d/.test(value) ||
      value.includes(":") ||
      value.includes("#") ||
      value.includes("\n")
    ) {
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value.map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const entries = Object.entries(item as Record<string, YamlValue>);
        if (entries.length === 0) return `${pad}- {}`;
        const [firstKey, firstVal] = entries[0];
        const firstLine = `${pad}- ${firstKey}: ${jsonToYaml(firstVal, indent + 1)}`;
        const rest = entries.slice(1).map(([k, v]) => {
          const serialized = jsonToYaml(v, indent + 1);
          if (v && typeof v === "object") return `${"  ".repeat(indent + 1)}${k}:\n${serialized}`;
          return `${"  ".repeat(indent + 1)}${k}: ${serialized}`;
        }).join("\n");
        return rest ? `${firstLine}\n${rest}` : firstLine;
      }
      const serialized = jsonToYaml(item as YamlValue, indent + 1);
      if (item && typeof item === "object") return `${pad}-\n${serialized}`;
      return `${pad}- ${serialized}`;
    }).join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, YamlValue>);
    if (entries.length === 0) return "{}";
    return entries.map(([k, v]) => {
      if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0) {
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      }
      if (Array.isArray(v)) {
        if (v.length === 0) return `${pad}${k}: []`;
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      }
      return `${pad}${k}: ${jsonToYaml(v, indent + 1)}`;
    }).join("\n");
  }
  return String(value);
}

export function register(server: McpServer) {
  server.tool(
    "json_to_yaml",
    "Convert JSON to YAML",
    {
      json: z.string().describe("JSON string to convert"),
    },
    async ({ json }) => {
      try {
        const parsed = JSON.parse(json) as YamlValue;
        return { content: [{ type: "text", text: jsonToYaml(parsed, 0) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
