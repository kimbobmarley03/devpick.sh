import type { Metadata } from "next";
import { EscapeTool } from "./escape-tool";

export const metadata: Metadata = {
  title: "Escape / Unescape String Online — JSON, HTML, URL, XML, Regex",
  description:
    "Escape and unescape strings online. Supports JSON escape, HTML entities, URL encoding, XML escape, and Regex escape. Free, instant, client-side.",
  openGraph: {
    title: "Escape / Unescape String | devpick.sh",
    description: "Escape and unescape JSON, HTML, URL, XML, and Regex strings online.",
    url: "https://devpick.sh/escape",
  },
  alternates: { canonical: "https://devpick.sh/escape" },
};

export default function EscapePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Escape / Unescape String",
            description: "Escape and unescape strings online — JSON, HTML, URL, XML, Regex",
            url: "https://devpick.sh/escape",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <EscapeTool />
    </>
  );
}
