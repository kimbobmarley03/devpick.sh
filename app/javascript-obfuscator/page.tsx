import type { Metadata } from "next";
import { JavascriptObfuscatorTool } from "./javascript-obfuscator-tool";

export const metadata: Metadata = {
  title: "JavaScript Obfuscator — Free Online | devpick.sh",
  description:
    "Obfuscate JavaScript code online for free. Renames variables, removes whitespace, and encodes strings. 100% client-side, private.",
  openGraph: {
    title: "JavaScript Obfuscator | devpick.sh",
    description: "Obfuscate JavaScript code online — rename vars, remove whitespace, encode strings.",
    url: "https://devpick.sh/javascript-obfuscator",
  },
  alternates: { canonical: "https://devpick.sh/javascript-obfuscator" },
};

export default function JavascriptObfuscatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JavaScript Obfuscator",
            description: "Obfuscate JavaScript code online for free",
            url: "https://devpick.sh/javascript-obfuscator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <JavascriptObfuscatorTool />
    </>
  );
}
