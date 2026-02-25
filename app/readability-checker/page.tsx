import type { Metadata } from "next";
import { ReadabilityCheckerTool } from "./readability-checker-tool";

export const metadata: Metadata = {
  title: "Readability Checker — Flesch-Kincaid & More | devpick.sh",
  description:
    "Check text readability with Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, ARI scores. Free readability analyzer for writers and SEOs.",
  openGraph: {
    title: "Readability Checker | devpick.sh",
    description: "Analyze text readability with multiple scoring algorithms. Free and client-side.",
    url: "https://devpick.sh/readability-checker",
  },
  alternates: { canonical: "https://devpick.sh/readability-checker" },
};

export default function ReadabilityCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Readability Checker",
            description: "Check text readability with Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, ARI",
            url: "https://devpick.sh/readability-checker",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <ReadabilityCheckerTool />
    </>
  );
}
