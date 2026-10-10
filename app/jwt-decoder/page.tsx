import type { Metadata } from "next";
import { JwtTool } from "./jwt-tool";

export const metadata: Metadata = {
  title: "JWT Decoder — Decode & Inspect JWT Tokens Online",
  description:
    "Free JWT decoder to inspect token header, payload claims (sub, iat, exp), and signature. Decode JWTs instantly in your browser with no upload.",
  openGraph: {
    title: "JWT Decoder — Decode & Inspect JWTs Online | devpick.sh",
    description:
      "Decode JWT tokens client-side, check expiration, and inspect claims without sending data to a server.",
    url: "https://devpick.sh/jwt-decoder",
  },
  alternates: { canonical: "https://devpick.sh/jwt-decoder" },
};

export default function JwtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JWT Decoder",
            description: "Decode and inspect JWT tokens online",
            url: "https://devpick.sh/jwt-decoder",
            applicationCategory: "DeveloperApplication",
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
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Does this JWT decoder verify token signatures?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. This tool decodes JWT parts in the browser and shows claims. Signature verification requires the signing secret or public key.",
                },
              },
              {
                "@type": "Question",
                name: "Is my JWT token sent to a server?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Decoding runs client-side in your browser, so your token is not uploaded by this tool.",
                },
              },
              {
                "@type": "Question",
                name: "How do I check if a JWT is expired?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Look at the exp claim in the payload. This decoder compares exp to current time and shows whether the token is expired.",
                },
              },
            ],
          }),
        }}
      />
      <JwtTool />
    </>
  );
}
