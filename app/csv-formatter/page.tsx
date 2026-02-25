import type { Metadata } from "next";
import { CsvTool } from "./csv-tool";

export const metadata: Metadata = {
  title: "CSV to JSON Converter Online — Free CSV Parser",
  description:
    "Convert CSV to JSON or JSON to CSV online. Handles headers, quoted fields, comma/tab/semicolon delimiters. Free, instant, client-side.",
  openGraph: {
    title: "CSV to JSON Converter | devpick.sh",
    description: "Convert CSV to JSON or JSON to CSV. Handles headers, quoted fields, multiple delimiters.",
    url: "https://devpick.sh/csv-formatter",
  },
  alternates: { canonical: "https://devpick.sh/csv-formatter" },
};

export default function CsvPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSV to JSON Converter",
            description:
              "Convert CSV to JSON or JSON to CSV online. Handles headers, quoted fields, comma/tab/semicolon delimiters.",
            url: "https://devpick.sh/csv-formatter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CsvTool />
    </>
  );
}
