import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "split_pdf",
    "Extract specific pages from a PDF into a new file. Pages are 1-indexed.",
    {
      input: z.string().describe("Absolute path to the input PDF"),
      pages: z.array(z.number().int().positive()).min(1).describe("Page numbers to extract (1-indexed)"),
      output: z.string().describe("Absolute path for the output PDF"),
    },
    async ({ input, pages, output }) => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const bytes = await readFile(input);
        const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const totalPages = srcDoc.getPageCount();

        const indices = pages.map((p) => p - 1);
        const invalid = indices.filter((i) => i < 0 || i >= totalPages);
        if (invalid.length > 0) {
          return {
            content: [{ type: "text", text: `Error: Pages out of range (document has ${totalPages} pages): ${invalid.map((i) => i + 1).join(", ")}` }],
            isError: true,
          };
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, indices);
        copied.forEach((p) => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        await writeFile(output, pdfBytes);

        return {
          content: [{
            type: "text",
            text: `Extracted pages [${pages.join(", ")}] from ${input} → ${output} (${copied.length} pages, ${(pdfBytes.length / 1024).toFixed(1)} KB)`,
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to split PDF"}` }],
          isError: true,
        };
      }
    }
  );
}
