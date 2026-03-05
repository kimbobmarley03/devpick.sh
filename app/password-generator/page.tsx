import type { Metadata } from "next";
import { PasswordTool } from "./password-tool";

export const metadata: Metadata = {
  title: "Password Generator Online — Secure Random Passwords",
  description:
    "Generate strong, secure random passwords online. Customize length, character sets, and generate multiple passwords at once. Uses crypto.getRandomValues().",
  openGraph: {
    title: "Password Generator Online | devpick.sh",
    description: "Generate strong, secure random passwords. Customizable length and character sets. Free.",
    url: "https://devpick.sh/password-generator",
  },
  alternates: { canonical: "https://devpick.sh/password-generator" },
};

export default function PasswordPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Password Generator",
            description: "Generate strong, secure random passwords online",
            url: "https://devpick.sh/password-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <PasswordTool />
    </>
  );
}
