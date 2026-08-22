import type { Metadata } from "next";
import { Home } from "./home-client";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://devpick.sh/",
  },
};

export default function HomePage() {
  return <Home />;
}
