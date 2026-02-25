import type { Metadata } from "next";
import { SvgToPngTool } from "./svg-to-png-tool";

export const metadata: Metadata = {
  title: "SVG to PNG Converter Online — Free | devpick.sh",
  description:
    "Convert SVG files to PNG images at any resolution using the Canvas API. Supports custom dimensions. 100% client-side, no upload.",
  openGraph: {
    title: "SVG to PNG Converter | devpick.sh",
    description: "Convert SVG to PNG free online at any resolution. Runs in browser.",
    url: "https://devpick.sh/svg-to-png",
  },
  alternates: { canonical: "https://devpick.sh/svg-to-png" },
};

export default function SvgToPngPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SVG to PNG Converter",
            description: "Convert SVG files to PNG images at any resolution",
            url: "https://devpick.sh/svg-to-png",
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
              { "@type": "ListItem", position: 2, name: "SVG to PNG", item: "https://devpick.sh/svg-to-png" },
            ],
          }),
        }}
      />
      <SvgToPngTool />
    </>
  );
}
