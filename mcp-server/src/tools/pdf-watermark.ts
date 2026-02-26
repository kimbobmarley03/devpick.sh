import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";

export function register(server: McpServer) {
  server.tool(
    "pdf_watermark",
    "Add a text watermark to every page of a PDF.",
    {
      input: z.string().describe("Absolute path to the input PDF"),
      text: z.string().describe("Watermark text"),
      output: z.string().describe("Absolute path for the output PDF"),
      opacity: z.number().min(0).max(1).optional().default(0.3).describe("Watermark opacity (0-1, default 0.3)"),
      fontSize: z.number().optional().default(50).describe("Font size (default 50)"),
    },
    async ({ input, text, output, opacity, fontSize }) => {
      try {
        const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
        const bytes = await readFile(input);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const pageCount = doc.getPageCount();

        for (let i = 0; i < pageCount; i++) {
          const page = doc.getPage(i);
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: (width - textWidth) / 2,
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees(45),
          });
        }

        const pdfBytes = await doc.save();
        await writeFile(output, pdfBytes);

        return {
          content: [{
            type: "text",
            text: `Added watermark "${text}" to ${pageCount} pages → ${output} (${(pdfBytes.length / 1024).toFixed(1)} KB)`,
          }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed to add watermark"}` }],
          isError: true,
        };
      }
    }
  );
}
