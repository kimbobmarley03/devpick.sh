import type { Metadata } from "next";
import { RobotsTxtTool } from "./robots-txt-tool";

export const metadata: Metadata = {
  title: "Robots.txt Generator — Free Online Tool",
  description:
    "Generate a robots.txt file online. Configure user agents, allow/disallow paths, sitemap URL, and crawl delay. Free, instant, client-side.",
  openGraph: {
    title: "Robots.txt Generator | devpick.sh",
    description: "Generate a robots.txt file online. Free, instant, client-side.",
    url: "https://devpick.sh/robots-txt",
  },
  alternates: { canonical: "https://devpick.sh/robots-txt" },
};

export default function RobotsTxtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Robots.txt Generator",
            description: "Generate a robots.txt file with user agents, allow/disallow paths, and sitemap",
            url: "https://devpick.sh/robots-txt",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <RobotsTxtTool />
    </>
  );
}
