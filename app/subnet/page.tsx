import type { Metadata } from "next";
import { SubnetTool } from "./subnet-tool";

export const metadata: Metadata = {
  title: "Subnet Calculator Online — CIDR, IP Range, Network Address",
  description:
    "Free online subnet calculator. Enter an IP address and CIDR prefix to instantly get network address, broadcast address, host range, subnet mask, wildcard mask and more.",
  openGraph: {
    title: "Subnet Calculator | devpick.sh",
    description:
      "Calculate subnet details from CIDR notation — network address, broadcast, host range, subnet mask.",
    url: "https://devpick.sh/subnet",
  },
  alternates: { canonical: "https://devpick.sh/subnet" },
};

export default function SubnetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Subnet Calculator",
            description:
              "Calculate subnet details from CIDR notation — network address, broadcast, host range, subnet mask, wildcard mask.",
            url: "https://devpick.sh/subnet",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SubnetTool />
    </>
  );
}
