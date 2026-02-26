import type { Metadata } from "next";
import { MarkdownEditorTool } from "./markdown-editor-tool";

export const metadata: Metadata = {
  title: "Markdown Editor Online — Live Preview | devpick.sh",
  description:
    "Free online Markdown editor with live split-pane preview. Formatting toolbar, export as .md file, copy as HTML. 100% client-side, no sign-up, works offline.",
  openGraph: {
    title: "Markdown Editor Online | devpick.sh",
    description: "Live Markdown editor with split-pane preview, toolbar, and export. Free, private, client-side.",
    url: "https://devpick.sh/markdown-editor",
  },
  alternates: { canonical: "https://devpick.sh/markdown-editor" },
};

export default function MarkdownEditorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Markdown Editor Online",
            description: "Free online Markdown editor with live preview",
            url: "https://devpick.sh/markdown-editor",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <MarkdownEditorTool />
    </>
  );
}
