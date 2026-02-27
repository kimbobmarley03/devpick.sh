import type { Metadata } from "next";
import { ImageCompressTool } from "./image-compress-tool";

export const metadata: Metadata = {
  title: "Image Compressor Online — Free, No Upload | devpick.sh",
  description:
    "Compress images and reduce file size without external uploads. Adjust quality slider. Supports PNG, JPG, WebP. 100% client-side.",
  openGraph: {
    title: "Image Compressor | devpick.sh",
    description: "Compress images free online. See before/after file sizes. Runs in browser.",
    url: "https://devpick.sh/image-compress",
  },
  alternates: { canonical: "https://devpick.sh/image-compress" },
};

export default function ImageCompressPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Image Compressor","description":"Compress images online for free using the Canvas API","url":"https://devpick.sh/image-compress","applicationCategory":"DeveloperApplication","operatingSystem":"Web Browser","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"How does browser-based image compression work?","acceptedAnswer":{"@type":"Answer","text":"The tool draws your image on an HTML5 Canvas and re-exports it at a lower quality level. For JPG/WebP, this uses the built-in lossy compression algorithm. For PNG, it re-encodes as a lossless PNG (limited size reduction)."}},{"@type":"Question","name":"What quality level should I use?","acceptedAnswer":{"@type":"Answer","text":"For photos, 70–85% quality is usually indistinguishable from the original while reducing file size by 30–60%. For images with text or sharp edges, use 85–90%."}},{"@type":"Question","name":"Is my image uploaded to a server?","acceptedAnswer":{"@type":"Answer","text":"No. All compression happens in your browser using the HTML5 Canvas API. Your images never leave your device."}}]}),
        }}
      />
      <ImageCompressTool />
    </>
  );
}
