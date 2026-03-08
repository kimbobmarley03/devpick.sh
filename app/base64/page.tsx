import type { Metadata } from "next";
import { Base64Tool } from "./base64-tool";

export const metadata: Metadata = {
  title: "Base64 Decode & Encode Online — Free, Fast, Secure | devpick.sh",
  description:
    "Decode Base64 to text or encode text to Base64 instantly. Free Base64 decoder/encoder with UTF-8 support, no upload, and 100% client-side processing.",
  openGraph: {
    title: "Base64 Decode & Encode Online — Free Tool | devpick.sh",
    description:
      "Decode Base64 strings or encode text instantly. Secure, browser-based Base64 tool with no data upload.",
    url: "https://devpick.sh/base64",
  },
  alternates: { canonical: "https://devpick.sh/base64" },
};

export default function Base64Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Base64 Encoder/Decoder",
            description: "Encode and decode Base64 strings online",
            url: "https://devpick.sh/base64",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <Base64Tool />
    </>
  );
}
