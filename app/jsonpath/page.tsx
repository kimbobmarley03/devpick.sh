import type { Metadata } from "next";
import { JsonPathTool } from "./jsonpath-tool";

export const metadata: Metadata = {
  title: "JSONPath Tester — Test JSONPath Expressions Online",
  description:
    "Test JSONPath expressions against JSON data online. Supports $, .key, [index], [*], and recursive descent. Free, client-side JSONPath evaluator.",
  openGraph: {
    title: "JSONPath Tester | devpick.sh",
    description: "Test JSONPath expressions against JSON. Supports root, dot, index, wildcard, recursive.",
    url: "https://devpick.sh/jsonpath",
  },
  alternates: { canonical: "https://devpick.sh/jsonpath" },
};

export default function JsonPathPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSONPath Tester",
            description: "Test JSONPath expressions against JSON data online",
            url: "https://devpick.sh/jsonpath",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JsonPathTool />
    </>
  );
}
