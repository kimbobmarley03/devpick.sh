import type { Metadata } from "next";
import { NginxConfigGeneratorTool } from "./nginx-config-generator-tool";

export const metadata: Metadata = {
  title: "Nginx Config Generator — Visual Configuration Builder | devpick.sh",
  description:
    "Generate nginx server block configurations visually. Configure SSL, reverse proxy, gzip, caching, CORS, and rate limiting. Syntax-highlighted output. 100% client-side, free.",
  openGraph: {
    title: "Nginx Config Generator — Visual Configuration Builder | devpick.sh",
    description: "Build nginx server configurations visually with SSL, proxy, and caching options. Free, instant, no sign-up.",
    url: "https://devpick.sh/nginx-config-generator",
  },
  alternates: { canonical: "https://devpick.sh/nginx-config-generator" },
};

export default function NginxConfigGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Nginx Config Generator",
            description: "Generate nginx server block configurations visually",
            url: "https://devpick.sh/nginx-config-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <NginxConfigGeneratorTool />
    </>
  );
}
