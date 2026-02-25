import type { Metadata } from "next";
import { TextCompareTool } from "./text-compare-tool";

export const metadata: Metadata = {
  title: "Text Compare — Compare Two Texts Online | devpick.sh",
  description:
    "Compare two texts online and see line-by-line differences. Find added, removed, and changed lines instantly. Free, no upload.",
  openGraph: {
    title: "Text Compare | devpick.sh",
    description: "Compare two texts and see line-by-line differences. Free and client-side.",
    url: "https://devpick.sh/text-compare",
  },
  alternates: { canonical: "https://devpick.sh/text-compare" },
};

export default function TextComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text Compare",
            description: "Compare two texts and see line-by-line differences",
            url: "https://devpick.sh/text-compare",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <TextCompareTool />
    </>
  );
}
