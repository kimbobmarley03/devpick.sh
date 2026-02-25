import type { Metadata } from "next";
import { ChmodTool } from "./chmod-tool";

export const metadata: Metadata = {
  title: "Chmod Calculator Online — File Permission Calculator",
  description:
    "Calculate Unix file permissions online. Visual checkboxes for Owner/Group/Other. Shows numeric (755) and symbolic (rwxr-xr-x) modes. Free, instant, client-side.",
  openGraph: {
    title: "Chmod Calculator | devpick.sh",
    description: "Calculate Unix file permissions online. Numeric and symbolic modes, common presets.",
    url: "https://devpick.sh/chmod",
  },
  alternates: { canonical: "https://devpick.sh/chmod" },
};

export default function ChmodPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Chmod Calculator",
            description: "Calculate Unix file permissions online",
            url: "https://devpick.sh/chmod",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <ChmodTool />
    </>
  );
}
