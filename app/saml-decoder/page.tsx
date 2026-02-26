import type { Metadata } from "next";
import { SamlDecoderTool } from "./saml-decoder-tool";

export const metadata: Metadata = {
  title: "SAML Decoder — Decode SAML Response Online | devpick.sh",
  description:
    "Decode base64-encoded SAML responses and assertions online. Supports POST binding (base64) and Redirect binding (URL-encoded + deflated). Highlights Issuer, NameID, Conditions, and Attribute assertions. 100% client-side, private.",
  openGraph: {
    title: "SAML Decoder | devpick.sh",
    description: "Decode SAML responses online. Supports base64, URL-encoded, and deflated SAML. Free, private, client-side.",
    url: "https://devpick.sh/saml-decoder",
  },
  alternates: { canonical: "https://devpick.sh/saml-decoder" },
};

export default function SamlDecoderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SAML Decoder",
            description: "Decode base64-encoded SAML responses and assertions online",
            url: "https://devpick.sh/saml-decoder",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SamlDecoderTool />
    </>
  );
}
