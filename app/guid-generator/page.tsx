import type { Metadata } from "next";
import { GuidTool } from "./guid-tool";

export const metadata: Metadata = {
  title: "GUID Generator — Free Online GUID / UUID Generator | devpick.sh",
  description:
    "Generate GUIDs (Globally Unique Identifiers) online. Bulk generate, format as uppercase, braces, no-hyphens, or C# Guid. 100% client-side, free, no sign-up. Same as UUID v4.",
  openGraph: {
    title: "GUID Generator | devpick.sh",
    description: "Generate random GUIDs online. Multiple formats, bulk generate, one-click copy. Free, client-side.",
    url: "https://devpick.sh/guid-generator",
  },
  alternates: { canonical: "https://devpick.sh/guid-generator" },
};

export default function GuidPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "GUID Generator",
            description: "Generate GUIDs (Globally Unique Identifiers) online",
            url: "https://devpick.sh/guid-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <GuidTool />
    </>
  );
}
