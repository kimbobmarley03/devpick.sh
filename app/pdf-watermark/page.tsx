import type { Metadata } from "next";
import { PdfWatermarkTool } from "./pdf-watermark-tool";

export const metadata: Metadata = {
  title: "Add Watermark to PDF — Free, No Upload | devpick.sh",
  description:
    "Add a text watermark to every page of a PDF online. 100% client-side, free, no signup.",
  openGraph: {
    title: "PDF Watermark | devpick.sh",
    description: "Add text watermark to PDF pages. Runs entirely in your browser.",
    url: "https://devpick.sh/pdf-watermark",
  },
  alternates: { canonical: "https://devpick.sh/pdf-watermark" },
};

export default function PdfWatermarkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PDF Watermark",
            description: "Add text watermark to PDF pages online for free",
            url: "https://devpick.sh/pdf-watermark",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <PdfWatermarkTool />
    </>
  );
}
