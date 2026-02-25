import type { Metadata } from "next";
import { ImageResizeTool } from "./image-resize-tool";

export const metadata: Metadata = {
  title: "Image Resize Online — Free, No Upload | devpick.sh",
  description:
    "Resize images by exact dimensions or percentage. Supports PNG, JPG, WebP. No upload — runs entirely in your browser with the Canvas API.",
  openGraph: {
    title: "Image Resize Tool | devpick.sh",
    description: "Resize images free online. Runs in browser — no files uploaded.",
    url: "https://devpick.sh/image-resize",
  },
  alternates: { canonical: "https://devpick.sh/image-resize" },
};

export default function ImageResizePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Image Resize Tool",
            description: "Resize images online for free using the Canvas API",
            url: "https://devpick.sh/image-resize",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Does resizing images reduce quality?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Downscaling (making smaller) generally preserves quality well. Upscaling (making larger) uses bilinear interpolation which may look slightly blurry. For best results, always work from the original full-size image.",
                },
              },
              {
                "@type": "Question",
                name: "What image formats can I resize?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "This tool supports any image format your browser can decode: PNG, JPG/JPEG, WebP, GIF (first frame), BMP, and SVG.",
                },
              },
              {
                "@type": "Question",
                name: "Is my image uploaded to a server?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. All resizing happens in your browser using the HTML5 Canvas API. Your images are never uploaded or transmitted anywhere.",
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "Image Resize", item: "https://devpick.sh/image-resize" },
            ],
          }),
        }}
      />
      <ImageResizeTool />
    </>
  );
}
