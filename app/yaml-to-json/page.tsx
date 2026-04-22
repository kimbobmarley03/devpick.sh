import type { Metadata } from "next";
import { YamlToJsonTool } from "./yaml-to-json-tool";

export const metadata: Metadata = {
  title: "YAML to JSON Converter Online (Validate + Format) | devpick.sh",
  description:
    "Free YAML to JSON converter with instant validation and pretty formatting. Convert YAML config files and API payloads safely in your browser — no upload needed.",
  openGraph: {
    title: "YAML to JSON Converter Online (Validate + Format) | devpick.sh",
    description:
      "Convert YAML to valid, formatted JSON instantly. Great for Kubernetes, CI/CD, and API config workflows. 100% client-side.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "YAML to JSON", item: "https://devpick.sh/yaml-to-json" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I convert Kubernetes YAML to JSON?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Paste your Kubernetes YAML manifest and the tool converts it into JSON instantly in your browser.",
                },
              },
              {
                "@type": "Question",
                name: "Does this YAML to JSON converter upload my data?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Conversion runs fully client-side, so your YAML and JSON stay on your device.",
                },
              },
            ],
          }),
        }}
      />
      <YamlToJsonTool />
    </>
  );
}
