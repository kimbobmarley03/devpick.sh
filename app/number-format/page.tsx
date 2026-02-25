import type { Metadata } from "next";
import { NumberFormatTool } from "./number-format-tool";

export const metadata: Metadata = {
  title: "Number Formatter — Format Numbers as Currency, Binary, Words & More",
  description:
    "Format any number as commas, currency, scientific notation, words, binary, hex, Roman numerals, and file size. Free online number formatter.",
  openGraph: {
    title: "Number Formatter | devpick.sh",
    description: "Format numbers as commas, currency, scientific, words, binary, hex, Roman numerals.",
    url: "https://devpick.sh/number-format",
  },
  alternates: { canonical: "https://devpick.sh/number-format" },
};

export default function NumberFormatPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Number Formatter",
            description: "Format numbers in many ways: commas, currency, binary, words, and more",
            url: "https://devpick.sh/number-format",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <NumberFormatTool />
    </>
  );
}
