import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "remove_pdf_pages",
    "Remove specific pages from a PDF. Pages are 1-indexed.",
    {
      input: z.string().describe("Absolute path to the input PDF"),
      pages: z.array(z.number().int().positive()).min(1).describe("Page numbers to remove (1-indexed)"),
      output: z.string().describe("Absolute path for the output PDF"),
    },
    async ({ input, pages, output }) => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const bytes = await readFile(input);
        const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const totalPages = srcDoc.getPageCount();

        const removeSet = new Set(pages.map((p) => p - 1));
        const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => !removeSet.has(i));

        if (keepIndices.length === 0) {
          return { content: [{ type: "text", text: "Error: Cannot remove all pages from a PDF" }], isError: true };
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, keepIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        await writeFile(output, pdfBytes);

        return {
          content: [{
            type: "text",
            text: `Removed pages [${pages.join(", ")}] → ${output} (${keepIndices.length} pages remaining, ${(pdfBytes.length / 1024).toFixed(1)} KB)`,
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to remove pages"}` }],
          isError: true,
        };
      }
    }
  );
}
