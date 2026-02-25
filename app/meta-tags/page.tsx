import type { Metadata } from "next";
import { MetaTagsTool } from "./meta-tags-tool";

export const metadata: Metadata = {
  title: "Meta Tag Generator — Open Graph & Twitter Card Tags",
  description:
    "Generate meta tags, Open Graph tags, and Twitter Card tags for your website. Preview how your page looks in Google search and social media. Free, instant, client-side.",
  openGraph: {
    title: "Meta Tag Generator | devpick.sh",
    description: "Generate meta, Open Graph, and Twitter Card tags. Free, instant, client-side.",
    url: "https://devpick.sh/meta-tags",
  },
  alternates: { canonical: "https://devpick.sh/meta-tags" },
};

export default function MetaTagsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Meta Tag Generator",
            description: "Generate meta tags, Open Graph tags, and Twitter Card tags for your website",
            url: "https://devpick.sh/meta-tags",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MetaTagsTool />
    </>
  );
}
