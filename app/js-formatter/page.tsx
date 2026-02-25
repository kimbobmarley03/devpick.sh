import type { Metadata } from "next";
import { JsFormatterTool } from "./js-formatter-tool";

export const metadata: Metadata = {
  title: "JavaScript / TypeScript Formatter Online — Free | devpick.sh",
  description:
    "Beautify or minify JavaScript and TypeScript code instantly in your browser. Handles brace-based indentation. 100% client-side, free.",
  openGraph: {
    title: "JS / TS Formatter | devpick.sh",
    description: "Format and beautify JavaScript or TypeScript code instantly. Free, online, client-side.",
    url: "https://devpick.sh/js-formatter",
  },
  alternates: { canonical: "https://devpick.sh/js-formatter" },
};

export default function JsFormatterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JavaScript / TypeScript Formatter",
            description: "Beautify or minify JavaScript and TypeScript code online for free",
            url: "https://devpick.sh/js-formatter",
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
              { "@type": "ListItem", position: 2, name: "JS/TS Formatter", item: "https://devpick.sh/js-formatter" },
            ],
          }),
        }}
      />
      <JsFormatterTool />
    </>
  );
}
