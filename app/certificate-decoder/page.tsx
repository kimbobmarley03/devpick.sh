import type { Metadata } from "next";
import { CertificateDecoderTool } from "./certificate-decoder-tool";

export const metadata: Metadata = {
  title: "Certificate Decoder & CSR Decoder — Free Online | devpick.sh",
  description:
    "Decode X.509 PEM certificates and CSRs online. Parses Subject, Issuer, SANs, validity dates, key usage, extensions, and SHA-256 fingerprint. 100% client-side, private, no data sent.",
  openGraph: {
    title: "Certificate Decoder & CSR Decoder | devpick.sh",
    description: "Decode PEM certificates and CSRs online. Parses all fields including SANs, key usage, and extensions. Free, private.",
    url: "https://devpick.sh/certificate-decoder",
  },
  alternates: { canonical: "https://devpick.sh/certificate-decoder" },
};

export default function CertificateDecoderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Certificate Decoder",
            description: "Decode X.509 PEM certificates and CSRs online",
            url: "https://devpick.sh/certificate-decoder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <CertificateDecoderTool />
    </>
  );
}
