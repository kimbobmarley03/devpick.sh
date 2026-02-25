import type { Metadata } from "next";
import { JwtTool } from "./jwt-tool";

export const metadata: Metadata = {
  title: "JWT Decoder Online — Decode & Inspect JWT Tokens",
  description:
    "Decode JWT tokens online. View header, payload, and signature. Free JWT decoder and inspector — no data sent to server.",
  openGraph: {
    title: "JWT Decoder Online | devpick.sh",
    description: "Decode and inspect JWT tokens. Free, instant, client-side.",
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
      <JwtTool />
    </>
  );
}
