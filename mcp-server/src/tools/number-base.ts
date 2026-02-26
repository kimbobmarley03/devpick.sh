import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function convertFromBase(input: string, fromBase: number): bigint | null {
  const s = input.trim().replace(/[\s_]/g, "").replace(/^0[xXbBoO]/, "");
  if (s === "" || s === "-") return null;

  const negative = s.startsWith("-");
  const digits = negative ? s.slice(1) : s;
  if (digits === "") return null;

  const validChars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, fromBase);
  if (!digits.toLowerCase().split("").every((c) => validChars.includes(c))) return null;

  try {
    let value = BigInt(0);
    const base = BigInt(fromBase);
    for (const ch of digits.toLowerCase()) {
      value = value * base + BigInt(validChars.indexOf(ch));
    }
    return negative ? -value : value;
  } catch {
    return null;
  }
}

function convertToBase(value: bigint, toBase: number): string {
  if (value === BigInt(0)) return "0";
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const base = BigInt(toBase);
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  let n = abs;
  while (n > BigInt(0)) {
    result = chars[Number(n % base)] + result;
    n = n / base;
  }
  return (negative ? "-" : "") + result;
}

export function registerNumberBase(server: McpServer) {
  server.tool(
    "convert_number_base",
    "Convert a number between bases (binary, octal, decimal, hexadecimal, or any base 2-36)",
    {
      number: z.string().describe("Number to convert (e.g. 255, 0xff, 0b11111111)"),
      from_base: z
        .number()
        .optional()
        .default(10)
        .describe("Source base (2-36, default 10). Use 2 for binary, 8 for octal, 16 for hex"),
      to_base: z
        .number()
        .optional()
        .default(16)
        .describe("Target base (2-36, default 16)"),
    },
    async ({ number, from_base, to_base }) => {
      if (from_base < 2 || from_base > 36 || to_base < 2 || to_base > 36) {
        return {
          content: [{ type: "text", text: "Error: Base must be between 2 and 36" }],
          isError: true,
        };
      }

      // Auto-detect base from prefix
      let actualFromBase = from_base;
      const n = number.trim();
      if (n.startsWith("0x") || n.startsWith("0X")) actualFromBase = 16;
      else if (n.startsWith("0b") || n.startsWith("0B")) actualFromBase = 2;
      else if (n.startsWith("0o") || n.startsWith("0O")) actualFromBase = 8;

      const parsed = convertFromBase(n, actualFromBase);
      if (parsed === null) {
        return {
          content: [{ type: "text", text: `Error: "${number}" is not a valid base-${actualFromBase} number` }],
          isError: true,
        };
      }

      const result = {
        input: number,
        from_base: actualFromBase,
        to_base,
        result: convertToBase(parsed, to_base),
        decimal: parsed.toString(),
        representations: {
          binary: convertToBase(parsed, 2),
          octal: convertToBase(parsed, 8),
          decimal: parsed.toString(),
          hex: convertToBase(parsed, 16),
          hex_upper: convertToBase(parsed, 16).toUpperCase(),
        },
      };

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
