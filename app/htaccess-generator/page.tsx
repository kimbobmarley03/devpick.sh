import type { Metadata } from "next";
import { HtaccessGeneratorTool } from "./htaccess-generator-tool";

export const metadata: Metadata = {
  title: "htaccess Generator — Apache Configuration Builder | devpick.sh",
  description:
    "Build .htaccess rules visually. Configure redirects, URL rewriting, error pages, hotlink protection, CORS, Gzip, caching, Force HTTPS, block IPs, and more. 100% client-side, free.",
  openGraph: {
    title: "htaccess Generator — Apache Configuration Builder | devpick.sh",
    description: "Build .htaccess rules visually. Generate complete Apache configuration files instantly.",
    url: "https://devpick.sh/htaccess-generator",
  },
  alternates: { canonical: "https://devpick.sh/htaccess-generator" },
};

export default function HtaccessGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "htaccess Generator",
            description: "Build .htaccess rules visually for Apache web servers",
            url: "https://devpick.sh/htaccess-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HtaccessGeneratorTool />
    </>
  );
}
