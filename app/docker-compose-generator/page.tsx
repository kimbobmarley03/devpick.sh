import type { Metadata } from "next";
import { DockerComposeGeneratorTool } from "./docker-compose-generator-tool";

export const metadata: Metadata = {
  title: "Docker Compose Generator — Visual YAML Builder | devpick.sh",
  description:
    "Generate docker-compose.yml files visually. Add services, ports, environment variables, volumes, networks and more. Copy or download valid YAML. 100% client-side, free.",
  openGraph: {
    title: "Docker Compose Generator — Visual YAML Builder | devpick.sh",
    description: "Build docker-compose.yml files visually with multi-service support. Free, instant, no sign-up.",
    url: "https://devpick.sh/docker-compose-generator",
  },
  alternates: { canonical: "https://devpick.sh/docker-compose-generator" },
};

export default function DockerComposeGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Docker Compose Generator",
            description: "Generate docker-compose.yml files visually",
            url: "https://devpick.sh/docker-compose-generator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <DockerComposeGeneratorTool />
    </>
  );
}
