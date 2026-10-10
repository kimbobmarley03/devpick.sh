import type { Metadata } from "next";
import { RegexTool } from "./regex-tool";

export const metadata: Metadata = {
  title: "Regex Tester — JavaScript RegExp Checker",
  description:
    "Use this free regex tester to test regular expressions online with live match highlighting, capture groups, flags, and instant JavaScript RegExp debugging.",
  openGraph: {
    title: "Regex Tester & RegExp Checker Online | devpick.sh",
    description:
      "Test JavaScript regular expressions with live matches, capture groups, and flags in a fast browser-based regex debugging tool.",
    url: "https://devpick.sh/regex",
  },
  alternates: { canonical: "https://devpick.sh/regex" },
};

export default function RegexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Regex Tester",
            description: "Test and debug regular expressions online",
            url: "https://devpick.sh/regex",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <RegexTool />
    </>
  );
}
