import type { Metadata } from "next";
import { CaseTool } from "./case-tool";

export const metadata: Metadata = {
  title: "Text Case Converter Online — camelCase, snake_case, PascalCase & More",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE. Free online text case converter.",
  openGraph: {
    title: "Text Case Converter Online | devpick.sh",
    description: "Convert text between all common case formats instantly.",
    url: "https://devpick.sh/case-converter",
  },
  alternates: { canonical: "https://devpick.sh/case-converter" },
};

export default function CasePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text Case Converter",
            description: "Convert text between different case formats",
            url: "https://devpick.sh/case-converter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CaseTool />
    </>
  );
}
