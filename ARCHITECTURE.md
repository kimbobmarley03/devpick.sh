# devpick.sh — Architecture & Patterns

> Reference doc for building new tools. Every tool MUST follow these patterns.

## Stack
- **Framework:** Next.js 16 (App Router, static export)
- **Styling:** Tailwind CSS v4 + CSS custom properties (`var(--dp-*)`)
- **Hosting:** Cloudflare Pages (Wrangler CLI deploy)
- **Domain:** devpick.sh
- **Repo:** github.com/kimbobmarley03/devpick.sh

## Hard Rules
1. **NO npm dependencies** — browser-native APIs only
2. **100% client-side** — no server-side processing (exception: IP Lookup uses external API)
3. **All colors via design tokens** — never hardcode colors, always use `var(--dp-*)` from `globals.css`
4. **Light + dark mode** — theme persists via `localStorage("theme")` + inline script in `layout.tsx`

---

## File Structure Per Tool

Every tool has exactly 2 files:

```
app/{tool-slug}/
├── page.tsx          # Server component: Metadata + JSON-LD + renders tool
└── {tool-slug}-tool.tsx  # Client component: "use client", actual tool UI
```

### page.tsx Template

```tsx
import type { Metadata } from "next";
import { MyTool } from "./my-tool";

export const metadata: Metadata = {
  title: "Tool Name Online — Free Tool | devpick.sh",  // 50-60 chars, keyword-first
  description: "Action verb + what it does + 'Free, instant, client-side.' 150-160 chars max.",
  openGraph: {
    title: "Tool Name Online | devpick.sh",
    description: "Short OG description.",
    url: "https://devpick.sh/{slug}",
  },
  alternates: { canonical: "https://devpick.sh/{slug}" },
};

export default function MyToolPage() {
  return (
    <>
      {/* JSON-LD: WebApplication schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Tool Name",
            description: "What it does",
            url: "https://devpick.sh/{slug}",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web Browser",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: "Tool Name", item: "https://devpick.sh/{slug}" },
            ],
          }),
        }}
      />
      {/* FAQPage schema (if tool has FAQ section) */}
      <MyTool />
    </>
  );
}
```

### Tool Component Template

```tsx
"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { CopyButton } from "@/components/copy-button";

export function MyTool() {
  const [input, setInput] = useState("");

  return (
    <ToolLayout
      title="Tool Name"
      description="Brief description of what it does"
      kbdHint="⌘↵ action"  // optional keyboard shortcut hint
    >
      {/* Tool UI goes here */}
      {/* Use SplitPane for input/output layouts */}
      {/* Use CopyButton for copy-to-clipboard */}
      
      {/* Related Tools section (REQUIRED for SEO internal linking) */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Related Tool 1", href: "/tool-1" },
            { name: "Related Tool 2", href: "/tool-2" },
            { name: "Related Tool 3", href: "/tool-3" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
```

---

## Shared Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `ToolLayout` | `@/components/tool-layout` | Page wrapper: nav, header (h1), footer, ThemeToggle |
| `SplitPane` | `@/components/split-pane` | Side-by-side input/output panels |
| `CopyButton` | `@/components/copy-button` | Copy-to-clipboard button with feedback animation |
| `ThemeToggle` | `@/components/theme-toggle` | Light/dark/system theme cycler (auto-included in ToolLayout) |

## Registering a New Tool

After creating the tool files, update these:

### 1. `lib/tools.ts` — Add to `tools` array
```ts
{
  id: "my-tool",
  name: "My Tool",
  description: "What it does in one line",
  route: "/my-tool",
  category: "GENERATE",  // one of: FORMAT & VALIDATE, ENCODE & DECODE, CONVERT, GENERATE, NETWORK, COMPARE, TEST & DEBUG
  size: "standard",      // standard | medium | featured
  icon: "Braces",        // Lucide icon name (must exist in iconMap)
  volume: 10000,         // Monthly search volume (from Semrush)
  cpc: 1.50,             // CPC in USD
  trend: "up" as const,  // "up" | "down" | "flat"
}
```

