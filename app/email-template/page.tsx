import type { Metadata } from "next";
import { EmailTemplateTool } from "./email-template-tool";

export const metadata: Metadata = {
  title: "Email Template Builder — Free HTML Email Generator | devpick.sh",
  description: "Build responsive HTML email templates with a visual editor. Add headers, text, buttons, images, and dividers. Export clean inline-styled HTML. Free, no sign-up.",
  openGraph: {
    title: "Email Template Builder | devpick.sh",
    description: "Visual HTML email template builder. Export clean inline-styled HTML.",
    url: "https://devpick.sh/email-template",
  },
  alternates: { canonical: "https://devpick.sh/email-template" },
};

export default function EmailTemplatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Email Template Builder",
            description: "Build responsive HTML email templates with a visual editor",
            url: "https://devpick.sh/email-template",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <EmailTemplateTool />
    </>
  );
}
