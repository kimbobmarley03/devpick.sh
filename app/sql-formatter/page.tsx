import type { Metadata } from "next";
import { SqlTool } from "./sql-tool";

export const metadata: Metadata = {
  title: "SQL Formatter Online — Beautify & Minify SQL Queries",
  description:
    "Format, beautify, or minify SQL queries online. Free, instant, client-side SQL formatter that capitalizes keywords and adds proper indentation.",
  openGraph: {
    title: "SQL Formatter Online | devpick.sh",
    description: "Format and minify SQL queries online. Free, instant, no server.",
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
