import type { Metadata } from "next";
import { InvoiceTool } from "./invoice-tool";

export const metadata: Metadata = {
  title: "Invoice Generator Online — Free Invoice Maker | devpick.sh",
  description:
    "Create professional invoices with logo, line items, tax, and notes. Live preview and download as PDF. Free, instant, 100% client-side — no data stored.",
  openGraph: {
    title: "Invoice Generator Online | devpick.sh",
    description: "Create professional invoices and download as PDF. Free, no account needed.",
    url: "https://devpick.sh/invoice-generator",
  },
  alternates: { canonical: "https://devpick.sh/invoice-generator" },
};

export default function InvoicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Invoice Generator",
            description: "Create professional invoices and download as PDF",
            url: "https://devpick.sh/invoice-generator",
            applicationCategory: "BusinessApplication",
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
              { "@type": "ListItem", position: 2, name: "Invoice Generator", item: "https://devpick.sh/invoice-generator" },
            ],
          }),
        }}
      />
      <InvoiceTool />
    </>
  );
}
