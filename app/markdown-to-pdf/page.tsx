import type { Metadata } from "next";
import { MarkdownToPdfTool } from "./markdown-to-pdf-tool";

export const metadata: Metadata = {
  title: "Markdown to PDF — Free Online Converter | devpick.sh",
  description:
    "Convert Markdown to PDF online for free. Preview your Markdown and download as a PDF. Uses pdf-lib, 100% client-side.",
  openGraph: {
    title: "Markdown to PDF | devpick.sh",
    description: "Convert Markdown to PDF online for free. Preview and download instantly.",
    url: "https://devpick.sh/markdown-to-pdf",
  },
  alternates: { canonical: "https://devpick.sh/markdown-to-pdf" },
};

export default function MarkdownToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Markdown to PDF",
            description: "Convert Markdown to PDF online for free",
            url: "https://devpick.sh/markdown-to-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MarkdownToPdfTool />
    </>
  );
}
