import type { Metadata } from "next";
import { JsonViewerTool } from "./json-viewer-tool";

export const metadata: Metadata = {
  title: "JSON Viewer Online (Tree + Search + Path Copy) — Free | devpick.sh",
  description:
    "View JSON in a clean tree, search keys/values, and copy JSON paths instantly. Free JSON viewer for large API payloads. No sign up, no upload.",
  keywords: [
    "json viewer",
    "json tree viewer",
    "json explorer",
    "view json online",
    "json path viewer",
    "api json viewer",
  ],
  openGraph: {
    title: "JSON Viewer Online (Tree + Search + Path Copy) | devpick.sh",
    description:
      "Free JSON viewer to explore nested JSON, search keys/values, and copy JSON paths. Private and browser-only.",
    url: "https://devpick.sh/json-viewer",
  },
  alternates: { canonical: "https://devpick.sh/json-viewer" },
};

export default function JsonViewerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"JSON Viewer","description":"Interactive JSON tree viewer with expand/collapse and path copying","url":"https://devpick.sh/json-viewer","applicationCategory":"DeveloperApplication","operatingSystem":"Web Browser","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is a JSON viewer?","acceptedAnswer":{"@type":"Answer","text":"A JSON viewer displays JSON data in a readable tree structure with collapsible nodes, making it easy to explore nested objects and arrays without manually counting braces and brackets."}},{"@type":"Question","name":"How do I copy a JSON path?","acceptedAnswer":{"@type":"Answer","text":"Click on any key name in the tree view to copy its full dot-notation path to your clipboard. For example, clicking on 'name' inside users[0] will copy 'root.users[0].name'."}},{"@type":"Question","name":"Is my JSON data sent to a server?","acceptedAnswer":{"@type":"Answer","text":"No. All processing happens entirely in your browser. Your JSON data is never uploaded or transmitted anywhere."}}]}),
        }}
      />
      <JsonViewerTool />
    </>
  );
}
