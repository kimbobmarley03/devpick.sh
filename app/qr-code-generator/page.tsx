import type { Metadata } from "next";
import { QrTool } from "./qr-tool";

export const metadata: Metadata = {
  title: "QR Code Generator Online — Free QR Code Maker",
  description:
    "Generate QR codes from any text or URL instantly. Choose size, download as PNG. Free online QR code generator.",
  openGraph: {
    title: "QR Code Generator Online | devpick.sh",
    description: "Generate QR codes from text or URLs. Download as PNG.",
    url: "https://devpick.sh/qr-code-generator",
  },
  alternates: { canonical: "https://devpick.sh/qr-code-generator" },
};

export default function QrPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "QR Code Generator",
            description: "Generate QR codes from text or URLs",
            url: "https://devpick.sh/qr-code-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <QrTool />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What is a QR code?", "acceptedAnswer": {"@type": "Answer", "text": "A QR code (Quick Response code) is a 2D barcode that stores data like URLs, text, contact info, and more. It can be scanned by any modern smartphone camera."}}, {"@type": "Question", "name": "Are QR codes free to make?", "acceptedAnswer": {"@type": "Answer", "text": "Yes! Our QR code generator is completely free with no limits. Generate as many QR codes as you need and download them as PNG images."}}, {"@type": "Question", "name": "What data can a QR code store?", "acceptedAnswer": {"@type": "Answer", "text": "QR codes can store up to 4,296 characters including URLs, plain text, email addresses, phone numbers, Wi-Fi credentials, and vCard contacts."}}, {"@type": "Question", "name": "How do I scan a QR code?", "acceptedAnswer": {"@type": "Answer", "text": "Open your phone camera app and point it at the QR code. Most modern iOS and Android phones detect QR codes automatically without a separate app."}}]}),
        }}
      />
    </>
  );
}
