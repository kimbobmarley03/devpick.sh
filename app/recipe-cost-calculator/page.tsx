import type { Metadata } from "next";
import { RecipeCostCalculatorTool } from "./recipe-cost-calculator-tool";

export const metadata: Metadata = {
  title: "Recipe Cost Calculator — Price Per Serving Calculator | devpick.sh",
  description:
    "Calculate the exact cost of any recipe per serving. Add ingredients with quantities and prices, get a full cost breakdown. Save recipes to compare costs. Free, no sign-up.",
  openGraph: {
    title: "Recipe Cost Calculator — Price Per Serving Calculator | devpick.sh",
    description: "Calculate recipe costs and cost-per-serving. Add ingredients, get a full cost breakdown instantly.",
    url: "https://devpick.sh/recipe-cost-calculator",
  },
  alternates: { canonical: "https://devpick.sh/recipe-cost-calculator" },
};

export default function RecipeCostCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Recipe Cost Calculator",
            description: "Calculate the cost of any recipe per serving with ingredient-level breakdown",
            url: "https://devpick.sh/recipe-cost-calculator",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <RecipeCostCalculatorTool />
    </>
  );
}
