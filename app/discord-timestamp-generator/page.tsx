import type { Metadata } from "next";
import { DiscordTimestampTool } from "./discord-timestamp-tool";

export const metadata: Metadata = {
  title: "Discord Timestamp Generator — All Formats",
  description:
    "Generate all seven Discord timestamp formats for any date and time, with a live preview and copy-ready timestamp tags.",
  openGraph: {
    title: "Discord Timestamp Generator | devpick.sh",
    description: "Generate all Discord timestamp formats with live preview. Free, instant, no sign-up.",
    url: "https://devpick.sh/discord-timestamp-generator",
  },
  alternates: { canonical: "https://devpick.sh/discord-timestamp-generator" },
};

export default function DiscordTimestampPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Discord Timestamp Generator",
            description: "Generate Discord timestamp tags for any date and time",
            url: "https://devpick.sh/discord-timestamp-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <DiscordTimestampTool />
    </>
  );
}
