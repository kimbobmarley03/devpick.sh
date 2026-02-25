import type { Metadata } from "next";
import { ImageBase64Tool } from "./image-base64-tool";

export const metadata: Metadata = {
  title: "Image to Base64 Encoder Online — Free Tool",
  description:
    "Convert images to Base64 data URIs online. Drag and drop or pick a file. Shows preview, file size, and base64 size. Free, instant, client-side.",
  openGraph: {
    title: "Image to Base64 Encoder | devpick.sh",
    description: "Convert images to Base64 data URIs online. Drag & drop, preview, and copy.",
    url: "https://devpick.sh/image-base64",
  },
  alternates: { canonical: "https://devpick.sh/image-base64" },
};

export default function ImageBase64Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Image to Base64 Encoder",
            description: "Convert images to Base64 data URIs online",
            url: "https://devpick.sh/image-base64",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <ImageBase64Tool />
    </>
  );
}
