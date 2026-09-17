import type { Metadata } from "next";
import { FlexboxTool } from "./flexbox-tool";

export const metadata: Metadata = {
  title: "Flexbox Playground — CSS Flexbox Generator",
  description:
    "Experiment with flex direction, alignment, wrapping, gap, and items in a live CSS Flexbox playground, then copy the generated CSS.",
  openGraph: {
    title: "Flexbox Playground | devpick.sh",
    description: "Interactive CSS Flexbox playground with live preview and copy CSS. Free, client-side.",
    url: "https://devpick.sh/flexbox",
  },
  alternates: { canonical: "https://devpick.sh/flexbox" },
};

export default function FlexboxPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Flexbox Playground",
            description: "Interactive CSS Flexbox playground with container and item properties",
            url: "https://devpick.sh/flexbox",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <FlexboxTool />
    </>
  );
}
