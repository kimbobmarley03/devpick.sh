import type { Metadata } from "next";
import { SplitPdfTool } from "./split-pdf-tool";

export const metadata: Metadata = {
  title: "Split PDF — Free, No Upload | devpick.sh",
  description:
    "Split a PDF into individual pages or custom page ranges. 100% client-side, free, no upload needed.",
  openGraph: {
    title: "Split PDF | devpick.sh",
    description: "Split PDF into pages or ranges. Runs entirely in your browser.",
    url: "https://devpick.sh/split-pdf",
  },
  alternates: { canonical: "https://devpick.sh/split-pdf" },
};

export default function SplitPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Split PDF",
            description: "Split a PDF into individual pages or custom page ranges online for free",
            url: "https://devpick.sh/split-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SplitPdfTool />
    </>
  );
}
