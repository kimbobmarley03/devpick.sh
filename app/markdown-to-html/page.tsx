import type { Metadata } from "next";
import { MarkdownToHtmlTool } from "./markdown-to-html-tool";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter Online — Free | devpick.sh",
  description:
    "Convert Markdown to HTML instantly in your browser. Handles headings, bold, italic, lists, code, links, and tables. 100% client-side, free.",
  openGraph: {
    title: "Markdown to HTML Converter | devpick.sh",
    description: "Convert Markdown to HTML online for free. Client-side, no data sent.",
    url: "https://devpick.sh/markdown-to-html",
  },
  alternates: { canonical: "https://devpick.sh/markdown-to-html" },
};

export default function MarkdownToHtmlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Markdown to HTML Converter",
            description: "Convert Markdown to HTML online for free",
            url: "https://devpick.sh/markdown-to-html",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "Markdown to HTML", item: "https://devpick.sh/markdown-to-html" },
            ],
          }),
        }}
      />
      <MarkdownToHtmlTool />
    </>
  );
}
