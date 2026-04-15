import type { Metadata } from "next";
import { UuidTool } from "./uuid-tool";

export const metadata: Metadata = {
  title: "Free UUID Generator Online (v4) and GUID Generator, Bulk 1 to 100",
  description:
    "Generate secure UUID v4 and GUID values instantly in your browser. Free online UUID generator with bulk generation (1 to 100), one-click copy, and no sign up.",
  openGraph: {
    title: "Free UUID v4 and GUID Generator Online | devpick.sh",
    description:
      "Create random UUID v4 or GUID values with bulk generation, uppercase mode, and instant copy. Free and runs client-side.",
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
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is UUID the same as GUID?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. UUID and GUID refer to the same 128-bit identifier format. GUID is Microsoft's naming, UUID is the broader standard term.",
                },
              },
              {
                "@type": "Question",
                name: "What version of UUID does this generator create?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "This tool generates UUID v4 values, which are random identifiers commonly used for API IDs, database keys, and request tracing.",
                },
              },
              {
                "@type": "Question",
                name: "Are generated UUIDs created server-side?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. UUIDs are generated directly in your browser, so you can create IDs without uploading data.",
                },
              },
            ],
          }),
        }}
      />
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
