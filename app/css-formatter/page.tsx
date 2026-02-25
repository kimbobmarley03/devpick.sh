import type { Metadata } from "next";
import { CssFormatterTool } from "./css-formatter-tool";

export const metadata: Metadata = {
  title: "CSS Formatter & Beautifier Online — Free | devpick.sh",
  description:
    "Beautify or minify CSS instantly in your browser. Fixes indentation, sorts nothing, pure formatting. 100% client-side and free.",
  openGraph: {
    title: "CSS Formatter & Beautifier | devpick.sh",
    description: "Format and beautify CSS code instantly. Free, online, client-side.",
    url: "https://devpick.sh/css-formatter",
  },
  alternates: { canonical: "https://devpick.sh/css-formatter" },
};

export default function CssFormatterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Formatter & Beautifier",
            description: "Beautify or minify CSS code online for free",
            url: "https://devpick.sh/css-formatter",
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
              { "@type": "ListItem", position: 2, name: "CSS Formatter", item: "https://devpick.sh/css-formatter" },
            ],
          }),
        }}
      />
      <CssFormatterTool />
    </>
  );
}
