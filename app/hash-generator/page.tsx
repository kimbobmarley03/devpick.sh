import type { Metadata } from "next";
import { HashTool } from "./hash-tool";

export const metadata: Metadata = {
  title: "Hash Generator Online — MD5, SHA-1, SHA-256, SHA-512",
  description:
    "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes online. Free hash generator using Web Crypto API. No data sent to server.",
  openGraph: {
    title: "Hash Generator — MD5, SHA-256, SHA-512 | devpick.sh",
    description: "Generate cryptographic hashes online. Free, instant, client-side.",
    url: "https://devpick.sh/hash-generator",
  },
  alternates: { canonical: "https://devpick.sh/hash-generator" },
};

export default function HashPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hash Generator",
            description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes online",
            url: "https://devpick.sh/hash-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HashTool />
    </>
  );
}
