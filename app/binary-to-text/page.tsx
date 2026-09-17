import type { Metadata } from "next";
import { BinaryToTextTool } from "./binary-to-text-tool";

export const metadata: Metadata = {
  title: "Binary to Text Converter Online — Free",
  description:
    "Decode binary, hex, or octal back to text. Supports space-separated binary, hex, and octal encoding. 100% client-side, free.",
  openGraph: {
    title: "Binary to Text Converter | devpick.sh",
    description: "Decode binary, hex, or octal to text online for free. Client-side.",
    url: "https://devpick.sh/binary-to-text",
  },
  alternates: { canonical: "https://devpick.sh/binary-to-text" },
};

export default function BinaryToTextPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Binary to Text Converter",
            description: "Decode binary, hex, or octal to text online for free",
            url: "https://devpick.sh/binary-to-text",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BinaryToTextTool />
    </>
  );
}
