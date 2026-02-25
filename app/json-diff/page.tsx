import type { Metadata } from "next";
import { JsonDiffTool } from "./json-diff-tool";

export const metadata: Metadata = {
  title: "JSON Diff — Compare JSON Objects Online | devpick.sh",
  description:
    "Compare two JSON objects and see added, removed, and changed keys. Color-coded tree view diff. 100% client-side, free.",
  openGraph: {
    title: "JSON Diff | devpick.sh",
    description: "Compare two JSON objects with color-coded diff view. Free and client-side.",
    url: "https://devpick.sh/json-diff",
  },
  alternates: { canonical: "https://devpick.sh/json-diff" },
};

export default function JsonDiffPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON Diff",
            description: "Compare two JSON objects and see added, removed, and changed keys",
            url: "https://devpick.sh/json-diff",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JsonDiffTool />
    </>
  );
}
