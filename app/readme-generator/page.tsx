import type { Metadata } from "next";
import { ReadmeGeneratorTool } from "./readme-generator-tool";

export const metadata: Metadata = {
  title: "README Generator — Create GitHub README Files",
  description:
    "Create a professional GitHub README with project details, installation steps, features, tech stack, and a live Markdown preview. Free and client-side.",
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
