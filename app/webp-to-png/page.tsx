import type { Metadata } from "next";
import { WebpToPngTool } from "./webp-to-png-tool";

export const metadata: Metadata = {
  title: "WebP to PNG Converter — Free Online, No Sign Up",
  description:
    "Convert WebP images to PNG online for free. Drag & drop WebP files, convert instantly in your browser, download PNG. No upload, no sign up required.",
  openGraph: {
    title: "WebP to PNG Converter — Free Online, No Sign Up | devpick.sh",
    description: "Convert WebP to PNG online. Free, instant, client-side, no sign up needed.",
    url: "https://devpick.sh/webp-to-png",
  },
  alternates: { canonical: "https://devpick.sh/webp-to-png" },
};

export default function WebpToPngPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "WebP to PNG Converter",
            description: "Convert WebP images to PNG format free online",
            url: "https://devpick.sh/webp-to-png",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <WebpToPngTool />
    </>
  );
}
