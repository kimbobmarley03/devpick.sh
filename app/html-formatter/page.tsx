import type { Metadata } from "next";
import { HtmlFormatterTool } from "./html-formatter-tool";

export const metadata: Metadata = {
  title: "HTML Formatter & Beautifier Online — Free | devpick.sh",
  description:
    "Beautify or minify HTML instantly in your browser. Properly indents nested tags. 100% client-side, free.",
  openGraph: {
    title: "HTML Formatter & Beautifier | devpick.sh",
    description: "Format and beautify HTML code instantly. Free, online, client-side.",
    url: "https://devpick.sh/html-formatter",
  },
  alternates: { canonical: "https://devpick.sh/html-formatter" },
};

export default function HtmlFormatterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTML Formatter & Beautifier",
            description: "Beautify or minify HTML code online for free",
            url: "https://devpick.sh/html-formatter",
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
              { "@type": "ListItem", position: 2, name: "HTML Formatter", item: "https://devpick.sh/html-formatter" },
            ],
          }),
        }}
      />
      <HtmlFormatterTool />
    </>
  );
}
