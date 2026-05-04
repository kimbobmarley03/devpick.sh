import type { Metadata } from "next";
import { XmlTool } from "./xml-tool";

export const metadata: Metadata = {
  title: "XML Formatter & Validator Online (Beautify/Minify) — Free | devpick.sh",
  description:
    "Beautify, format, minify, and validate XML online. Free XML formatter for SOAP/API payloads with instant syntax checks. 100% client-side, no upload, no sign up.",
  keywords: [
    "xml formatter",
    "xml beautifier",
    "xml validator",
    "xml pretty print",
    "xml minifier",
    "format xml online",
    "soap xml formatter",
  ],
  openGraph: {
    title: "XML Formatter & Validator Online (Beautify/Minify) — Free | devpick.sh",
    description:
      "Format, beautify, minify, and validate XML instantly. Great for SOAP/API payloads. Private, browser-only, no sign up.",
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
