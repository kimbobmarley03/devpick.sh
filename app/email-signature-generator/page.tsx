import type { Metadata } from "next";
import { EmailSignatureGeneratorTool } from "./email-signature-generator-tool";

export const metadata: Metadata = {
  title: "Email Signature Generator — Free HTML Signatures | devpick.sh",
  description:
    "Create professional HTML email signatures for Gmail, Outlook, and Apple Mail. Choose from multiple templates, add social links, and copy HTML or rich text instantly.",
  openGraph: {
    title: "Email Signature Generator — Free HTML Signatures | devpick.sh",
    description: "Build beautiful HTML email signatures with live preview. Copy as HTML or rich text for Gmail, Outlook, and more.",
    url: "https://devpick.sh/email-signature-generator",
  },
  alternates: { canonical: "https://devpick.sh/email-signature-generator" },
};

export default function EmailSignatureGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Email Signature Generator",
            description: "Generate professional HTML email signatures for Gmail and Outlook",
            url: "https://devpick.sh/email-signature-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <EmailSignatureGeneratorTool />
    </>
  );
}
