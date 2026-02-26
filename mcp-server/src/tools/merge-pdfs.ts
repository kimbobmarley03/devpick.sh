import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "merge_pdfs",
    "Merge multiple PDF files into a single PDF. Provide absolute file paths.",
    {
      files: z.array(z.string()).min(2).describe("Array of absolute paths to PDF files to merge"),
      output: z.string().describe("Absolute path for the merged output PDF"),
    },
    async ({ files, output }) => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const merged = await PDFDocument.create();

        for (const filePath of files) {
          const bytes = await readFile(filePath);
          const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }

        const pdfBytes = await merged.save();
        await writeFile(output, pdfBytes);

        return {
          content: [{
            type: "text",
            text: `Merged ${files.length} PDFs into ${output} (${merged.getPageCount()} pages, ${(pdfBytes.length / 1024).toFixed(1)} KB)`,
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to merge PDFs"}` }],
          isError: true,
        };
      }
    }
  );
}
