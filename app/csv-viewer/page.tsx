import type { Metadata } from "next";
import { CsvViewerTool } from "./csv-viewer-tool";

export const metadata: Metadata = {
  title: "CSV Viewer — Free Online Sortable Table | devpick.sh",
  description:
    "Paste or upload CSV data and view it as a sortable, filterable table. No server, no upload. 100% client-side, free.",
  openGraph: {
    title: "CSV Viewer | devpick.sh",
    description: "View and sort CSV data as an interactive table online for free.",
    url: "https://devpick.sh/csv-viewer",
  },
  alternates: { canonical: "https://devpick.sh/csv-viewer" },
};

export default function CsvViewerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSV Viewer",
            description: "View CSV data as a sortable, filterable table online for free",
            url: "https://devpick.sh/csv-viewer",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CsvViewerTool />
    </>
  );
}
