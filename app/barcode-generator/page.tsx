import type { Metadata } from "next";
import { BarcodeTool } from "./barcode-tool";

export const metadata: Metadata = {
  title: "Barcode Generator Online — Free Code 128, EAN-13 | devpick.sh",
  description:
    "Generate barcodes online free. Supports Code 128, EAN-13, and Code 39. Enter text or number, download barcode as PNG. Instant, client-side, no signup.",
  openGraph: {
    title: "Barcode Generator Online | devpick.sh",
    description: "Generate Code 128, EAN-13, and Code 39 barcodes free online. Download as PNG.",
    url: "https://devpick.sh/barcode-generator",
  },
  alternates: { canonical: "https://devpick.sh/barcode-generator" },
};

export default function BarcodePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Barcode Generator",
            description: "Generate Code 128, EAN-13, and Code 39 barcodes online for free",
            url: "https://devpick.sh/barcode-generator",
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
              { "@type": "ListItem", position: 2, name: "Barcode Generator", item: "https://devpick.sh/barcode-generator" },
            ],
          }),
        }}
      />
      <BarcodeTool />
    </>
  );
}