### 2. Icon imports (if using a new Lucide icon)
Add to BOTH:
- `components/globe-layout.tsx` — import + iconMap
- `components/tool-sidebar.tsx` — import + iconMap

### 3. Verify
```bash
npm run build  # Must pass with 0 errors
```

---

## Design Tokens

All colors use CSS custom properties defined in `app/globals.css`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--dp-bg` | #f5f5f5 | #0a0a0a | Page background |
| `--dp-bg-card` | #ffffff | #141414 | Card/panel background |
| `--dp-bg-output` | #f0f0f0 | #0f0f0f | Output/readonly areas |
| `--dp-bg-subtle` | #ebebeb | #1a1a1a | Subtle backgrounds |
| `--dp-text-primary` | #111111 | #f2f2f2 | Main text |
| `--dp-text-secondary` | #555555 | #d0d0d0 | Secondary text |
| `--dp-text-dimmed` | #777777 | #aaaaaa | Dimmed labels |
| `--dp-text-muted` | #999999 | #888888 | Muted/placeholder |
| `--dp-accent` | #3b82f6 | #3b82f6 | Links, active states |
| `--dp-border` | #e0e0e0 | #222222 | Borders |
| `--dp-error` | #ef4444 | #ef4444 | Errors |
| `--dp-success` | #22c55e | #22c55e | Success states |

**CSS classes for common patterns:**
- `.tool-textarea` — styled textarea for input/output
- `.action-btn` — action button (primary style)
- `.action-btn.secondary` — secondary action button
- `.tab-btn` / `.tab-btn.active` — tab selector buttons
- `.card-terminal` — card with terminal-window styling
- `.kbd` — keyboard shortcut badge

---

## SEO Checklist Per Tool

Every tool page MUST have:

- [ ] **Metadata** with unique title (50-60 chars, keyword-first) + description (150-160 chars)
- [ ] **openGraph** title + description + url
- [ ] **canonical** URL via `alternates`
- [ ] **JSON-LD WebApplication** schema
- [ ] **JSON-LD BreadcrumbList** schema
- [ ] **`<h1>`** via ToolLayout title prop
- [ ] **Related Tools** section with 3-4 internal links
- [ ] **Alt tags** on any `<img>` elements
- [ ] **FAQ section** (for top 10+ tools by volume — with FAQPage schema)

### FAQ Section Pattern (for high-traffic tools)
```tsx
{/* FAQ Section */}
<div className="mt-10 pt-6 border-t border-border-subtle">
  <h2 className="text-lg font-semibold text-text-primary mb-4">Frequently Asked Questions</h2>
  <div className="space-y-4">
    {[
      { q: "What is X?", a: "X is..." },
      { q: "How do I use X?", a: "Simply paste..." },
    ].map((faq, i) => (
      <details key={i} className="group">
        <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
          {faq.q}
        </summary>
        <p className="mt-2 text-sm text-text-dimmed pl-4">{faq.a}</p>
      </details>
    ))}
  </div>
</div>
```

Add matching FAQPage schema in page.tsx when using this pattern.

---

## Deployment

```bash
# Build
npm run build

# Deploy (uses Wrangler CLI)
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_DEVPICK_API_KEY wrangler pages deploy out --project-name=devpick-sh --commit-dirty=true
```

## Git

- **Author:** Bob Kim <kim.bob.marley.03@gmail.com>
- **Branch:** main (direct push OK for now)
- **Pre-push hook:** `.githooks/pre-push` runs lint + build
- **CI:** GitHub Actions on push

---

## Globe & Treemap Behavior

- **Globe:** Only shows tools with `volume >= 3000`. Smaller tools appear in sidebar only.
- **Treemap:** Shows all tools, sized by volume. Trend arrows (▲/▼/—) next to volume numbers.
- **Sidebar:** Shows ALL tools, grouped by category, with volume numbers.
- Cards use `trend` field: `"up"` = green ▲, `"down"` = red ▼, `"flat"` = gray —
