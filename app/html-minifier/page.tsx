import type { Metadata } from "next";
import { HtmlMinifierTool } from "./html-minifier-tool";

export const metadata: Metadata = {
  title: "HTML Minifier — Free Online | devpick.sh",
  description:
    "Minify HTML code online for free. Remove comments, whitespace, and optional tags to reduce file size. 100% client-side.",
  openGraph: {
    title: "HTML Minifier | devpick.sh",
    description: "Minify HTML online for free. Remove comments, whitespace, and optional tags.",
    url: "https://devpick.sh/html-minifier",
  },
  alternates: { canonical: "https://devpick.sh/html-minifier" },
};

export default function HtmlMinifierPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTML Minifier",
            description: "Minify HTML code online for free",
            url: "https://devpick.sh/html-minifier",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HtmlMinifierTool />
    </>
  );
}
