import type { Metadata } from "next";
import { TimestampTool } from "./timestamp-tool";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter & Epoch Converter — Free Online | devpick.sh",
  description:
    "Convert Unix/epoch timestamps to human-readable dates and back. Epoch converter with live current time display. Free, instant, no sign-up.",
  openGraph: {
    title: "Unix Timestamp & Epoch Converter | devpick.sh",
    description: "Convert Unix/epoch timestamps to dates. Live epoch time converter.",
    url: "https://devpick.sh/unix-timestamp-converter",
  },
  alternates: { canonical: "https://devpick.sh/unix-timestamp-converter" },
};

export default function TimestampPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Unix Timestamp Converter",
            description: "Convert Unix timestamps to human-readable dates",
            url: "https://devpick.sh/unix-timestamp-converter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <TimestampTool />
    </>
  );
}
