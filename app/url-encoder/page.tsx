import type { Metadata } from "next";
import { UrlTool } from "./url-tool";

export const metadata: Metadata = {
  title:
    "URL Encoder & Decoder (Percent Encoding) — Free Online Tool | devpick.sh",
  description:
    "Encode or decode URL strings instantly. Convert spaces, query params, and special characters with a fast client-side percent-encoding tool.",
  keywords: [
    "url encoder",
    "url decoder",
    "percent encoding",
    "encode url online",
    "decode url parameters",
    "url encode decode tool",
  ],
  openGraph: {
    title: "URL Encoder & Decoder (Percent Encoding) | devpick.sh",
    description:
      "Encode and decode URL parameters, query strings, and special characters instantly in your browser.",
    url: "https://devpick.sh/url-encoder",
  },
  alternates: { canonical: "https://devpick.sh/url-encoder" },
};

export default function UrlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "URL Encoder/Decoder",
            description: "Encode and decode URL components online",
            url: "https://devpick.sh/url-encoder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <UrlTool />
    </>
  );
}
