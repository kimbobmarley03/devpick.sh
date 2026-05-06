import type { Metadata } from "next";
import { PasswordTool } from "./password-tool";

export const metadata: Metadata = {
  title: "Password Generator Online — Free, Strong, No Sign Up | devpick.sh",
  description:
    "Generate strong, secure random passwords online. Customize length and characters. Free, secure, runs locally in your browser — no sign up needed.",
  openGraph: {
    title: "Password Generator Online — Free, No Sign Up | devpick.sh",
    description: "Generate strong, secure passwords instantly. Customizable, free, client-side.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long should a generated password be?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use at least 16 characters for important accounts. For admin, developer, or financial accounts, 20 or more random characters is safer.",
                },
              },
              {
                "@type": "Question",
                name: "Is this password generator secure?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Passwords are generated locally in your browser with crypto.getRandomValues(), and the generated passwords are not uploaded or stored.",
                },
              },
              {
                "@type": "Question",
                name: "What characters should a strong password include?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A strong random password should use a mix of uppercase letters, lowercase letters, numbers, and symbols, unless a website has specific character restrictions.",
                },
              },
              {
                "@type": "Question",
                name: "Should I reuse generated passwords?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Generate a unique password for every website or app and save it in a password manager to reduce damage if one account is breached.",
                },
              },
            ],
          }),
        }}
      />
      <PasswordTool />
    </>
  );
}
