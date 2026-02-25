import type { Metadata } from "next";
import { HtmlEntitiesTool } from "./html-entities-tool";

export const metadata: Metadata = {
  title: "HTML Entities Encoder / Decoder Online — Free Tool",
  description:
    "Encode special characters to HTML entities (&amp; &lt; &gt; &quot;) and decode HTML entities back to text. Free, instant, client-side.",
  openGraph: {
    title: "HTML Entities Encoder / Decoder | devpick.sh",
    description:
      "Encode and decode HTML entities online. Supports named entities and numeric entities.",
    url: "https://devpick.sh/html-entities",
  },
  alternates: { canonical: "https://devpick.sh/html-entities" },
};

export default function HtmlEntitiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTML Entities Encoder / Decoder",
            description:
              "Encode special characters to HTML entities and decode HTML entities back to text.",
            url: "https://devpick.sh/html-entities",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HtmlEntitiesTool />
    </>
  );
}
