import type { Metadata } from "next";
import { UtmBuilderTool } from "./utm-builder-tool";

export const metadata: Metadata = {
  title: "UTM Builder — Free Campaign URL Generator | devpick.sh",
  description:
    "Build UTM tracking URLs for Google Analytics campaigns. Add utm_source, utm_medium, utm_campaign, utm_term, and utm_content parameters with live preview. Free, 100% client-side.",
  openGraph: {
    title: "UTM Builder — Free Campaign URL Generator | devpick.sh",
    description: "Build UTM tracking URLs instantly. Live preview, copy button, and history of recent URLs.",
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
