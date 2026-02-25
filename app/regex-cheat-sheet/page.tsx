import type { Metadata } from "next";
import { RegexCheatSheetTool } from "./regex-cheat-sheet-tool";

export const metadata: Metadata = {
  title: "Regex Cheat Sheet — Complete Reference | devpick.sh",
  description:
    "Complete regex cheat sheet with syntax, examples, and common patterns. Searchable reference for JavaScript, Python, and other regex flavors.",
  openGraph: {
    title: "Regex Cheat Sheet | devpick.sh",
    description: "Complete searchable regex reference with syntax, examples, and patterns.",
    url: "https://devpick.sh/regex-cheat-sheet",
  },
  alternates: { canonical: "https://devpick.sh/regex-cheat-sheet" },
};

export default function RegexCheatSheetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Regex Cheat Sheet",
            description: "Complete regex cheat sheet with syntax, examples, and common patterns",
            url: "https://devpick.sh/regex-cheat-sheet",
          }),
        }}
      />
      <RegexCheatSheetTool />
    </>
  );
}
