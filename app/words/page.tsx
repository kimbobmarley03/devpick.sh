import type { Metadata } from "next";
import { WordsTool } from "./words-tool";

export const metadata: Metadata = {
  title: "Word Counter Online — Count Words, Characters & Reading Time",
  description:
    "Count words, characters, sentences, paragraphs, and lines in real time. Get reading time, speaking time, and keyword density. Free online word counter.",
  openGraph: {
    title: "Word Counter | devpick.sh",
    description: "Real-time word, character, sentence, and paragraph counter with reading time.",
    url: "https://devpick.sh/words",
  },
  alternates: { canonical: "https://devpick.sh/words" },
};

export default function WordsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Word Counter",
            description: "Count words, characters, and sentences online",
            url: "https://devpick.sh/words",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <WordsTool />
    </>
  );
}
