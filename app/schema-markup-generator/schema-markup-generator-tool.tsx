"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

type SchemaType =
  | "Article" | "FAQ" | "LocalBusiness" | "Product" | "Person"
  | "Organization" | "Event" | "HowTo" | "Recipe" | "VideoObject"
  | "BreadcrumbList";

interface Field {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "textarea" | "url";
  multi?: boolean; // comma-separated list
}

const SCHEMA_FIELDS: Record<SchemaType, Field[]> = {
  Article: [
    { key: "headline", label: "Headline", placeholder: "How to Build a Website", required: true },
    { key: "description", label: "Description", placeholder: "A guide to building modern websites", type: "textarea" },
    { key: "author", label: "Author Name", placeholder: "Jane Doe", required: true },
    { key: "datePublished", label: "Date Published", placeholder: "2024-01-15" },
    { key: "dateModified", label: "Date Modified", placeholder: "2024-06-01" },
    { key: "url", label: "Article URL", placeholder: "https://example.com/article", type: "url" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/image.jpg", type: "url" },
    { key: "publisher", label: "Publisher Name", placeholder: "My Blog" },
  ],
  FAQ: [
    { key: "q1", label: "Question 1", placeholder: "What is schema markup?", required: true },
    { key: "a1", label: "Answer 1", placeholder: "Schema markup is structured data…", type: "textarea", required: true },
    { key: "q2", label: "Question 2", placeholder: "How do I add schema markup?" },
    { key: "a2", label: "Answer 2", placeholder: "You can add it via JSON-LD…", type: "textarea" },
    { key: "q3", label: "Question 3", placeholder: "Is schema markup required for SEO?" },
    { key: "a3", label: "Answer 3", placeholder: "No, but it can improve search visibility.", type: "textarea" },
  ],
  LocalBusiness: [
    { key: "name", label: "Business Name", placeholder: "Joe's Pizza", required: true },
    { key: "description", label: "Description", placeholder: "Best pizza in town", type: "textarea" },
    { key: "url", label: "Website URL", placeholder: "https://joespizza.com", type: "url" },
    { key: "telephone", label: "Phone", placeholder: "+1-555-123-4567" },
    { key: "street", label: "Street Address", placeholder: "123 Main St" },
    { key: "city", label: "City", placeholder: "New York" },
    { key: "state", label: "State", placeholder: "NY" },
    { key: "zip", label: "Zip Code", placeholder: "10001" },
    { key: "country", label: "Country", placeholder: "US" },
    { key: "priceRange", label: "Price Range", placeholder: "$$" },
    { key: "openingHours", label: "Opening Hours", placeholder: "Mo-Fr 09:00-17:00" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/logo.jpg", type: "url" },
  ],
  Product: [
    { key: "name", label: "Product Name", placeholder: "Wireless Headphones", required: true },
    { key: "description", label: "Description", placeholder: "Premium noise-canceling headphones", type: "textarea" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/product.jpg", type: "url" },
    { key: "sku", label: "SKU", placeholder: "WH-1000X" },
    { key: "brand", label: "Brand", placeholder: "SoundMax" },
    { key: "price", label: "Price", placeholder: "299.99" },
    { key: "currency", label: "Currency", placeholder: "USD" },
    { key: "availability", label: "Availability", placeholder: "InStock" },
    { key: "url", label: "Product URL", placeholder: "https://example.com/product", type: "url" },
    { key: "ratingValue", label: "Rating (0-5)", placeholder: "4.5" },
    { key: "reviewCount", label: "Review Count", placeholder: "128" },
  ],
  Person: [
    { key: "name", label: "Full Name", placeholder: "Jane Doe", required: true },
    { key: "jobTitle", label: "Job Title", placeholder: "Software Engineer" },
    { key: "url", label: "Website URL", placeholder: "https://janedoe.com", type: "url" },
    { key: "image", label: "Photo URL", placeholder: "https://example.com/photo.jpg", type: "url" },
    { key: "email", label: "Email", placeholder: "jane@example.com" },
    { key: "sameAs", label: "Social Profiles (comma-separated)", placeholder: "https://twitter.com/jane,https://linkedin.com/in/jane", multi: true },
    { key: "description", label: "Bio", placeholder: "Developer and open source contributor", type: "textarea" },
  ],
  Organization: [
    { key: "name", label: "Organization Name", placeholder: "Acme Corp", required: true },
    { key: "url", label: "Website URL", placeholder: "https://acme.com", type: "url" },
    { key: "logo", label: "Logo URL", placeholder: "https://acme.com/logo.png", type: "url" },
    { key: "description", label: "Description", placeholder: "A technology company", type: "textarea" },
    { key: "telephone", label: "Phone", placeholder: "+1-800-555-0000" },
    { key: "email", label: "Email", placeholder: "info@acme.com" },
    { key: "sameAs", label: "Social Profiles (comma-separated)", placeholder: "https://twitter.com/acme", multi: true },
  ],
  Event: [
    { key: "name", label: "Event Name", placeholder: "Tech Conference 2024", required: true },
    { key: "description", label: "Description", placeholder: "Annual tech conference for developers", type: "textarea" },
    { key: "startDate", label: "Start Date", placeholder: "2024-09-15T09:00:00", required: true },
    { key: "endDate", label: "End Date", placeholder: "2024-09-17T18:00:00" },
    { key: "url", label: "Event URL", placeholder: "https://techconf.com", type: "url" },
    { key: "image", label: "Image URL", placeholder: "https://techconf.com/banner.jpg", type: "url" },
    { key: "location", label: "Venue Name", placeholder: "Convention Center" },
    { key: "address", label: "Address", placeholder: "123 Main St, San Francisco, CA" },
    { key: "organizer", label: "Organizer", placeholder: "Tech Events Inc" },
    { key: "price", label: "Ticket Price", placeholder: "99.00" },
    { key: "currency", label: "Currency", placeholder: "USD" },
    { key: "availability", label: "Availability", placeholder: "InStock" },
  ],
  HowTo: [
    { key: "name", label: "Title", placeholder: "How to Make Pasta", required: true },
    { key: "description", label: "Description", placeholder: "A simple guide to making homemade pasta", type: "textarea" },
    { key: "totalTime", label: "Total Time (ISO 8601)", placeholder: "PT30M" },
    { key: "estimatedCost", label: "Estimated Cost", placeholder: "$10" },
    { key: "step1", label: "Step 1", placeholder: "Gather ingredients: flour, eggs, salt", required: true },
    { key: "step2", label: "Step 2", placeholder: "Mix flour and eggs in a bowl" },
    { key: "step3", label: "Step 3", placeholder: "Knead dough for 10 minutes" },
    { key: "step4", label: "Step 4", placeholder: "Roll out and cut into noodles" },
    { key: "step5", label: "Step 5", placeholder: "Boil in salted water for 3-4 minutes" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/pasta.jpg", type: "url" },
  ],
  Recipe: [
    { key: "name", label: "Recipe Name", placeholder: "Classic Chocolate Chip Cookies", required: true },
    { key: "description", label: "Description", placeholder: "Crispy on the outside, chewy inside", type: "textarea" },
    { key: "image", label: "Image URL", placeholder: "https://example.com/cookies.jpg", type: "url" },
    { key: "author", label: "Author", placeholder: "Chef Marie" },
    { key: "prepTime", label: "Prep Time (ISO 8601)", placeholder: "PT15M" },
    { key: "cookTime", label: "Cook Time (ISO 8601)", placeholder: "PT12M" },
    { key: "totalTime", label: "Total Time (ISO 8601)", placeholder: "PT27M" },
    { key: "servings", label: "Servings", placeholder: "24 cookies" },
    { key: "calories", label: "Calories", placeholder: "150" },
    { key: "ingredients", label: "Ingredients (comma-separated)", placeholder: "2 cups flour, 1 cup butter, 1 cup sugar", multi: true },
    { key: "step1", label: "Step 1", placeholder: "Preheat oven to 375°F" },
    { key: "step2", label: "Step 2", placeholder: "Cream butter and sugars" },
    { key: "step3", label: "Step 3", placeholder: "Mix in eggs and vanilla" },
    { key: "keywords", label: "Keywords (comma-separated)", placeholder: "cookies, baking, dessert", multi: true },
  ],
  VideoObject: [
    { key: "name", label: "Video Title", placeholder: "Introduction to TypeScript", required: true },
    { key: "description", label: "Description", placeholder: "Learn TypeScript from scratch", type: "textarea" },
    { key: "thumbnailUrl", label: "Thumbnail URL", placeholder: "https://example.com/thumb.jpg", type: "url" },
    { key: "uploadDate", label: "Upload Date", placeholder: "2024-01-15" },
    { key: "duration", label: "Duration (ISO 8601)", placeholder: "PT15M30S" },
    { key: "contentUrl", label: "Content URL", placeholder: "https://example.com/video.mp4", type: "url" },
    { key: "embedUrl", label: "Embed URL", placeholder: "https://youtube.com/embed/xxx", type: "url" },
    { key: "author", label: "Author/Channel", placeholder: "CodeAcademy" },
    { key: "url", label: "Watch URL", placeholder: "https://youtube.com/watch?v=xxx", type: "url" },
  ],
  BreadcrumbList: [
    { key: "item1", label: "Item 1 Name", placeholder: "Home", required: true },
    { key: "url1", label: "Item 1 URL", placeholder: "https://example.com", type: "url", required: true },
    { key: "item2", label: "Item 2 Name", placeholder: "Blog", required: true },
    { key: "url2", label: "Item 2 URL", placeholder: "https://example.com/blog", type: "url" },
    { key: "item3", label: "Item 3 Name", placeholder: "My Article" },
    { key: "url3", label: "Item 3 URL", placeholder: "https://example.com/blog/article", type: "url" },
    { key: "item4", label: "Item 4 Name", placeholder: "" },
    { key: "url4", label: "Item 4 URL", placeholder: "", type: "url" },
  ],
};

function buildSchema(type: SchemaType, values: Record<string, string>): object {
  const v = (k: string) => values[k]?.trim() ?? "";

  switch (type) {
    case "Article":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: v("headline"),
        description: v("description") || undefined,
        author: v("author") ? { "@type": "Person", name: v("author") } : undefined,
        datePublished: v("datePublished") || undefined,
        dateModified: v("dateModified") || undefined,
        url: v("url") || undefined,
        image: v("image") || undefined,
        publisher: v("publisher") ? { "@type": "Organization", name: v("publisher") } : undefined,
      };
    case "FAQ": {
      const pairs: { q: string; a: string }[] = [];
      for (let i = 1; i <= 5; i++) {
        const q = v(`q${i}`);
        const a = v(`a${i}`);
        if (q && a) pairs.push({ q, a });
      }
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: pairs.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      };
    }
    case "LocalBusiness":
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: v("name"),
        description: v("description") || undefined,
        url: v("url") || undefined,
        telephone: v("telephone") || undefined,
        address: v("street") ? {
          "@type": "PostalAddress",
          streetAddress: v("street"),
          addressLocality: v("city"),
          addressRegion: v("state"),
          postalCode: v("zip"),
          addressCountry: v("country"),
        } : undefined,
        priceRange: v("priceRange") || undefined,
        openingHours: v("openingHours") || undefined,
        image: v("image") || undefined,
      };
    case "Product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: v("name"),
        description: v("description") || undefined,
        image: v("image") || undefined,
        sku: v("sku") || undefined,
        brand: v("brand") ? { "@type": "Brand", name: v("brand") } : undefined,
        offers: v("price") ? {
          "@type": "Offer",
          price: v("price"),
          priceCurrency: v("currency") || "USD",
          availability: v("availability") ? `https://schema.org/${v("availability")}` : undefined,
          url: v("url") || undefined,
        } : undefined,
        aggregateRating: v("ratingValue") ? {
          "@type": "AggregateRating",
          ratingValue: v("ratingValue"),
          reviewCount: v("reviewCount") || undefined,
        } : undefined,
      };
    case "Person":
      return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: v("name"),
        jobTitle: v("jobTitle") || undefined,
        url: v("url") || undefined,
        image: v("image") || undefined,
        email: v("email") || undefined,
        description: v("description") || undefined,
        sameAs: v("sameAs") ? v("sameAs").split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      };
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: v("name"),
        url: v("url") || undefined,
        logo: v("logo") || undefined,
        description: v("description") || undefined,
        telephone: v("telephone") || undefined,
        email: v("email") || undefined,
        sameAs: v("sameAs") ? v("sameAs").split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      };
    case "Event":
      return {
        "@context": "https://schema.org",
        "@type": "Event",
        name: v("name"),
        description: v("description") || undefined,
        startDate: v("startDate"),
        endDate: v("endDate") || undefined,
        url: v("url") || undefined,
        image: v("image") || undefined,
        location: v("location") ? {
          "@type": "Place",
          name: v("location"),
          address: v("address") || undefined,
        } : undefined,
        organizer: v("organizer") ? { "@type": "Organization", name: v("organizer") } : undefined,
        offers: v("price") ? {
          "@type": "Offer",
          price: v("price"),
          priceCurrency: v("currency") || "USD",
          availability: v("availability") ? `https://schema.org/${v("availability")}` : undefined,
        } : undefined,
      };
    case "HowTo": {
      const steps: string[] = [];
      for (let i = 1; i <= 10; i++) { const s = v(`step${i}`); if (s) steps.push(s); }
      return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: v("name"),
        description: v("description") || undefined,
        totalTime: v("totalTime") || undefined,
        estimatedCost: v("estimatedCost") ? { "@type": "MonetaryAmount", value: v("estimatedCost") } : undefined,
        image: v("image") || undefined,
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: s,
        })),
      };
    }
    case "Recipe": {
      const steps: string[] = [];
      for (let i = 1; i <= 10; i++) { const s = v(`step${i}`); if (s) steps.push(s); }
      return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: v("name"),
        description: v("description") || undefined,
        image: v("image") || undefined,
        author: v("author") ? { "@type": "Person", name: v("author") } : undefined,
        prepTime: v("prepTime") || undefined,
        cookTime: v("cookTime") || undefined,
        totalTime: v("totalTime") || undefined,
        recipeYield: v("servings") || undefined,
        nutrition: v("calories") ? { "@type": "NutritionInformation", calories: v("calories") } : undefined,
        recipeIngredient: v("ingredients") ? v("ingredients").split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        recipeInstructions: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: s,
        })),
        keywords: v("keywords") || undefined,
      };
    }
    case "VideoObject":
      return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v("name"),
        description: v("description") || undefined,
        thumbnailUrl: v("thumbnailUrl") || undefined,
        uploadDate: v("uploadDate") || undefined,
        duration: v("duration") || undefined,
        contentUrl: v("contentUrl") || undefined,
        embedUrl: v("embedUrl") || undefined,
        author: v("author") ? { "@type": "Person", name: v("author") } : undefined,
        url: v("url") || undefined,
      };
    case "BreadcrumbList": {
      const items: { name: string; url: string }[] = [];
      for (let i = 1; i <= 6; i++) {
        const n = v(`item${i}`);
        const u = v(`url${i}`);
        if (n) items.push({ name: n, url: u });
      }
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url || undefined,
        })),
      };
    }
  }
}

