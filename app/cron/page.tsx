import type { Metadata } from "next";
import { CronTool } from "./cron-tool";

export const metadata: Metadata = {
  title: "Cron Expression Generator Online — Build & Explain Cron Jobs",
  description:
    "Build, test, and explain cron expressions visually. Generate cron schedules with a visual editor. See next run times. Free cron generator.",
  openGraph: {
    title: "Cron Expression Generator | devpick.sh",
    description: "Build and explain cron expressions visually.",
    url: "https://devpick.sh/cron",
  },
  alternates: { canonical: "https://devpick.sh/cron" },
};

export default function CronPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Cron Expression Generator",
            description: "Build and explain cron expressions visually",
            url: "https://devpick.sh/cron",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CronTool />
    </>
  );
}
