import type { Metadata } from "next";
import { LicenseGeneratorTool } from "./license-generator-tool";

export const metadata: Metadata = {
  title: "License Generator — Open Source License Creator",
  description:
    "Generate MIT, Apache 2.0, GPL, BSD, ISC, and other open source licenses with your name and year. Instant, free, and client-side.",
  openGraph: {
    title: "License Generator — Open Source License Creator | devpick.sh",
    description: "Generate open source license files instantly. MIT, Apache, GPL, and more. Free, no sign-up.",
    url: "https://devpick.sh/license-generator",
  },
  alternates: { canonical: "https://devpick.sh/license-generator" },
};

export default function LicenseGeneratorPage() {
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
                name: "Which open source license should I choose?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "MIT is the most permissive and simple choice for many projects. Apache 2.0 adds explicit patent protection. GPL/AGPL are copyleft licenses that require source disclosure under specific conditions.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to include my real name in a LICENSE file?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can use your personal name, organization name, or project owner identity. What matters is clearly stating who holds copyright and preserving the license notice.",
                },
              },
              {
                "@type": "Question",
                name: "Can I change my license later?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can relicense your own project, but existing contributions may require contributor consent depending on your contribution policy and prior terms.",
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
            name: "License Generator",
            description: "Generate open source license files for your projects",
            url: "https://devpick.sh/license-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <LicenseGeneratorTool />
    </>
  );
}
