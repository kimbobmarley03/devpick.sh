import type { Metadata } from "next";
import { CssBoxShadowTool } from "./css-box-shadow-tool";

export const metadata: Metadata = {
  title: "CSS Box Shadow Generator — Live Preview",
  description:
    "Generate CSS box shadows online with sliders for offset, blur, spread, color, and opacity. Support for multiple shadows and inset. Live preview and copy CSS.",
  openGraph: {
    title: "CSS Box Shadow Generator | devpick.sh",
    description: "Generate CSS box shadows with live preview. Multiple shadows, inset. Free, client-side.",
    url: "https://devpick.sh/css-box-shadow",
  },
  alternates: { canonical: "https://devpick.sh/css-box-shadow" },
};

export default function CssBoxShadowPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Box Shadow Generator",
            description: "Generate CSS box shadows with sliders, multiple layers, and inset support",
            url: "https://devpick.sh/css-box-shadow",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CssBoxShadowTool />
    </>
  );
}
