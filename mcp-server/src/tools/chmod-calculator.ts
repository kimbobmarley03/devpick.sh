import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function octalToSymbolic(n: number): string {
  return (
    (n & 4 ? "r" : "-") +
    (n & 2 ? "w" : "-") +
    (n & 1 ? "x" : "-")
  );
}

function parseOctal(mode: string): { owner: number; group: number; other: number } | null {
  const m = mode.trim().replace(/^0+/, "") || "0";
  if (!/^[0-7]{1,3}$/.test(m)) return null;
  const padded = m.padStart(3, "0");
  return {
    owner: parseInt(padded[0]),
    group: parseInt(padded[1]),
    other: parseInt(padded[2]),
  };
}

function parseSymbolic(sym: string): { owner: number; group: number; other: number } | null {
  const s = sym.trim();
  if (!/^[rwx-]{9}$/.test(s)) return null;
  const toOctal = (rwx: string) =>
    (rwx[0] === "r" ? 4 : 0) + (rwx[1] === "w" ? 2 : 0) + (rwx[2] === "x" ? 1 : 0);
  return {
    owner: toOctal(s.slice(0, 3)),
    group: toOctal(s.slice(3, 6)),
    other: toOctal(s.slice(6, 9)),
  };
}

function describePermission(n: number): string {
  const perms: string[] = [];
  if (n & 4) perms.push("read");
  if (n & 2) perms.push("write");
  if (n & 1) perms.push("execute");
  return perms.length > 0 ? perms.join(", ") : "none";
}

export function registerChmodCalculator(server: McpServer) {
  server.tool(
    "calculate_chmod",
    "Calculate Unix file permissions from octal (e.g. 755) or symbolic (e.g. rwxr-xr-x) notation",
    {
      mode: z
        .string()
        .describe("Octal mode (e.g. 755, 644) or symbolic (e.g. rwxr-xr-x)"),
    },
    async ({ mode }) => {
      const input = mode.trim();

      let perms: { owner: number; group: number; other: number } | null = null;

      if (/^[0-7]{1,4}$/.test(input)) {
        perms = parseOctal(input);
      } else if (/^[rwx-]{9}$/.test(input)) {
        perms = parseSymbolic(input);
      } else {
        return {
          content: [{ type: "text", text: "Error: Invalid mode. Use octal (755) or symbolic (rwxr-xr-x)" }],
          isError: true,
        };
      }

      if (!perms) {
        return {
          content: [{ type: "text", text: "Error: Invalid permission format" }],
          isError: true,
        };
      }

      const { owner, group, other } = perms;
      const numeric = `${owner}${group}${other}`;
      const symbolic = octalToSymbolic(owner) + octalToSymbolic(group) + octalToSymbolic(other);

      const result = {
        numeric,
        symbolic,
        command: `chmod ${numeric} filename`,
        breakdown: {
          owner: { octal: owner, symbolic: octalToSymbolic(owner), permissions: describePermission(owner) },
          group: { octal: group, symbolic: octalToSymbolic(group), permissions: describePermission(group) },
          other: { octal: other, symbolic: octalToSymbolic(other), permissions: describePermission(other) },
        },
        common_presets: {
          "644": "Files (rw-r--r--) — owner read/write, group/other read",
          "755": "Executables (rwxr-xr-x) — owner full, group/other read/execute",
          "777": "Full access (rwxrwxrwx) — everyone full (not recommended)",
          "600": "Private (rw-------) — owner read/write only",
          "400": "Read-only (r--------) — owner read only",
        },
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
