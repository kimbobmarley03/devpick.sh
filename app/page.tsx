import type { Metadata } from "next";
import { Home } from "./home-client";

export const metadata: Metadata = {
  title: { absolute: "119 Free Developer Tools — MIT Open Source | devpick.sh" },
  description:
    "119 free developer tools for JSON, images, PDFs, encoding, debugging, and more. 100% client-side, zero tracking, no sign-up. MIT open source.",
  alternates: {
    canonical: "https://devpick.sh/",
  },
  openGraph: {
    title: "119 Free Developer Tools — MIT Open Source | devpick.sh",
    description:
      "119 fast, private developer tools for JSON, images, PDFs, encoding, debugging, and more. Open source under MIT.",
    url: "https://devpick.sh/",
  },
  twitter: {
    title: "119 Free Developer Tools — MIT Open Source | devpick.sh",
    description:
      "119 fast, private developer tools for JSON, images, PDFs, encoding, debugging, and more. Open source under MIT.",
  },
};

export default function HomePage() {
  return <Home />;
}
