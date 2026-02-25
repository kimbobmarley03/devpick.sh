import type { Metadata } from "next";
import { JsonToYamlTool } from "./json-to-yaml-tool";

export const metadata: Metadata = {
  title: "JSON to YAML Converter Online — Free | devpick.sh",
  description:
    "Convert JSON to YAML and YAML to JSON instantly in your browser. Bidirectional converter, no data sent anywhere. 100% client-side, free.",
  openGraph: {
    title: "JSON ↔ YAML Converter | devpick.sh",
    description: "Convert between JSON and YAML online for free. Client-side, bidirectional.",
    url: "https://devpick.sh/json-to-yaml",
  },
  alternates: { canonical: "https://devpick.sh/json-to-yaml" },
};

export default function JsonToYamlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON to YAML Converter",
            description: "Convert JSON to YAML and YAML to JSON online for free",
            url: "https://devpick.sh/json-to-yaml",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "JSON to YAML", item: "https://devpick.sh/json-to-yaml" },
            ],
          }),
        }}
      />
      <JsonToYamlTool />
    </>
  );
}
