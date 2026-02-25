import type { Metadata } from "next";
import { SlugTool } from "./slug-tool";

export const metadata: Metadata = {
  title: "Slug Generator Online — URL Slug & Filename Converter",
  description:
    "Generate URL-safe slugs from text online. Convert to slug, filename-safe, and variable names. Handles unicode, separators, max length. Free, instant, client-side.",
  openGraph: {
    title: "Slug Generator | devpick.sh",
    description: "Generate URL-safe slugs from text online. Handles unicode, multiple formats.",
    url: "https://devpick.sh/slug-generator",
  },
  alternates: { canonical: "https://devpick.sh/slug-generator" },
};

export default function SlugPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Slug Generator",
            description: "Generate URL-safe slugs from text online",
            url: "https://devpick.sh/slug-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SlugTool />
    </>
  );
}
