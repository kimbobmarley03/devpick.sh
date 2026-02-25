import type { Metadata } from "next";
import { FaviconTool } from "./favicon-tool";

export const metadata: Metadata = {
  title: "Favicon Generator Online — Free ICO PNG Sizes | devpick.sh",
  description:
    "Generate favicons online free. Upload image or enter text/emoji to create favicon at 16x16, 32x32, 48x48, and 180x180 sizes. Download as PNG. Instant, client-side.",
  openGraph: {
    title: "Favicon Generator Online | devpick.sh",
    description: "Create favicons from images or text. Download at multiple sizes. Free, no signup.",
    url: "https://devpick.sh/favicon-generator",
  },
  alternates: { canonical: "https://devpick.sh/favicon-generator" },
};

export default function FaviconPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Favicon Generator",
            description: "Generate favicons from images or text/emoji at multiple sizes",
            url: "https://devpick.sh/favicon-generator",
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
              { "@type": "ListItem", position: 2, name: "Favicon Generator", item: "https://devpick.sh/favicon-generator" },
            ],
          }),
        }}
      />
      <FaviconTool />
    </>
  );
}
