import type { Metadata } from "next";
import { SqlTool } from "./sql-tool";

export const metadata: Metadata = {
  title: "SQL Formatter & Beautifier Online — Free, No Sign Up | devpick.sh",
  description:
    "Free online SQL formatter and beautifier. Pretty print SQL with clean indentation, uppercase keywords, and minify mode. No sign up, runs locally in your browser.",
  openGraph: {
    title: "SQL Formatter & Beautifier Online — Free, No Sign Up | devpick.sh",
    description:
      "Pretty print, beautify, or minify SQL instantly with a free browser-based SQL formatter.",
    url: "https://devpick.sh/sql-formatter",
  },
  alternates: { canonical: "https://devpick.sh/sql-formatter" },
};

export default function SqlPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "SQL Formatter",
            description: "Format, beautify, or minify SQL queries online",
            url: "https://devpick.sh/sql-formatter",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <SqlTool />
    </>
  );
}
