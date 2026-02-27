import type { Metadata } from "next";
import { FreelanceRateCalculatorTool } from "./freelance-rate-calculator-tool";

export const metadata: Metadata = {
  title: "Freelance Rate Calculator — Find Your Hourly Rate | devpick.sh",
  description:
    "Calculate your freelance hourly rate based on desired salary, expenses, taxes, and billable hours. Includes industry benchmarks for web developers, designers, copywriters, and consultants.",
  openGraph: {
    title: "Freelance Rate Calculator — Find Your Hourly Rate | devpick.sh",
    description: "Find your ideal freelance rate. Factor in salary, expenses, taxes, and utilization. Free calculator.",
    url: "https://devpick.sh/freelance-rate-calculator",
  },
  alternates: { canonical: "https://devpick.sh/freelance-rate-calculator" },
};

export default function FreelanceRateCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Freelance Rate Calculator",
            description: "Calculate your ideal freelance hourly rate based on income goals and expenses",
            url: "https://devpick.sh/freelance-rate-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <FreelanceRateCalculatorTool />
    </>
  );
}
