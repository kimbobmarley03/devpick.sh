import type { Metadata } from "next";
import { XmlToCsvTool } from "./xml-to-csv-tool";

export const metadata: Metadata = {
  title: "XML to CSV Converter — Free Online | devpick.sh",
  description:
    "Convert XML to CSV online for free. Paste XML data and get a flattened CSV with auto-detected columns. 100% client-side, no upload.",
  openGraph: {
    title: "XML to CSV Converter | devpick.sh",
    description: "Convert XML to CSV with auto-detected columns online for free.",
    url: "https://devpick.sh/xml-to-csv",
  },
  alternates: { canonical: "https://devpick.sh/xml-to-csv" },
};

export default function XmlToCsvPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "XML to CSV Converter",
            description: "Convert XML to CSV online for free with auto-detected columns",
            url: "https://devpick.sh/xml-to-csv",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <XmlToCsvTool />
    </>
  );
}
