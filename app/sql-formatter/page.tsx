import type { Metadata } from "next";
import { SqlTool } from "./sql-tool";

export const metadata: Metadata = {
  title: "SQL Formatter Online — Free, No Sign Up | devpick.sh",
  description:
    "Format, beautify, or minify SQL queries online. Free SQL formatter with proper indentation and keyword capitalization. No sign up required, runs locally.",
  openGraph: {
    title: "SQL Formatter Online — Free, No Sign Up | devpick.sh",
    description: "Format, beautify and minify SQL queries. Free, instant, no server.",
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
