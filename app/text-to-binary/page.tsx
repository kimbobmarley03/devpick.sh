import type { Metadata } from "next";
import { TextToBinaryTool } from "./text-to-binary-tool";

export const metadata: Metadata = {
  title: "Text to Binary Converter Online — Free | devpick.sh",
  description:
    "Convert text to binary, hex, octal, and decimal — and back. Includes character-by-character reference table. Free, instant, 100% client-side.",
  openGraph: {
    title: "Text to Binary Converter Online | devpick.sh",
    description: "Convert text to binary, hex, octal, decimal. Supports reverse decoding. Free.",
    url: "https://devpick.sh/text-to-binary",
  },
  alternates: { canonical: "https://devpick.sh/text-to-binary" },
};

export default function TextToBinaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text to Binary Converter",
            description: "Convert text to binary, hex, octal, decimal representations",
            url: "https://devpick.sh/text-to-binary",
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
              { "@type": "ListItem", position: 2, name: "Text to Binary", item: "https://devpick.sh/text-to-binary" },
            ],
          }),
        }}
      />
      <TextToBinaryTool />
    </>
  );
}
