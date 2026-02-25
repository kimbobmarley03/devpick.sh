import type { Metadata } from "next";
import { TomlTool } from "./toml-tool";

export const metadata: Metadata = {
  title: "TOML to JSON Converter — Convert TOML to JSON Online",
  description:
    "Convert TOML configuration files to JSON and back. Supports key-value pairs, sections, arrays, strings, numbers, and booleans. Free, client-side.",
  openGraph: {
    title: "TOML to JSON Converter | devpick.sh",
    description: "Convert TOML to JSON and JSON to TOML online. Free, no upload.",
    url: "https://devpick.sh/toml",
  },
  alternates: { canonical: "https://devpick.sh/toml" },
};

export default function TomlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TOML to JSON Converter",
            description: "Convert TOML to JSON and back online",
            url: "https://devpick.sh/toml",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <TomlTool />
    </>
  );
}
