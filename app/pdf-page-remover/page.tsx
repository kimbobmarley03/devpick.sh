import type { Metadata } from "next";
import { PdfPageRemoverTool } from "./pdf-page-remover-tool";

export const metadata: Metadata = {
  title: "PDF Page Remover — Free, No Upload | devpick.sh",
  description:
    "Delete specific pages from a PDF online. 100% client-side, free, no signup required.",
  openGraph: {
    title: "PDF Page Remover | devpick.sh",
    description: "Delete pages from PDF. Runs entirely in your browser.",
    url: "https://devpick.sh/pdf-page-remover",
  },
  alternates: { canonical: "https://devpick.sh/pdf-page-remover" },
};

export default function PdfPageRemoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "PDF Page Remover",
            description: "Delete specific pages from a PDF file online for free",
            url: "https://devpick.sh/pdf-page-remover",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <PdfPageRemoverTool />
    </>
  );
}
