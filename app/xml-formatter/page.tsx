import type { Metadata } from "next";
import { XmlTool } from "./xml-tool";

export const metadata: Metadata = {
  title: "XML Formatter Online — Beautify & Minify XML",
  description:
    "Format, beautify, or minify XML online. Free, instant, client-side XML formatter with validation errors. No server, no data sent.",
  openGraph: {
    title: "XML Formatter Online | devpick.sh",
    description: "Format and minify XML online. Validates XML and shows errors. Free, instant.",
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
