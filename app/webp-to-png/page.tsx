import type { Metadata } from "next";
import { WebpToPngTool } from "./webp-to-png-tool";

export const metadata: Metadata = {
  title: "WebP to PNG Converter Online — Free & Instant | devpick.sh",
  description:
    "Convert WebP images to PNG online free. Drag & drop or upload WebP files, convert instantly in your browser, download PNG. No upload to server required.",
  openGraph: {
    title: "WebP to PNG Converter Online | devpick.sh",
    description: "Free online WebP to PNG converter. Instant, client-side, no signup needed.",
    url: "https://devpick.sh/webp-to-png",
  },
  alternates: { canonical: "https://devpick.sh/webp-to-png" },
};

export default function WebpToPngPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "WebP to PNG Converter",
            description: "Convert WebP images to PNG format free online",
            url: "https://devpick.sh/webp-to-png",
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
              { "@type": "ListItem", position: 2, name: "WebP to PNG Converter", item: "https://devpick.sh/webp-to-png" },
            ],
          }),
        }}
      />
      <WebpToPngTool />
    </>
  );
}
