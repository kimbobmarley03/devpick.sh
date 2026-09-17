import type { Metadata } from "next";
import { FaviconTool } from "./favicon-tool";

export const metadata: Metadata = {
  title: "Favicon Generator Online — Free ICO PNG Sizes",
  description:
    "Create favicons from an image, text, or emoji in 16×16, 32×32, 48×48, and 180×180 sizes. Download PNG files instantly.",
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
      <FaviconTool />
    </>
  );
}
