import type { Metadata } from "next";
import { WebhookTesterTool } from "./webhook-tester-tool";

export const metadata: Metadata = {
  title: "Webhook Request Builder — Free Online | devpick.sh",
  description:
    "Build and send HTTP webhook requests with custom headers, body, and method. Test APIs and webhooks right from your browser. 100% client-side.",
  openGraph: {
    title: "Webhook Request Builder | devpick.sh",
    description: "Build HTTP requests with custom headers, body, and method online.",
    url: "https://devpick.sh/webhook-tester",
  },
  alternates: { canonical: "https://devpick.sh/webhook-tester" },
};

export default function WebhookTesterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Webhook Request Builder",
            description: "Build and send HTTP webhook requests with custom headers and body",
            url: "https://devpick.sh/webhook-tester",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <WebhookTesterTool />
    </>
  );
}
