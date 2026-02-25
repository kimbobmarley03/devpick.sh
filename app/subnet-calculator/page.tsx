import type { Metadata } from "next";
import { SubnetCalculatorTool } from "./subnet-calculator-tool";

export const metadata: Metadata = {
  title: "Subnet Calculator — CIDR IP Range | devpick.sh",
  description:
    "Calculate subnet details from IP address and CIDR notation. Get network address, broadcast, host range, total hosts, wildcard mask, and binary. Free.",
  openGraph: {
    title: "Subnet Calculator | devpick.sh",
    description: "Calculate CIDR subnet details: network, broadcast, host range, and more.",
    url: "https://devpick.sh/subnet-calculator",
  },
  alternates: { canonical: "https://devpick.sh/subnet-calculator" },
};

export default function SubnetCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Subnet Calculator",
            description: "Calculate subnet details from IP address and CIDR notation",
            url: "https://devpick.sh/subnet-calculator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SubnetCalculatorTool />
    </>
  );
}
