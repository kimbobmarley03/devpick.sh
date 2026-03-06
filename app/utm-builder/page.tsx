import type { Metadata } from "next";
import { UtmBuilderTool } from "./utm-builder-tool";

export const metadata: Metadata = {
  title: "UTM Builder Online — Free, No Sign Up | devpick.sh",
  description:
    "Build UTM tracking URLs for Google Analytics campaigns. Add utm_source, utm_medium, and more with live preview. Free, 100% client-side, no sign up required.",
  openGraph: {
    title: "UTM Builder Online — Free, No Sign Up | devpick.sh",
    description: "Build UTM tracking URLs instantly. Live preview, copy button, and history. Free, no sign up.",
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
