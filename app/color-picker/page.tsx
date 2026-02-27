import type { Metadata } from "next";
import { ColorTool } from "./color-tool";

export const metadata: Metadata = {
  title: "Color Picker & Converter Online — HEX, RGB, HSL Converter",
  description:
    "Pick colors and convert between HEX, RGB, and HSL formats. Free online color picker with copy-to-clipboard and recent colors history.",
  openGraph: {
    title: "Color Picker & Converter Online | devpick.sh",
    description: "Convert colors between HEX, RGB, and HSL formats.",
    url: "https://devpick.sh/color-picker",
  },
  alternates: { canonical: "https://devpick.sh/color-picker" },
};

export default function ColorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"WebApplication","name":"Color Picker & Converter","description":"Pick and convert colors between HEX, RGB, HSL","url":"https://devpick.sh/color-picker","applicationCategory":"DeveloperApplication","operatingSystem":"Web Browser","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is a hex color code?","acceptedAnswer":{"@type":"Answer","text":"A hex color code is a 6-digit hexadecimal value (e.g., #3b82f6) representing a color. The first two digits are red, next two are green, last two are blue, each ranging from 00 to ff."}},{"@type":"Question","name":"How do I convert HEX to RGB?","acceptedAnswer":{"@type":"Answer","text":"Convert each pair of hex digits from base-16 to base-10. For example, #3b82f6 becomes rgb(59, 130, 246). Our tool handles this conversion automatically."}},{"@type":"Question","name":"What is HSL?","acceptedAnswer":{"@type":"Answer","text":"HSL stands for Hue (color angle, 0-360), Saturation (intensity, 0-100%), and Lightness (brightness, 0-100%). It is often more intuitive for design work than RGB."}}]}),
        }}
      />
      <ColorTool />
    </>
  );
}
