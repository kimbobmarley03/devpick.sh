import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function toInterfaceName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function getType(value: unknown, name: string, interfaces: Map<string, string>): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemType = getType(value[0], name + "Item", interfaces);
    return `${itemType}[]`;
  }
  if (typeof value === "object") {
    const ifaceName = toInterfaceName(name);
    buildInterface(value as Record<string, unknown>, ifaceName, interfaces);
    return ifaceName;
  }
  return "unknown";
}

function buildInterface(
  obj: Record<string, unknown>,
  name: string,
  interfaces: Map<string, string>
): void {
  if (interfaces.has(name)) return;
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
    const childName = toInterfaceName(name + "_" + key);
    const type = getType(value, childName, interfaces);
    lines.push(`  ${safeKey}: ${type};`);
  }
  interfaces.set(name, `interface ${name} {\n${lines.join("\n")}\n}`);
}

function jsonToTs(json: string, rootName: string): string {
  const parsed = JSON.parse(json);
  const interfaces = new Map<string, string>();
  const safeName = toInterfaceName(rootName) || "Root";

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return `type ${safeName} = unknown[];`;
    buildInterface(parsed[0] as Record<string, unknown>, safeName + "Item", interfaces);
    interfaces.set("__root__", `type ${safeName} = ${safeName}Item[];`);
  } else if (typeof parsed === "object" && parsed !== null) {
    buildInterface(parsed as Record<string, unknown>, safeName, interfaces);
  } else {
    return `type ${safeName} = ${typeof parsed};`;
  }

  const rootAlias = interfaces.get("__root__");
  interfaces.delete("__root__");
  const parts = Array.from(interfaces.values());
  if (rootAlias) parts.push(rootAlias);
  return parts.join("\n\n");
}

export function register(server: McpServer) {
  server.tool(
    "json_to_typescript",
    "Generate TypeScript interfaces/types from a JSON object or array",
    {
      json: z.string().describe("JSON string to convert"),
      root_name: z.string().optional().default("Root").describe("Name for the root interface (default: Root)"),
    },
    async ({ json, root_name }) => {
      try {
        const output = jsonToTs(json, root_name ?? "Root");
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Invalid JSON"}` }],
          isError: true,
        };
      }
    }
  );
}
