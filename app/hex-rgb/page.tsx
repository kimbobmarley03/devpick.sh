import type { Metadata } from "next";
import { HexRgbTool } from "./hex-rgb-tool";

export const metadata: Metadata = {
  title: "Hex to RGB / RGB to Hex Converter — Free Color Converter",
  description:
    "Convert hex color codes to RGB and HSL online. Supports 3-digit and 6-digit hex, with/without #. Free, instant, client-side.",
  openGraph: {
    title: "Hex to RGB / RGB to Hex | devpick.sh",
    description: "Convert hex colors to RGB/HSL and back. Free online color converter.",
    url: "https://devpick.sh/hex-rgb",
  },
  alternates: { canonical: "https://devpick.sh/hex-rgb" },
};

export default function HexRgbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hex to RGB Converter",
            description: "Convert hex color codes to RGB and HSL online",
            url: "https://devpick.sh/hex-rgb",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HexRgbTool />
    </>
  );
}
