import type { Metadata } from "next";
import { HexCalculatorTool } from "./hex-calculator-tool";

export const metadata: Metadata = {
  title: "Hex Calculator — Hexadecimal Arithmetic & Bitwise Online | devpick.sh",
  description:
    "Hex calculator for add, subtract, multiply, divide, AND, OR, XOR, NOT, and bit shifts. Input in hex, see results in hex, decimal, and binary. 100% client-side, free.",
  openGraph: {
    title: "Hex Calculator | devpick.sh",
    description: "Hexadecimal arithmetic and bitwise operations online. Free, instant, client-side.",
    url: "https://devpick.sh/hex-calculator",
  },
  alternates: { canonical: "https://devpick.sh/hex-calculator" },
};

export default function HexCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hex Calculator",
            description: "Hexadecimal arithmetic and bitwise operations",
            url: "https://devpick.sh/hex-calculator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HexCalculatorTool />
    </>
  );
}
