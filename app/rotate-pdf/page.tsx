import type { Metadata } from "next";
import { RotatePdfTool } from "./rotate-pdf-tool";

export const metadata: Metadata = {
  title: "Rotate PDF Online — Rotate Pages 90°, 180°, 270° (Free) | devpick.sh",
  description:
    "Rotate PDF pages online in seconds. Rotate single pages or entire documents by 90°, 180°, or 270°. Free, browser-based, and no file upload required.",
  openGraph: {
    title: "Rotate PDF Online — 90°, 180°, 270° | devpick.sh",
    description:
      "Rotate one page or all PDF pages instantly. Free and private — files stay in your browser.",
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
