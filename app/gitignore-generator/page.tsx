import type { Metadata } from "next";
import { GitignoreGeneratorTool } from "./gitignore-generator-tool";

export const metadata: Metadata = {
  title: ".gitignore Generator & Auditor for Monorepos",
  description:
    "Generate or audit a .gitignore for Node.js, Python, Rust, Next.js, Nx, and Turborepo. Find missing rules, duplicates, and risky lockfile ignores locally.",
  openGraph: {
    title: ".gitignore Generator & Auditor for Monorepos | devpick.sh",
    description: "Generate, merge, and audit .gitignore rules locally—including monorepo presets and lockfile checks.",
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
            name: ".gitignore Generator and Auditor",
            description: "Generate and audit .gitignore files, including monorepo presets and risky-rule checks",
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
