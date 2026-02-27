import type { Metadata } from "next";
import { GitignoreGeneratorTool } from "./gitignore-generator-tool";

export const metadata: Metadata = {
  title: ".gitignore Generator — Create Git Ignore Files | devpick.sh",
  description:
    "Generate .gitignore files for Node.js, Python, Java, Go, Rust, macOS, Windows, VS Code, JetBrains and more. Select multiple templates, merge them, and download instantly.",
  openGraph: {
    title: ".gitignore Generator | devpick.sh",
    description: "Select templates, merge, copy or download your .gitignore. 100% client-side, free.",
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
