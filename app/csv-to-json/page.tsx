import type { Metadata } from "next";
import { CsvToJsonTool } from "./csv-to-json-tool";

export const metadata: Metadata = {
  title: "CSV to JSON Converter Online — Free | devpick.sh",
  description:
    "Convert CSV data to JSON instantly in your browser. Handles headers, custom delimiters, and nested arrays. 100% client-side, free.",
  openGraph: {
    title: "CSV to JSON Converter | devpick.sh",
    description: "Convert CSV to JSON online for free. Handles custom delimiters. Client-side.",
    url: "https://devpick.sh/csv-to-json",
  },
  alternates: { canonical: "https://devpick.sh/csv-to-json" },
};

export default function CsvToJsonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSV to JSON Converter",
            description: "Convert CSV data to JSON online for free",
            url: "https://devpick.sh/csv-to-json",
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
              { "@type": "ListItem", position: 2, name: "CSV to JSON", item: "https://devpick.sh/csv-to-json" },
            ],
          }),
        }}
      />
      <CsvToJsonTool />
    </>
  );
}
