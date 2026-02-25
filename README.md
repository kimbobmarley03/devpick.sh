# devpick.sh

> Developer tools that don't suck.

Ultra-minimal, terminal-inspired developer tools collection. Built with Next.js 15, Tailwind CSS v4, deployed on Cloudflare Pages.

## Tools

| Tool | Route | Category |
|------|-------|----------|
| JSON Formatter | `/json` | Format & Validate |
| Base64 | `/base64` | Encode & Decode |
| URL Encoder | `/url` | Encode & Decode |
| JWT Decoder | `/jwt` | Encode & Decode |
| Timestamp | `/timestamp` | Convert |
| Hash Generator | `/hash` | Generate |
| UUID Generator | `/uuid` | Generate |

## Dev

```bash
npm run dev        # start dev server
npm run build      # production build (static export to /out)
```

## Deploy (Cloudflare Pages)

```bash
npm run build
# Upload /out folder to Cloudflare Pages
```

Build output: `./out` (static HTML/CSS/JS)

## Stack

- Next.js 15 (App Router, static export)
- Tailwind CSS v4
- lucide-react (icons)
- next/font (Inter + JetBrains Mono)
- next-sitemap

## Design

Dark theme, terminal aesthetic, bento grid layout. All tools are 100% client-side — no API calls, no data collection.
