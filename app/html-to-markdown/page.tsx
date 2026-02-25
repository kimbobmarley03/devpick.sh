import type { Metadata } from "next";
import { HtmlToMarkdownTool } from "./html-to-markdown-tool";

export const metadata: Metadata = {
  title: "HTML to Markdown Converter Online — Free | devpick.sh",
  description:
    "Convert HTML to Markdown instantly. Handles headings, bold, italic, links, images, lists, code blocks, and tables. Free, client-side, no upload needed.",
  openGraph: {
    title: "HTML to Markdown Converter Online | devpick.sh",
    description: "Convert HTML to Markdown. Handles headings, lists, tables, code blocks. Free.",
    url: "https://devpick.sh/html-to-markdown",
  },
  alternates: { canonical: "https://devpick.sh/html-to-markdown" },
};

export default function HtmlToMarkdownPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTML to Markdown Converter",
            description: "Convert HTML to Markdown client-side",
            url: "https://devpick.sh/html-to-markdown",
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
              { "@type": "ListItem", position: 2, name: "HTML to Markdown", item: "https://devpick.sh/html-to-markdown" },
            ],
          }),
        }}
      />
      <HtmlToMarkdownTool />
    </>
  );
}
