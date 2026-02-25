import type { Metadata } from "next";
import { XmlToJsonTool } from "./xml-to-json-tool";

export const metadata: Metadata = {
  title: "XML to JSON Converter Online — Free | devpick.sh",
  description:
    "Convert XML to JSON instantly in your browser. Handles attributes, nested elements, and arrays. 100% client-side, free.",
  openGraph: {
    title: "XML to JSON Converter | devpick.sh",
    description: "Convert XML to JSON online for free. Client-side, no data sent anywhere.",
    url: "https://devpick.sh/xml-to-json",
  },
  alternates: { canonical: "https://devpick.sh/xml-to-json" },
};

export default function XmlToJsonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "XML to JSON Converter",
            description: "Convert XML to JSON online for free",
            url: "https://devpick.sh/xml-to-json",
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
              { "@type": "ListItem", position: 2, name: "XML to JSON", item: "https://devpick.sh/xml-to-json" },
            ],
          }),
        }}
      />
      <XmlToJsonTool />
    </>
  );
}
