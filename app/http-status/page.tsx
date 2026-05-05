import type { Metadata } from "next";
import { HttpStatusTool } from "./http-status-tool";

export const metadata: Metadata = {
  title: "HTTP Status Codes List (200, 301, 404, 500) — Free Online Checker | devpick.sh",
  description:
    "Free HTTP status code checker with the complete 1xx–5xx list. Quickly find meanings for 200, 301, 404, 500, redirects, and server errors with debugging tips.",
  keywords: [
    "http status code checker",
    "http status codes list",
    "what does 404 mean",
    "500 internal server error",
    "http response code reference",
  ],
  openGraph: {
    title: "HTTP Status Codes List (200, 301, 404, 500) | devpick.sh",
    description:
      "Free online HTTP status code checker and full response code reference for 1xx–5xx with practical debugging context.",
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
