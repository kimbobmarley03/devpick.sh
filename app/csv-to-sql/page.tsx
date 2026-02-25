import type { Metadata } from "next";
import { CsvToSqlTool } from "./csv-to-sql-tool";

export const metadata: Metadata = {
  title: "CSV to SQL Converter — Free Online | devpick.sh",
  description:
    "Convert CSV data to SQL CREATE TABLE and INSERT statements instantly. Paste your CSV and get ready-to-run SQL. 100% client-side, free, no upload.",
  openGraph: {
    title: "CSV to SQL Converter | devpick.sh",
    description: "Convert CSV to SQL CREATE TABLE + INSERT statements online for free.",
    url: "https://devpick.sh/csv-to-sql",
  },
  alternates: { canonical: "https://devpick.sh/csv-to-sql" },
};

export default function CsvToSqlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSV to SQL Converter",
            description:
              "Convert CSV data to SQL CREATE TABLE and INSERT statements online for free",
            url: "https://devpick.sh/csv-to-sql",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CsvToSqlTool />
    </>
  );
}
