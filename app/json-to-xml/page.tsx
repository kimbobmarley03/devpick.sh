import type { Metadata } from "next";
import { JsonToXmlTool } from "./json-to-xml-tool";

export const metadata: Metadata = {
  title: "JSON to XML Converter — Free Online | devpick.sh",
  description:
    "Convert JSON to XML online for free. Instant conversion with proper formatting. 100% client-side, private.",
  openGraph: {
    title: "JSON to XML Converter | devpick.sh",
    description: "Convert JSON to XML online for free. Client-side and instant.",
    url: "https://devpick.sh/json-to-xml",
  },
  alternates: { canonical: "https://devpick.sh/json-to-xml" },
};

export default function JsonToXmlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON to XML Converter",
            description: "Convert JSON to XML online for free",
            url: "https://devpick.sh/json-to-xml",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JsonToXmlTool />
    </>
  );
}
