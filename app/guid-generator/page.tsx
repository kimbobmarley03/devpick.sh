import type { Metadata } from "next";
import { GuidTool } from "./guid-tool";

export const metadata: Metadata = {
  title: "GUID Generator (UUID v4) — Free Online Bulk GUID Tool | devpick.sh",
  description:
    "Free GUID Generator to create UUID v4 values instantly. Bulk-generate GUIDs, output uppercase/braces/no-hyphens/C# format, and copy in one click. Client-side, no sign-up.",
  keywords: [
    "guid generator",
    "uuid v4 generator",
    "bulk guid generator",
    "online guid tool",
    "c# guid format",
  ],
  openGraph: {
    title: "GUID Generator (UUID v4) — Free Online | devpick.sh",
    description:
      "Generate UUID v4 / GUID values online with bulk output and formatting options (uppercase, braces, no hyphens, C#). Free and client-side.",
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
