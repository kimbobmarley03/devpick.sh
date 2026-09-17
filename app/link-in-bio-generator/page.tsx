import type { Metadata } from "next";
import { LinkInBioGeneratorTool } from "./link-in-bio-generator-tool";

export const metadata: Metadata = {
  title: "Link in Bio Generator — Free Linktree Alternative",
  description:
    "Build a customizable link-in-bio page, preview it on mobile, and export a self-contained HTML file to host anywhere. Free with no sign-up.",
  openGraph: {
    title: "Link in Bio Generator — Free Linktree Alternative | devpick.sh",
    description: "Create your link-in-bio page. Customize and export a self-hosted HTML file. No Linktree needed.",
    url: "https://devpick.sh/link-in-bio-generator",
  },
  alternates: { canonical: "https://devpick.sh/link-in-bio-generator" },
};

export default function LinkInBioGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Link in Bio Generator",
            description: "Build a link-in-bio page and export it as a self-contained HTML file",
            url: "https://devpick.sh/link-in-bio-generator",
            applicationCategory: "SocialNetworkingApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <LinkInBioGeneratorTool />
    </>
  );
}
