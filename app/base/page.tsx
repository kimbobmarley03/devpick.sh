import type { Metadata } from "next";
import { BaseTool } from "./base-tool";

export const metadata: Metadata = {
  title: "Number Base Converter Online — Binary, Octal, Hex, Decimal",
  description:
    "Convert numbers between any base (2-36) online. Binary, octal, decimal, hex conversions in real-time. Free, instant, client-side.",
  openGraph: {
    title: "Number Base Converter | devpick.sh",
    description: "Convert numbers between binary, octal, decimal, hex, and any base 2-36.",
    url: "https://devpick.sh/base",
  },
  alternates: { canonical: "https://devpick.sh/base" },
};

export default function BasePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Number Base Converter",
            description:
              "Convert numbers between any base (2-36) online. Binary, octal, decimal, hex conversions in real-time.",
            url: "https://devpick.sh/base",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <BaseTool />
    </>
  );
}
