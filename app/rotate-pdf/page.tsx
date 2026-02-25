import type { Metadata } from "next";
import { RotatePdfTool } from "./rotate-pdf-tool";

export const metadata: Metadata = {
  title: "Rotate PDF — Free, No Upload | devpick.sh",
  description:
    "Rotate PDF pages online. Choose per-page or bulk rotation. 100% client-side, free.",
  openGraph: {
    title: "Rotate PDF | devpick.sh",
    description: "Rotate PDF pages. Runs entirely in your browser.",
    url: "https://devpick.sh/rotate-pdf",
  },
  alternates: { canonical: "https://devpick.sh/rotate-pdf" },
};

export default function RotatePdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Rotate PDF",
            description: "Rotate PDF pages online for free",
            url: "https://devpick.sh/rotate-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <RotatePdfTool />
    </>
  );
}
