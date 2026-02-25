import type { Metadata } from "next";
import { MinifyTool } from "./minify-tool";

export const metadata: Metadata = {
  title: "HTML CSS JS Minifier Online — Free Code Minifier",
  description:
    "Minify HTML, CSS, and JavaScript online. Strip comments, collapse whitespace, and reduce file size. Free, instant, client-side.",
  openGraph: {
    title: "HTML CSS JS Minifier | devpick.sh",
    description: "Minify HTML, CSS, and JavaScript online. Strip comments, collapse whitespace.",
    url: "https://devpick.sh/js-minifier",
  },
  alternates: { canonical: "https://devpick.sh/js-minifier" },
};

export default function MinifyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTML CSS JS Minifier",
            description: "Minify HTML, CSS, and JavaScript online",
            url: "https://devpick.sh/js-minifier",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MinifyTool />
    </>
  );
}
