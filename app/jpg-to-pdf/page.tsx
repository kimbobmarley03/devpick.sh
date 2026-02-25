import type { Metadata } from "next";
import { JpgToPdfTool } from "./jpg-to-pdf-tool";

export const metadata: Metadata = {
  title: "JPG to PDF — Free, No Upload | devpick.sh",
  description:
    "Convert JPG images to a PDF document online. Free, 100% client-side — your files never leave your browser.",
  openGraph: {
    title: "JPG to PDF | devpick.sh",
    description: "Convert JPG images to PDF. Runs entirely in your browser.",
    url: "https://devpick.sh/jpg-to-pdf",
  },
  alternates: { canonical: "https://devpick.sh/jpg-to-pdf" },
};

export default function JpgToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JPG to PDF",
            description: "Convert JPG images to a PDF document online for free",
            url: "https://devpick.sh/jpg-to-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JpgToPdfTool />
    </>
  );
}
