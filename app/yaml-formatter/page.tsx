import type { Metadata } from "next";
import { YamlTool } from "./yaml-tool";

export const metadata: Metadata = {
  title: "YAML to JSON Converter Online — Free YAML Parser",
  description:
    "Convert YAML to JSON or JSON to YAML online. Handles nested objects, arrays, strings, numbers, booleans. Free, instant, client-side.",
  openGraph: {
    title: "YAML to JSON Converter | devpick.sh",
    description: "Convert YAML to JSON or JSON to YAML. Handles nested objects, arrays, and primitives.",
    url: "https://devpick.sh/yaml-formatter",
  },
  alternates: { canonical: "https://devpick.sh/yaml-formatter" },
};

export default function YamlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "YAML to JSON Converter",
            description:
              "Convert YAML to JSON or JSON to YAML online. Handles nested objects, arrays, strings, numbers, booleans.",
            url: "https://devpick.sh/yaml-formatter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <YamlTool />
    </>
  );
}
