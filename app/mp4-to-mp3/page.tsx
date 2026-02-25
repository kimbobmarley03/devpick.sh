import type { Metadata } from "next";
import { Mp4ToMp3Tool } from "./mp4-to-mp3-tool";

export const metadata: Metadata = {
  title: "MP4 to MP3 Converter Online — Free Audio Extractor | devpick.sh",
  description:
    "Extract audio from MP4, WebM, MOV and other video files. Download as WebM audio. Free, instant, 100% client-side — your files never leave your browser.",
  openGraph: {
    title: "MP4 to MP3 Converter Online | devpick.sh",
    description: "Extract audio from any video file. Free, no upload, instant.",
    url: "https://devpick.sh/mp4-to-mp3",
  },
  alternates: { canonical: "https://devpick.sh/mp4-to-mp3" },
};

export default function Mp4ToMp3Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MP4 to Audio Converter",
            description: "Extract audio from MP4 and video files client-side",
            url: "https://devpick.sh/mp4-to-mp3",
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
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "MP4 to Audio Converter", item: "https://devpick.sh/mp4-to-mp3" },
            ],
          }),
        }}
      />
      <Mp4ToMp3Tool />
    </>
  );
}
