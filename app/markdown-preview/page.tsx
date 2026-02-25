import type { Metadata } from "next";
import { MarkdownTool } from "./markdown-tool";

export const metadata: Metadata = {
  title: "Markdown Preview Online — Live Markdown Editor & Renderer",
  description:
    "Write and preview Markdown in real time. Supports headers, bold, italic, code, links, lists, blockquotes, and more. Free online Markdown editor.",
  openGraph: {
    title: "Markdown Preview Online | devpick.sh",
    description: "Live Markdown editor with instant preview.",
    url: "https://devpick.sh/markdown-preview",
  },
  alternates: { canonical: "https://devpick.sh/markdown-preview" },
};

export default function MarkdownPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Markdown Preview",
            description: "Write and preview Markdown in real time",
            url: "https://devpick.sh/markdown-preview",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MarkdownTool />
    </>
  );
}
