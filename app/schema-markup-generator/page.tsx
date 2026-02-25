import type { Metadata } from "next";
import { SchemaMarkupGeneratorTool } from "./schema-markup-generator-tool";

export const metadata: Metadata = {
  title: "Schema Markup Generator — Free JSON-LD | devpick.sh",
  description:
    "Generate JSON-LD schema markup for Article, FAQ, LocalBusiness, Product, Person, Organization, Event, HowTo, Recipe, Video, and more. Free, no signup.",
  openGraph: {
    title: "Schema Markup Generator | devpick.sh",
    description: "Generate JSON-LD structured data markup for SEO online for free.",
    url: "https://devpick.sh/schema-markup-generator",
  },
  alternates: { canonical: "https://devpick.sh/schema-markup-generator" },
};

export default function SchemaMarkupGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Schema Markup Generator",
            description: "Generate JSON-LD structured data markup for SEO",
            url: "https://devpick.sh/schema-markup-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SchemaMarkupGeneratorTool />
    </>
  );
}
