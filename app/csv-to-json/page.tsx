import type { Metadata } from "next";
import { CsvToJsonTool } from "./csv-to-json-tool";

export const metadata: Metadata = {
  title: "CSV to JSON Converter Online (Headers, Delimiter, Arrays) | devpick.sh",
  description:
    "Free CSV to JSON converter with header row support, custom delimiters, and array parsing. Convert spreadsheet exports to clean JSON instantly in your browser.",
  openGraph: {
    title: "CSV to JSON Converter Online (Headers + Custom Delimiter) | devpick.sh",
    description:
      "Convert CSV files to JSON with header mapping, custom delimiter support, and array parsing. Fast, free, and fully client-side.",
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
