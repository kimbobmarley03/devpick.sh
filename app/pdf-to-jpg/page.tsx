import type { Metadata } from "next";
import { PdfToJpgTool } from "./pdf-to-jpg-tool";

export const metadata: Metadata = {
  title: "PDF to JPG — Free, No Upload | devpick.sh",
  description:
    "Convert PDF pages to JPG images online. Free, 100% client-side — your files never leave your browser.",
  openGraph: {
    title: "PDF to JPG | devpick.sh",
    description: "Convert PDF pages to JPG images. Runs entirely in your browser.",
    url: "https://devpick.sh/pdf-to-jpg",
  },
  alternates: { canonical: "https://devpick.sh/pdf-to-jpg" },
};

export default function PdfToJpgPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PDF to JPG",
            description: "Convert PDF pages to JPG images online for free",
            url: "https://devpick.sh/pdf-to-jpg",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <PdfToJpgTool />
    </>
  );
}
