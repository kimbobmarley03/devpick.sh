import type { Metadata } from "next";
import { Base64Tool } from "./base64-tool";

export const metadata: Metadata = {
  title: "Base64 Encoder/Decoder Online — Free Base64 Tool",
  description:
    "Encode and decode Base64 online. Free, instant Base64 encoder and decoder. No sign-up, works in your browser.",
  openGraph: {
    title: "Base64 Encoder/Decoder Online | devpick.sh",
    description: "Encode and decode Base64 online. Free, instant, client-side.",
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
