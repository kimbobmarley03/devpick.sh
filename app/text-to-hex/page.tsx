import type { Metadata } from "next";
import { TextToHexTool } from "./text-to-hex-tool";

export const metadata: Metadata = {
  title: "Text to Hex Converter Online — Free | devpick.sh",
  description:
    "Convert text to hexadecimal and back. Encode any string to hex or decode hex back to readable text. 100% client-side, free.",
  openGraph: {
    title: "Text to Hex Converter | devpick.sh",
    description: "Encode text to hex or decode hex to text online for free. Client-side.",
    url: "https://devpick.sh/text-to-hex",
  },
  alternates: { canonical: "https://devpick.sh/text-to-hex" },
};

export default function TextToHexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text to Hex Converter",
            description: "Convert text to hexadecimal and decode hex back to text",
            url: "https://devpick.sh/text-to-hex",
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
              { "@type": "ListItem", position: 2, name: "Text to Hex", item: "https://devpick.sh/text-to-hex" },
            ],
          }),
        }}
      />
      <TextToHexTool />
    </>
  );
}
