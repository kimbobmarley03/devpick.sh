import type { Metadata } from "next";
import { ColorPaletteTool } from "./color-palette-tool";

export const metadata: Metadata = {
  title: "Color Palette Generator Online — Free Harmonious Palettes | devpick.sh",
  description:
    "Generate beautiful color palettes online. Enter a base color to create complementary, analogous, triadic, and monochromatic palettes. Copy HEX codes instantly.",
  openGraph: {
    title: "Color Palette Generator | devpick.sh",
    description: "Generate complementary, analogous, triadic color palettes from any base color.",
    url: "https://devpick.sh/color-palette",
  },
  alternates: { canonical: "https://devpick.sh/color-palette" },
};

export default function ColorPalettePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Color Palette Generator",
            description: "Generate harmonious color palettes from a base color",
            url: "https://devpick.sh/color-palette",
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
              { "@type": "ListItem", position: 2, name: "Color Palette Generator", item: "https://devpick.sh/color-palette" },
            ],
          }),
        }}
      />
      <ColorPaletteTool />
    </>
  );
}
