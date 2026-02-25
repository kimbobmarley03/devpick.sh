import type { Metadata } from "next";
import { DiffTool } from "./diff-tool";

export const metadata: Metadata = {
  title: "Diff Checker Online — Compare Text Side by Side",
  description:
    "Compare two texts side by side online. Free, instant, client-side diff checker. Highlights added, removed, and unchanged lines.",
  openGraph: {
    title: "Diff Checker Online | devpick.sh",
    description: "Compare two texts side by side. Highlights differences instantly. Free.",
    url: "https://devpick.sh/diff-checker",
  },
  alternates: { canonical: "https://devpick.sh/diff-checker" },
};

export default function DiffPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Diff Checker",
            description: "Compare two texts and highlight differences online",
            url: "https://devpick.sh/diff-checker",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <DiffTool />
    </>
  );
}
