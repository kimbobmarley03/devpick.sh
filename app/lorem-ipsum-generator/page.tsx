import type { Metadata } from "next";
import { LoremTool } from "./lorem-tool";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator Online — Free Placeholder Text",
  description:
    "Generate lorem ipsum placeholder text online. Choose paragraphs, sentences, or words. Start with classic lorem ipsum or random. Free, instant.",
  openGraph: {
    title: "Lorem Ipsum Generator | devpick.sh",
    description: "Generate lorem ipsum placeholder text. Paragraphs, sentences, or words on demand.",
    url: "https://devpick.sh/lorem-ipsum-generator",
  },
  alternates: { canonical: "https://devpick.sh/lorem-ipsum-generator" },
};

export default function LoremPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Lorem Ipsum Generator",
            description:
              "Generate lorem ipsum placeholder text online. Choose paragraphs, sentences, or words.",
            url: "https://devpick.sh/lorem-ipsum-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <LoremTool />
    </>
  );
}
