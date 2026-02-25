import type { Metadata } from "next";
import { AspectRatioTool } from "./aspect-ratio-tool";

export const metadata: Metadata = {
  title: "Aspect Ratio Calculator Online — Free Width Height Tool | devpick.sh",
  description:
    "Calculate aspect ratio from width and height. Lock ratio and scale dimensions. Common presets: 16:9, 4:3, 1:1, 9:16, 21:9. Free online aspect ratio calculator.",
  openGraph: {
    title: "Aspect Ratio Calculator | devpick.sh",
    description: "Calculate and lock aspect ratios. Scale dimensions. 16:9, 4:3, 1:1 presets.",
    url: "https://devpick.sh/aspect-ratio",
  },
  alternates: { canonical: "https://devpick.sh/aspect-ratio" },
};

export default function AspectRatioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Aspect Ratio Calculator",
            description: "Calculate and scale aspect ratios from width and height",
            url: "https://devpick.sh/aspect-ratio",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "Aspect Ratio Calculator", item: "https://devpick.sh/aspect-ratio" },
            ],
          }),
        }}
      />
      <AspectRatioTool />
    </>
  );
}
