import type { Metadata } from "next";
import { JsonFormatter } from "./json-formatter";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator Online (Beautify/Minify) | devpick.sh",
  description:
    "Free JSON formatter, validator, and minifier. Beautify JSON with 2/4-space indent, catch syntax errors instantly, and compress API payloads in your browser.",
  openGraph: {
    title: "JSON Formatter & Validator Online (Beautify/Minify) | devpick.sh",
    description:
      "Beautify, validate, and minify JSON instantly. Fix syntax errors and format API/config JSON without uploading files.",
    url: "https://devpick.sh/json-formatter",
  },
  alternates: {
    canonical: "https://devpick.sh/json-formatter",
  },
};

export default function JsonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"JSON Formatter","description":"Format, validate, and minify JSON online","url":"https://devpick.sh/json-formatter","applicationCategory":"DeveloperApplication","operatingSystem":"Web Browser","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is JSON?","acceptedAnswer":{"@type":"Answer","text":"JSON (JavaScript Object Notation) is a lightweight data format using key-value pairs. It supports strings, numbers, booleans, arrays, objects, and null values."}},{"@type":"Question","name":"How do I validate JSON?","acceptedAnswer":{"@type":"Answer","text":"Paste your JSON into the input box. Invalid JSON turns red and shows an error message. Common issues include missing quotes around keys and trailing commas."}},{"@type":"Question","name":"What is the difference between JSON and XML?","acceptedAnswer":{"@type":"Answer","text":"JSON uses a compact key-value syntax native to JavaScript. XML uses verbose opening and closing tags. JSON is generally faster to parse and easier to read."}}]}),
        }}
      />
      <JsonFormatter />
    </>
  );
}
