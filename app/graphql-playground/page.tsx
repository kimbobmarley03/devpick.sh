import type { Metadata } from "next";
import { GraphqlPlaygroundTool } from "./graphql-playground-tool";

export const metadata: Metadata = {
  title: "GraphQL Playground Online — Query Editor & Tester",
  description:
    "Test GraphQL APIs in your browser. Write queries and mutations, add variables and headers, then inspect formatted JSON responses with no sign-up.",
  openGraph: {
    title: "GraphQL Playground Online | devpick.sh",
    description: "Execute GraphQL queries and mutations from your browser. Variables, headers, and formatted JSON output.",
    url: "https://devpick.sh/graphql-playground",
  },
  alternates: { canonical: "https://devpick.sh/graphql-playground" },
};

export default function GraphqlPlaygroundPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "GraphQL Playground",
            description: "Online GraphQL query editor and API tester",
            url: "https://devpick.sh/graphql-playground",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <GraphqlPlaygroundTool />
    </>
  );
}
