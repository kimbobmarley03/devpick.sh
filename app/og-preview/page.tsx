import type { Metadata } from "next";
import { OgPreviewTool } from "./og-preview-tool";

export const metadata: Metadata = {
  title: "Open Graph Preview — See How Your Page Looks on Social Media | devpick.sh",
  description:
    "Preview how your page looks when shared on Twitter, Facebook, LinkedIn, and Discord. Paste your HTML head section and see preview cards instantly.",
  openGraph: {
    title: "Open Graph Preview | devpick.sh",
    description: "Preview social media share cards for your page. Free, instant, client-side.",
    url: "https://devpick.sh/og-preview",
  },
  alternates: { canonical: "https://devpick.sh/og-preview" },
};

export default function OgPreviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Open Graph Preview",
            description: "Preview how your page looks when shared on social media",
            url: "https://devpick.sh/og-preview",
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
              { "@type": "ListItem", position: 2, name: "Open Graph Preview", item: "https://devpick.sh/og-preview" },
            ],
          }),
        }}
      />
      <OgPreviewTool />
    </>
  );
}
