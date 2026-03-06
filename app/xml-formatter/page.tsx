import type { Metadata } from "next";
import { XmlTool } from "./xml-tool";

export const metadata: Metadata = {
  title: "XML Formatter Online — Free, No Sign Up | devpick.sh",
  description:
    "Format, beautify, or minify XML online. Free XML formatter with validation. No server, no data sent — 100% client-side, no sign up required.",
  openGraph: {
    title: "XML Formatter Online — Free, No Sign Up | devpick.sh",
    description: "Format, beautify and minify XML online. Validates XML. Free, instant, no signup.",
    url: "https://devpick.sh/xml-formatter",
  },
  alternates: { canonical: "https://devpick.sh/xml-formatter" },
};

export default function XmlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "XML Formatter",
            description: "Format, beautify, or minify XML online with validation",
            url: "https://devpick.sh/xml-formatter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <XmlTool />
    </>
  );
}
