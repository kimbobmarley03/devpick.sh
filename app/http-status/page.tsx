import type { Metadata } from "next";
import { HttpStatusTool } from "./http-status-tool";

export const metadata: Metadata = {
  title: "HTTP Status Codes Reference — Complete List",
  description:
    "Complete reference for all HTTP status codes (1xx–5xx). Search and filter by category: Informational, Success, Redirection, Client Error, Server Error.",
  openGraph: {
    title: "HTTP Status Codes Reference | devpick.sh",
    description: "Complete list of HTTP status codes with descriptions. Free, instant, searchable.",
    url: "https://devpick.sh/http-status",
  },
  alternates: { canonical: "https://devpick.sh/http-status" },
};

export default function HttpStatusPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "HTTP Status Codes Reference",
            description: "Complete reference for all HTTP status codes (1xx–5xx)",
            url: "https://devpick.sh/http-status",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HttpStatusTool />
    </>
  );
}
