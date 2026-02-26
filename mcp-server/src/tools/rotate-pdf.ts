import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "rotate_pdf",
    "Rotate pages in a PDF by 90, 180, or 270 degrees. Rotates all pages or specific pages.",
    {
      input: z.string().describe("Absolute path to the input PDF"),
      angle: z.enum(["90", "180", "270"]).describe("Rotation angle: 90, 180, or 270"),
      pages: z.array(z.number().int().positive()).optional().describe("Specific pages to rotate (1-indexed). Omit to rotate all."),
      output: z.string().describe("Absolute path for the output PDF"),
    },
    async ({ input, angle, pages, output }) => {
      try {
        const { PDFDocument, degrees } = await import("pdf-lib");
        const bytes = await readFile(input);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const totalPages = doc.getPageCount();
        const rotation = parseInt(angle, 10);

        const targetIndices = pages ? pages.map((p) => p - 1) : Array.from({ length: totalPages }, (_, i) => i);

        for (const idx of targetIndices) {
          if (idx < 0 || idx >= totalPages) continue;
          const page = doc.getPage(idx);
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + rotation) % 360));
        }

        const pdfBytes = await doc.save();
        await writeFile(output, pdfBytes);

        return {
          content: [{
            type: "text",
            text: `Rotated ${targetIndices.length} page(s) by ${angle}° → ${output} (${(pdfBytes.length / 1024).toFixed(1)} KB)`,
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to rotate PDF"}` }],
          isError: true,
        };
      }
    }
  );
}
