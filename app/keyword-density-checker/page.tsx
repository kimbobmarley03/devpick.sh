import type { Metadata } from "next";
import { KeywordDensityCheckerTool } from "./keyword-density-checker-tool";

export const metadata: Metadata = {
  title: "Keyword Density Checker — Free SEO Tool | devpick.sh",
  description:
    "Check keyword density and frequency in your text. See top keywords, word count, and density percentages for SEO optimization. Free, client-side.",
  openGraph: {
    title: "Keyword Density Checker | devpick.sh",
    description: "Analyze keyword density and frequency for SEO. Free and client-side.",
    url: "https://devpick.sh/keyword-density-checker",
  },
  alternates: { canonical: "https://devpick.sh/keyword-density-checker" },
};

export default function KeywordDensityCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Keyword Density Checker",
            description: "Check keyword density and frequency for SEO optimization",
            url: "https://devpick.sh/keyword-density-checker",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <KeywordDensityCheckerTool />
    </>
  );
}
