import type { Metadata } from "next";
import { CssGradientTool } from "./css-gradient-tool";

export const metadata: Metadata = {
  title: "CSS Gradient Generator — Linear, Radial & Conic",
  description:
    "Generate CSS gradients online. Create linear, radial, and conic gradients with custom color stops. Live preview and copy CSS. Free, instant, client-side.",
  openGraph: {
    title: "CSS Gradient Generator | devpick.sh",
    description: "Generate CSS gradients online. Linear, radial, and conic. Free, instant, client-side.",
    url: "https://devpick.sh/css-gradient",
  },
  alternates: { canonical: "https://devpick.sh/css-gradient" },
};

export default function CssGradientPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Gradient Generator",
            description: "Generate linear, radial, and conic CSS gradients with custom color stops",
            url: "https://devpick.sh/css-gradient",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CssGradientTool />
    </>
  );
}
