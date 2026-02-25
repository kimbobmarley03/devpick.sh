import type { Metadata } from "next";
import { JsonToTsTool } from "./json-to-ts-tool";

export const metadata: Metadata = {
  title: "JSON to TypeScript Interface Generator — Free Online Tool",
  description:
    "Convert JSON to TypeScript interfaces online. Handles nested objects, arrays, and optional fields. Free, instant, client-side.",
  openGraph: {
    title: "JSON to TypeScript Interface Generator | devpick.sh",
    description: "Convert JSON to TypeScript interfaces online. Handles nested objects, arrays, optional fields.",
    url: "https://devpick.sh/json-to-ts",
  },
  alternates: { canonical: "https://devpick.sh/json-to-ts" },
};

export default function JsonToTsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON to TypeScript Interface Generator",
            description: "Convert JSON to TypeScript interfaces online",
            url: "https://devpick.sh/json-to-ts",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JsonToTsTool />
    </>
  );
}
