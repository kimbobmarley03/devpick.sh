import type { Metadata } from "next";
import { WebhookTesterTool } from "./webhook-tester-tool";

const faq = [
  {
    question: "Can I test webhook endpoints without Postman?",
    answer:
      "Yes. This webhook tester runs in your browser, so you can send GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests without installing anything. Note: the target server must allow cross-origin (CORS) requests, or the browser will block the call.",
  },
  {
    question: "Does devpick.sh store my request payloads?",
    answer:
      "No. Requests are built client-side in your browser. devpick.sh does not store your payloads or headers.",
  },
  {
    question: "Can I include custom headers like Authorization?",
    answer:
      "Yes. You can add, toggle, and remove any HTTP headers including Authorization, Content-Type, and custom X- headers.",
  },
  {
    question: "Can I generate cURL commands from my request?",
    answer:
      "Yes. The tool includes a cURL equivalent preview so you can copy your request into terminal workflows quickly.",
  },
];

export const metadata: Metadata = {
  title: "Webhook Tester & HTTP Request Builder — Free Online",
  description:
    "Test webhooks and APIs with a free online HTTP request builder. Send GET/POST/PUT/PATCH/DELETE requests with custom headers, JSON body, and cURL preview.",
  openGraph: {
    title: "Webhook Tester & HTTP Request Builder | devpick.sh",
    description:
      "Build and send HTTP requests with custom headers/body, inspect response status and headers, and copy cURL equivalents.",
    url: "https://devpick.sh/webhook-tester",
  },
  alternates: { canonical: "https://devpick.sh/webhook-tester" },
};

export default function WebhookTesterPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Webhook Tester & HTTP Request Builder",
        description: "Build and send HTTP webhook requests with custom headers and body",
        url: "https://devpick.sh/webhook-tester",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web Browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <WebhookTesterTool />

      {/* Visible FAQ (matches the FAQPage structured data above) */}
      <div className="mt-10 pt-6 border-t border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faq.map((item, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                {item.question}
              </summary>
              <p className="mt-2 text-sm text-text-dimmed pl-4">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
