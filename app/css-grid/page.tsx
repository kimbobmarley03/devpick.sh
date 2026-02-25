import type { Metadata } from "next";
import { CssGridTool } from "./css-grid-tool";

export const metadata: Metadata = {
  title: "CSS Grid Generator — Visual Grid Builder",
  description:
    "Generate CSS Grid layouts visually. Set columns, rows, gap, and name grid areas. Live preview and copy CSS. Free, instant, client-side.",
  openGraph: {
    title: "CSS Grid Generator | devpick.sh",
    description: "Visual CSS Grid layout generator with named areas and live preview. Free, client-side.",
    url: "https://devpick.sh/css-grid",
  },
  alternates: { canonical: "https://devpick.sh/css-grid" },
};

export default function CssGridPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Grid Generator",
            description: "Generate CSS Grid layouts with columns, rows, gap, and named areas",
            url: "https://devpick.sh/css-grid",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CssGridTool />
    </>
  );
}
