import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, stat } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "pdf_info",
    "Get metadata and page info from a PDF file (page count, title, author, file size, page dimensions).",
    {
      input: z.string().describe("Absolute path to the PDF file"),
    },
    async ({ input }) => {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const bytes = await readFile(input);
        const fileStat = await stat(input);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

        const pageCount = doc.getPageCount();
        const title = doc.getTitle() || "(none)";
        const author = doc.getAuthor() || "(none)";
        const subject = doc.getSubject() || "(none)";
        const creator = doc.getCreator() || "(none)";
        const producer = doc.getProducer() || "(none)";
        const creationDate = doc.getCreationDate()?.toISOString() || "(none)";
        const modDate = doc.getModificationDate()?.toISOString() || "(none)";

        const pages = [];
        for (let i = 0; i < Math.min(pageCount, 10); i++) {
          const page = doc.getPage(i);
          const { width, height } = page.getSize();
          pages.push(`  Page ${i + 1}: ${width.toFixed(0)} × ${height.toFixed(0)} pts`);
        }
        if (pageCount > 10) pages.push(`  ... and ${pageCount - 10} more pages`);

        const info = [
          `File: ${input}`,
          `Size: ${(fileStat.size / 1024).toFixed(1)} KB`,
          `Pages: ${pageCount}`,
          `Title: ${title}`,
          `Author: ${author}`,
          `Subject: ${subject}`,
          `Creator: ${creator}`,
          `Producer: ${producer}`,
          `Created: ${creationDate}`,
          `Modified: ${modDate}`,
          `Page dimensions:`,
          ...pages,
        ].join("\n");

        return { content: [{ type: "text", text: info }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to read PDF"}` }],
          isError: true,
        };
      }
    }
  );
}
