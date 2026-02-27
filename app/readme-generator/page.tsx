import type { Metadata } from "next";
import { ReadmeGeneratorTool } from "./readme-generator-tool";

export const metadata: Metadata = {
  title: "README Generator — Create GitHub README Files | devpick.sh",
  description:
    "Generate professional GitHub README files instantly. Add project name, description, tech stack, features, installation steps, and more. Live markdown preview. 100% client-side, free.",
  openGraph: {
    title: "README Generator — Create GitHub README Files | devpick.sh",
    description: "Generate professional GitHub README files with live preview. Free, instant, no sign-up.",
    url: "https://devpick.sh/readme-generator",
  },
  alternates: { canonical: "https://devpick.sh/readme-generator" },
};

export default function ReadmeGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "README Generator",
            description: "Generate professional GitHub README files instantly",
            url: "https://devpick.sh/readme-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <ReadmeGeneratorTool />
    </>
  );
}
