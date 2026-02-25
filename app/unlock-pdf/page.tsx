import type { Metadata } from "next";
import { UnlockPdfTool } from "./unlock-pdf-tool";

export const metadata: Metadata = {
  title: "Unlock PDF — Free, No Upload | devpick.sh",
  description:
    "Remove password protection from PDF files online. You must know the password. 100% client-side, free.",
  openGraph: {
    title: "Unlock PDF | devpick.sh",
    description: "Remove PDF password protection. Runs entirely in your browser.",
    url: "https://devpick.sh/unlock-pdf",
  },
  alternates: { canonical: "https://devpick.sh/unlock-pdf" },
};

export default function UnlockPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Unlock PDF",
            description: "Remove password protection from PDF files online for free",
            url: "https://devpick.sh/unlock-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <UnlockPdfTool />
    </>
  );
}
