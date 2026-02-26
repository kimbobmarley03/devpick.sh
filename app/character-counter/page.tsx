import type { Metadata } from "next";
import { CounterTool } from "./counter-tool";

export const metadata: Metadata = {
  title: "Character & Word Counter Online — Free Text Counter Tool",
  description:
    "Count characters, words, sentences, paragraphs, and lines in real time. Includes reading time estimate and character frequency analysis.",
  openGraph: {
    title: "Character & Word Counter Online | devpick.sh",
    description: "Real-time character, word, sentence, and paragraph counter.",
    url: "https://devpick.sh/character-counter",
  },
  alternates: { canonical: "https://devpick.sh/character-counter" },
};

export default function CounterPage() {
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
                name: "Character & Word Counter",
                description: "Count characters, words, and more in real time",
                url: "https://devpick.sh/character-counter",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "Web Browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "How do I count words online?", acceptedAnswer: { "@type": "Answer", text: "Paste your text into the input box and the word count updates instantly. Words are split by whitespace, with consecutive spaces treated as one separator." } },
                  { "@type": "Question", name: "What is a good reading time?", acceptedAnswer: { "@type": "Answer", text: "The average adult reads 200-250 words per minute. Our tool estimates at 200 wpm, so a 1,000-word article takes approximately 5 minutes to read." } },
                  { "@type": "Question", name: "How are characters counted?", acceptedAnswer: { "@type": "Answer", text: "Characters are counted including spaces and punctuation. We also show a count without spaces, which is useful for social media character limits." } },
                ],
              },
            ],
          }),
        }}
      />
      <CounterTool />
    </>
  );
}
