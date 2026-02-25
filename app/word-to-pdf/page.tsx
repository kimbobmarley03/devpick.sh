import type { Metadata } from "next";
import { WordToPdfTool } from "./word-to-pdf-tool";

export const metadata: Metadata = {
  title: "Text to PDF — Free, No Upload | devpick.sh",
  description:
    "Convert text files (.txt) to PDF online. Free, 100% client-side — your files never leave your browser.",
  openGraph: {
    title: "Text to PDF | devpick.sh",
    description: "Convert text to PDF. Runs entirely in your browser.",
    url: "https://devpick.sh/word-to-pdf",
  },
  alternates: { canonical: "https://devpick.sh/word-to-pdf" },
};

export default function WordToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text to PDF",
            description: "Convert text files to PDF online for free",
            url: "https://devpick.sh/word-to-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <WordToPdfTool />
    </>
  );
}
