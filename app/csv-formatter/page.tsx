import type { Metadata } from "next";
import { CsvTool } from "./csv-tool";

export const metadata: Metadata = {
  title: "CSV Formatter & CSV to JSON Converter Online — Free | devpick.sh",
  description:
    "Format CSV instantly and convert CSV to JSON or JSON to CSV. Supports headers, quoted fields, and comma/tab/semicolon delimiters. Free, browser-based, no sign up.",
  openGraph: {
    title: "CSV Formatter & Converter | devpick.sh",
    description:
      "Format CSV and convert between CSV and JSON online. Handles headers, quoted fields, and multiple delimiters.",
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
            name: "CSV Formatter & Converter",
            description:
              "Format CSV and convert CSV to JSON or JSON to CSV online. Handles headers, quoted fields, and comma/tab/semicolon delimiters.",
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
