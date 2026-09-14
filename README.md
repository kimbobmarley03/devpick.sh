# devpick.sh

> Developer tools that don't suck.

Ultra-minimal, terminal-inspired developer tools collection. Built with Next.js 16, Tailwind CSS v4, and deployed on Cloudflare Pages.

- [Use the browser tools](https://devpick.sh)
- [Audit or generate a monorepo .gitignore](https://devpick.sh/gitignore-generator#gitignore-auditor)
- [Install 43 local tools for AI agents](./mcp-server/README.md)

## Tools

| Tool | Route | Category |
|------|-------|----------|
| JSON Formatter | `/json-formatter` | Format & Validate |
| Base64 | `/base64` | Encode & Decode |
| URL Encoder | `/url-encoder` | Encode & Decode |
| JWT Decoder | `/jwt-decoder` | Encode & Decode |
| Timestamp | `/unix-timestamp-converter` | Convert |
| Hash Generator | `/hash-generator` | Generate |
| UUID Generator | `/uuid-generator` | Generate |
| .gitignore Generator & Auditor | `/gitignore-generator` | Generate & Audit |

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

- Next.js 16 (App Router, static export)
- Tailwind CSS v4
- lucide-react (icons)
- next/font (Inter + JetBrains Mono)
- next-sitemap

## Design

Dark theme, terminal aesthetic, bento grid layout. Tool inputs are processed client-side and are never sent to DevPick. Privacy-safe aggregate analytics measure page and tool outcomes without collecting inputs, filenames, or generated output.
