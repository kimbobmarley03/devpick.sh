import type { Metadata } from "next";
import { IpTool } from "./ip-tool";

export const metadata: Metadata = {
  title: "IP Lookup — What Is My IP Address & Geolocation",
  description:
    "Find your public IP address and geolocation instantly. Lookup any IP to get city, region, country, timezone, ISP, org, and ASN information.",
  openGraph: {
    title: "IP Lookup | devpick.sh",
    description:
      "Find your public IP and geo info. Lookup any IP for city, region, ISP, timezone and more.",
    url: "https://devpick.sh/ip-lookup",
  },
  alternates: { canonical: "https://devpick.sh/ip-lookup" },
};

export default function IpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "IP Lookup",
            description:
              "Find your public IP address and geolocation. Lookup any IP for city, region, country, timezone, ISP, org, and ASN.",
            url: "https://devpick.sh/ip-lookup",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <IpTool />
    </>
  );
}
