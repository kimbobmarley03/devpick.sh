import type { Metadata } from "next";
import { JsonSchemaTool } from "./json-schema-tool";

export const metadata: Metadata = {
  title: "JSON Schema Validator Online — Free JSON Schema Checker | devpick.sh",
  description:
    "Validate JSON data against a JSON Schema (draft-07). Checks types, required fields, patterns, min/max, enum, and more. Free, instant, client-side.",
  openGraph: {
    title: "JSON Schema Validator Online | devpick.sh",
    description: "Validate JSON against a schema. Supports draft-07 with instant error reporting.",
    url: "https://devpick.sh/json-schema",
  },
  alternates: { canonical: "https://devpick.sh/json-schema" },
};

export default function JsonSchemaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON Schema Validator",
            description: "Validate JSON data against JSON Schema draft-07",
            url: "https://devpick.sh/json-schema",
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
              { "@type": "ListItem", position: 2, name: "JSON Schema Validator", item: "https://devpick.sh/json-schema" },
            ],
          }),
        }}
      />
      <JsonSchemaTool />
    </>
  );
}
