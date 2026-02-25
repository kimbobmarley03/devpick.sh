import type { Metadata } from "next";
import { ColorFromImageTool } from "./color-from-image-tool";

export const metadata: Metadata = {
  title: "Color Picker from Image Online — Free HEX RGB HSL | devpick.sh",
  description:
    "Pick colors from any image online. Upload photo, click anywhere to get HEX, RGB, and HSL values. Build a color palette from your images. Free, no signup.",
  openGraph: {
    title: "Color Picker from Image | devpick.sh",
    description: "Upload an image and click to pick any color. Get HEX, RGB, HSL instantly.",
    url: "https://devpick.sh/color-from-image",
  },
  alternates: { canonical: "https://devpick.sh/color-from-image" },
};

export default function ColorFromImagePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Color Picker from Image",
            description: "Pick colors from images online — get HEX, RGB, HSL values",
            url: "https://devpick.sh/color-from-image",
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
              { "@type": "ListItem", position: 2, name: "Color Picker from Image", item: "https://devpick.sh/color-from-image" },
            ],
          }),
        }}
      />
      <ColorFromImageTool />
    </>
  );
}
