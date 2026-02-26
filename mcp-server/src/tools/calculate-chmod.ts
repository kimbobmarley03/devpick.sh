import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function octalToSymbolic(n: number): string {
  return (
    (n & 4 ? "r" : "-") +
    (n & 2 ? "w" : "-") +
    (n & 1 ? "x" : "-")
  );
}

function numericToInfo(numeric: string) {
  if (!/^[0-7]{3}$/.test(numeric)) throw new Error(`Invalid octal permission: ${numeric}`);
  const [o, g, t] = numeric.split("").map(Number);
  return {
    numeric,
    symbolic: octalToSymbolic(o) + octalToSymbolic(g) + octalToSymbolic(t),
    owner: {
      read: !!(o & 4),
      write: !!(o & 2),
      execute: !!(o & 1),
      string: octalToSymbolic(o),
    },
    group: {
      read: !!(g & 4),
      write: !!(g & 2),
      execute: !!(g & 1),
      string: octalToSymbolic(g),
    },
    other: {
      read: !!(t & 4),
      write: !!(t & 2),
      execute: !!(t & 1),
      string: octalToSymbolic(t),
    },
    command: `chmod ${numeric} filename`,
  };
}

function symbolicToNumeric(symbolic: string): string {
  if (symbolic.length !== 9) throw new Error("Symbolic must be exactly 9 chars (e.g. rwxr-xr-x)");
  const octal = (chars: string): number =>
    (chars[0] !== "-" ? 4 : 0) +
    (chars[1] !== "-" ? 2 : 0) +
    (chars[2] !== "-" ? 1 : 0);
  return [
    octal(symbolic.slice(0, 3)),
    octal(symbolic.slice(3, 6)),
    octal(symbolic.slice(6, 9)),
  ].join("");
}

export function register(server: McpServer) {
  server.tool(
    "calculate_chmod",
    "Calculate Unix file permissions — convert between numeric (755), symbolic (rwxr-xr-x), and explain each bit",
    {
      mode: z.string().describe("Permission mode: octal (e.g. '755', '644') or symbolic (e.g. 'rwxr-xr-x')"),
    },
    async ({ mode }) => {
      try {
        let numeric: string;
        if (/^[0-7]{3}$/.test(mode.trim())) {
          numeric = mode.trim();
        } else if (/^[rwx-]{9}$/.test(mode.trim())) {
          numeric = symbolicToNumeric(mode.trim());
        } else {
          return {
            content: [{ type: "text", text: "Error: Mode must be 3-digit octal (e.g. 755) or 9-char symbolic (e.g. rwxr-xr-x)" }],
            isError: true,
          };
        }
        const info = numericToInfo(numeric);
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
