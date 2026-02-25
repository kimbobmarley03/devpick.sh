import type { Metadata } from "next";
import { YamlToJsonTool } from "./yaml-to-json-tool";

export const metadata: Metadata = {
  title: "YAML to JSON Converter — Free Online | devpick.sh",
  description:
    "Convert YAML to JSON instantly in your browser. Paste YAML and get formatted JSON output. 100% client-side, free, no data sent.",
  openGraph: {
    title: "YAML to JSON Converter | devpick.sh",
    description: "Convert YAML to JSON online for free. Client-side and instant.",
    url: "https://devpick.sh/yaml-to-json",
  },
  alternates: { canonical: "https://devpick.sh/yaml-to-json" },
};

export default function YamlToJsonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "YAML to JSON Converter",
            description: "Convert YAML to JSON online for free",
            url: "https://devpick.sh/yaml-to-json",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <YamlToJsonTool />
    </>
  );
}
