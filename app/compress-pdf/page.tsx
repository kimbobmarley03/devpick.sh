import type { Metadata } from "next";
import { CompressPdfTool } from "./compress-pdf-tool";

export const metadata: Metadata = {
  title: "Compress PDF — Free, No Upload | devpick.sh",
  description:
    "Reduce PDF file size online. 100% client-side — your files never leave your browser. Free, no signup.",
  openGraph: {
    title: "Compress PDF | devpick.sh",
    description: "Reduce PDF file size. Runs entirely in your browser.",
    url: "https://devpick.sh/compress-pdf",
  },
  alternates: { canonical: "https://devpick.sh/compress-pdf" },
};

export default function CompressPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Compress PDF",
            description: "Reduce PDF file size online for free",
            url: "https://devpick.sh/compress-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CompressPdfTool />
    </>
  );
}
