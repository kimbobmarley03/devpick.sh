import type { Metadata } from "next";
import { SubnetTool } from "./subnet-tool";

export const metadata: Metadata = {
  title: "Subnet Calculator — CIDR & IP Range",
  description:
    "Calculate network and broadcast addresses, usable host range, subnet mask, and wildcard mask from an IPv4 address and CIDR prefix.",
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
