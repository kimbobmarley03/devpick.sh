import type { Metadata } from "next";
import { Home } from "./home-client";

export const metadata: Metadata = {
  title: { absolute: "Free Developer Tools — JSON, PDF & Images | devpick.sh" },
  description:
    "Use 118+ free developer tools for JSON, images, PDFs, encoding, debugging, and more. Fast, private, client-side, and no sign-up required.",
  alternates: {
    canonical: "https://devpick.sh/",
  },
  openGraph: {
    title: "Free Developer Tools — JSON, PDF & Images | devpick.sh",
    description:
      "Use 118+ fast, private developer tools for JSON, images, PDFs, encoding, debugging, and more.",
    url: "https://devpick.sh/",
  },
  twitter: {
    title: "Free Developer Tools — JSON, PDF & Images | devpick.sh",
    description:
      "Use 118+ fast, private developer tools for JSON, images, PDFs, encoding, debugging, and more.",
  },
};

export default function HomePage() {
  return <Home />;
}
