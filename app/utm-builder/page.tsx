import type { Metadata } from "next";
import { UtmBuilderTool } from "./utm-builder-tool";

export const metadata: Metadata = {
  title: "Free UTM Builder & Campaign URL Generator for GA4",
  description:
    "Build UTM tracking links in seconds — free UTM builder with shareable links, presets, bulk mode, and GA4 naming checks.",
  openGraph: {
    title: "UTM Builder & Campaign URL Generator (Free) | devpick.sh",
    description:
      "Build UTM links for email, social, and ads with live preview, shareable links, presets, and bulk mode. Works with GA4 and any analytics tool.",
    url: "https://devpick.sh/utm-builder",
  },
  alternates: { canonical: "https://devpick.sh/utm-builder" },
};

export default function UtmBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "UTM Builder",
            description: "Build UTM parameter tracking URLs for marketing campaigns",
            url: "https://devpick.sh/utm-builder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <UtmBuilderTool />
    </>
  );
}
