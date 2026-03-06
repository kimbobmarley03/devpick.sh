import type { Metadata } from "next";
import { GitignoreGeneratorTool } from "./gitignore-generator-tool";

export const metadata: Metadata = {
  title: ".gitignore Generator Online — Free, No Sign Up | devpick.sh",
  description:
    "Generate .gitignore files for Node.js, Python, Java, Go, Rust, and more. Select templates, merge them, and download instantly. Free online, no sign up required.",
  openGraph: {
    title: ".gitignore Generator Online — Free, No Sign Up | devpick.sh",
    description: "Generate and merge .gitignore templates for any project. Free, 100% client-side.",
    url: "https://devpick.sh/gitignore-generator",
  },
  alternates: { canonical: "https://devpick.sh/gitignore-generator" },
};

export default function GitignoreGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: ".gitignore Generator",
            description: "Generate .gitignore files from popular templates",
            url: "https://devpick.sh/gitignore-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <GitignoreGeneratorTool />
    </>
  );
}
