import type { Metadata } from "next";
import { CssBorderRadiusTool } from "./css-border-radius-tool";

export const metadata: Metadata = {
  title: "CSS Border Radius Generator — Visual Editor",
  description:
    "Generate CSS border-radius values with a visual editor. Control individual corners, support elliptical radii, live preview. Free, instant, client-side.",
  openGraph: {
    title: "CSS Border Radius Generator | devpick.sh",
    description: "Visual CSS border-radius generator with individual corners and live preview.",
    url: "https://devpick.sh/css-border-radius",
  },
  alternates: { canonical: "https://devpick.sh/css-border-radius" },
};

export default function CssBorderRadiusPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CSS Border Radius Generator",
            description: "Generate CSS border-radius values with a visual editor and individual corner control",
            url: "https://devpick.sh/css-border-radius",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CssBorderRadiusTool />
    </>
  );
}
