import type { Metadata } from "next";
import { MergePdfTool } from "./merge-pdf-tool";

export const metadata: Metadata = {
  title: "Merge PDF Online — Free, No Sign Up, No Upload | devpick.sh",
  description:
    "Combine multiple PDF files into one online. Free, 100% client-side — files never leave your browser. No sign up required.",
  openGraph: {
    title: "Merge PDF Online — Free, No Sign Up | devpick.sh",
    description: "Combine PDFs securely in your browser. Free, no upload, no signup.",
    url: "https://devpick.sh/merge-pdf",
  },
  alternates: { canonical: "https://devpick.sh/merge-pdf" },
};

export default function MergePdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Merge PDF",
            description: "Combine multiple PDF files into one document online for free",
            url: "https://devpick.sh/merge-pdf",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MergePdfTool />
    </>
  );
}
