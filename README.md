# devpick.sh

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Live](https://img.shields.io/badge/live-devpick.sh-brightgreen)](https://devpick.sh)

> Developer tools that don't suck.

118 free developer tools. Everything runs 100% in your browser — no accounts, no tracking, your input never leaves your machine. Open source under MIT.

- [Use the tools](https://devpick.sh)
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

## Privacy

Tool inputs are processed client-side and are never sent to DevPick. Privacy-safe aggregate analytics measure page and tool outcomes without collecting inputs, filenames, or generated output.

## Contributing

Each tool is a self-contained route under `app/<tool-name>/page.tsx` — copy an existing one as a starting point. PRs welcome: new tools, better UX, bug fixes.

```bash
npm run dev     # start dev server
npm run lint    # eslint
npm run build   # production build (static export to /out)
```

## License

MIT — see [LICENSE](./LICENSE). Fork it, self-host it, use it commercially. If you build something cool with it, a link back is appreciated but not required.
