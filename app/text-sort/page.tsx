import type { Metadata } from "next";
import { TextSortTool } from "./text-sort-tool";

export const metadata: Metadata = {
  title: "Text Sort & Dedupe Online — Sort Lines Free | devpick.sh",
  description:
    "Sort lines A-Z, Z-A, by length, reverse, shuffle, deduplicate, trim whitespace, or remove empty lines. Free, instant, client-side text sorter and deduplicator.",
  openGraph: {
    title: "Text Sort & Dedupe Online | devpick.sh",
    description: "Sort, deduplicate, and clean text lines. Free, instant, no install.",
    url: "https://devpick.sh/text-sort",
  },
  alternates: { canonical: "https://devpick.sh/text-sort" },
};

export default function TextSortPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text Sort & Dedupe",
            description: "Sort lines, remove duplicates, trim whitespace from text",
            url: "https://devpick.sh/text-sort",
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
              { "@type": "ListItem", position: 2, name: "Text Sort & Dedupe", item: "https://devpick.sh/text-sort" },
            ],
          }),
        }}
      />
      <TextSortTool />
    </>
  );
}
