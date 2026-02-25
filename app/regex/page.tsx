import type { Metadata } from "next";
import { RegexTool } from "./regex-tool";

export const metadata: Metadata = {
  title: "Regex Tester Online — Test Regular Expressions",
  description:
    "Test and debug regular expressions online with real-time matching, capture groups, and match highlighting. Free regex tester with JavaScript flavor support.",
  openGraph: {
    title: "Regex Tester Online | devpick.sh",
    description: "Test and debug regular expressions with real-time highlighting.",
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
