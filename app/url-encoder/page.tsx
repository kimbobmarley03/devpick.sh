import type { Metadata } from "next";
import { UrlTool } from "./url-tool";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder Online — Free URL Encode Decode Tool",
  description:
    "Encode and decode URL components online. Free URL encoder and decoder tool. Handles percent encoding, query strings, and special characters.",
  openGraph: {
    title: "URL Encoder/Decoder Online | devpick.sh",
    description: "Encode and decode URL components. Free, instant, client-side.",
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
