import type { Metadata } from "next";
import { AsciiTool } from "./ascii-tool";

export const metadata: Metadata = {
  title: "ASCII Table — Full ASCII Chart with Hex, Octal & Descriptions",
  description:
    "Complete ASCII table (0-127) with decimal, hex, octal, character, and description. Search, filter, and copy any value. Free online ASCII reference.",
  openGraph: {
    title: "ASCII Table | devpick.sh",
    description: "Full ASCII table 0-127. Search, filter, copy. Free online reference.",
    url: "https://devpick.sh/ascii-art-generator",
  },
  alternates: { canonical: "https://devpick.sh/ascii-art-generator" },
};

export default function AsciiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ASCII Table",
            description: "Full ASCII table with search and copy",
            url: "https://devpick.sh/ascii-art-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <AsciiTool />
    </>
  );
}
