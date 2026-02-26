import type { Metadata } from "next";
import { PngToJpgTool } from "./png-to-jpg-tool";

export const metadata: Metadata = {
  title: "PNG to JPG Converter Online — Free | devpick.sh",
  description:
    "Convert PNG images to JPG/JPEG instantly in your browser. Handles transparency (white background). No upload, 100% client-side, free.",
  openGraph: {
    title: "PNG to JPG Converter | devpick.sh",
    description: "Convert PNG to JPEG free online. Runs in browser — no files uploaded.",
    url: "https://devpick.sh/png-to-jpg",
  },
  alternates: { canonical: "https://devpick.sh/png-to-jpg" },
};

export default function PngToJpgPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "PNG to JPG Converter",
                description: "Convert PNG images to JPG/JPEG online for free",
                url: "https://devpick.sh/png-to-jpg",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web Browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Does PNG to JPG conversion lose quality?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "JPG uses lossy compression, so some quality may be lost compared to PNG. You can control the quality level (1–100%) when converting. For photos, 80–90% quality is usually indistinguishable from the original.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What happens to PNG transparency when converting to JPG?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "JPG does not support transparency. This converter replaces transparent areas with a white background by default, which you can customize.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is my image uploaded to a server?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. All conversion happens entirely in your browser using the HTML5 Canvas API. Your images never leave your device.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Why is my JPG larger than the PNG?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "For images with large solid-color areas (like screenshots or graphics), PNG's lossless compression is often more efficient. JPG excels at compressing photos with complex gradients. Try lowering the quality slider to reduce file size.",
                    },
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
                  { "@type": "ListItem", position: 2, name: "PNG to JPG", item: "https://devpick.sh/png-to-jpg" },
                ],
              },
            ],
          }),
        }}
      />
      <PngToJpgTool />
    </>
  );
}
