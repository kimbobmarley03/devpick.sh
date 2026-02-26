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
            "@graph": [
              {
                "@type": "WebApplication",
                name: "Password Generator",
                description: "Generate strong, secure random passwords online",
                url: "https://devpick.sh/password-generator",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web Browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "How long should a password be?", acceptedAnswer: { "@type": "Answer", text: "Security experts recommend at least 16 characters for important accounts. A 20+ character random password is significantly harder to crack than a 12-character one." } },
                  { "@type": "Question", name: "What makes a strong password?", acceptedAnswer: { "@type": "Answer", text: "A strong password is long, random, and uses uppercase letters, lowercase letters, numbers, and symbols. Avoid dictionary words, names, dates, or predictable patterns." } },
                  { "@type": "Question", name: "Are generated passwords safe?", acceptedAnswer: { "@type": "Answer", text: "Yes. Our generator uses the browser built-in crypto.getRandomValues() API for cryptographically secure randomness. No passwords are transmitted or stored anywhere." } },
                ],
              },
            ],
          }),
        }}
      />
      <PasswordTool />
    </>
  );
}
