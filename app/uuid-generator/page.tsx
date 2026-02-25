import type { Metadata } from "next";
import { UuidTool } from "./uuid-tool";

export const metadata: Metadata = {
  title: "UUID Generator Online — Free UUID v4 Generator",
  description:
    "Generate UUID v4 online. Bulk UUID generation (1-100). Free, instant, client-side UUID generator with one-click copy.",
  openGraph: {
    title: "UUID Generator Online | devpick.sh",
    description: "Generate UUID v4 online. Bulk generation, one-click copy.",
    url: "https://devpick.sh/uuid-generator",
  },
  alternates: { canonical: "https://devpick.sh/uuid-generator" },
};

export default function UuidPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "UUID Generator",
            description: "Generate UUID v4 online",
            url: "https://devpick.sh/uuid-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <UuidTool />
    </>
  );
}
