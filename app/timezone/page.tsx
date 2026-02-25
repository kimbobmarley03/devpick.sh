import type { Metadata } from "next";
import { TimezoneTool } from "./timezone-tool";

export const metadata: Metadata = {
  title: "Timezone Converter Online — Free Time Zone Converter",
  description:
    "Convert time between timezones instantly. Support for all IANA timezones including UTC, EST, PST, JST, KST, CET, IST. Free, client-side timezone converter.",
  openGraph: {
    title: "Timezone Converter Online | devpick.sh",
    description: "Convert time between timezones. All IANA timezones supported.",
    url: "https://devpick.sh/timezone",
  },
  alternates: { canonical: "https://devpick.sh/timezone" },
};

export default function TimezonePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Timezone Converter",
            description: "Convert time between timezones online",
            url: "https://devpick.sh/timezone",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <TimezoneTool />
    </>
  );
}
