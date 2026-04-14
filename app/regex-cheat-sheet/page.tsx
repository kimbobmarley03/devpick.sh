import type { Metadata } from "next";
import { RegexCheatSheetTool } from "./regex-cheat-sheet-tool";

export const metadata: Metadata = {
  title: "Regex Cheat Sheet & Tester (JS/Python) — Quick Reference | devpick.sh",
  description:
    "Free regex cheat sheet and live tester. Learn regex syntax, quantifiers, lookaheads, and common patterns for JavaScript, Python, and PCRE.",
  openGraph: {
    title: "Regex Cheat Sheet & Tester | devpick.sh",
    description: "Free regex reference with live tester, syntax guides, and copy-ready patterns.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is regex used for?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Regex is used to find, validate, and transform text patterns, such as emails, URLs, dates, IDs, and log lines.",
                },
              },
              {
                "@type": "Question",
                name: "Does this regex tool support live testing?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. The regex cheat sheet includes a built-in live tester so you can try a pattern against sample text instantly in your browser.",
                },
              },
              {
                "@type": "Question",
                name: "Is this regex cheat sheet free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, it is completely free and runs client-side with no signup required.",
                },
              },
            ],
          }),
        }}
      />
      <RegexCheatSheetTool />
    </>
  );
}
