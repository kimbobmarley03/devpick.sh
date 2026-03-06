import type { Metadata } from "next";
import { CompressPdfTool } from "./compress-pdf-tool";

export const metadata: Metadata = {
  title: "Compress PDF Online — Free, No Sign Up, No Upload | devpick.sh",
  description:
    "Reduce PDF file size online. Free, 100% client-side compression — your files stay private. No sign up required, no upload.",
  openGraph: {
    title: "Compress PDF Online — Free, No Sign Up | devpick.sh",
    description: "Compress PDFs securely in your browser. Free, no upload, no signup.",
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