const SCHEMA_TYPES: SchemaType[] = [
  "Article", "FAQ", "LocalBusiness", "Product", "Person",
  "Organization", "Event", "HowTo", "Recipe", "VideoObject", "BreadcrumbList",
];

// Clean undefined from output
function cleanUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(cleanUndefined).filter((x) => x !== undefined);
  if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(obj)) {
      if (val !== undefined) {
        const cleaned = cleanUndefined(val);
        if (cleaned !== undefined) result[k] = cleaned;
      }
    }
    return result;
  }
  return obj;
}

export function SchemaMarkupGeneratorTool() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [values, setValues] = useState<Record<string, string>>({});

  const fields = SCHEMA_FIELDS[schemaType];
  const schema = buildSchema(schemaType, values);
  const cleaned = cleanUndefined(schema);
  const output = JSON.stringify(cleaned, null, 2);
  const scriptTag = `<script type="application/ld+json">\n${output}\n</script>`;

  const update = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));
  const changeType = (t: SchemaType) => {
    setSchemaType(t);
    setValues({});
  };

  return (
    <ToolLayout
      title="Schema Markup Generator"
      description="Generate JSON-LD structured data for SEO. Pick a schema type, fill in the fields, and copy the script tag."
    >
      {/* Schema type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SCHEMA_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => changeType(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              schemaType === t
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-border-subtle text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">{schemaType} Fields</h2>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {f.label}
                {f.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={values[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 text-sm font-mono border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  rows={3}
                />
              ) : (
                <input
                  type={f.type === "url" ? "url" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 text-sm font-mono border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              )}
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">JSON-LD Output</h2>
            <div className="flex gap-2">
              <CopyButton text={scriptTag} />
            </div>
          </div>
          <div className="output-panel max-h-[70vh] overflow-auto">
            <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-all text-text-primary">
              {`<script type="application/ld+json">\n${output}\n</script>`}
            </pre>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              💡 Paste the script tag inside your HTML <code>&lt;head&gt;</code> section. Test with{" "}
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Rich Results Test
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Robots.txt Generator", href: "/robots-txt" },
            { name: "Meta Tag Generator", href: "/meta-tags" },
            { name: "Open Graph Preview", href: "/og-preview" },
            { name: "JSON Formatter", href: "/json-formatter" },
          ].map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
