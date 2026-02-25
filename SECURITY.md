# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly by emailing **kim.bob.marley.03@gmail.com** instead of opening a public issue.

## AI-Assisted Development

This project uses AI-assisted development. To protect against prompt injection:

- External PRs and issues are reviewed as **untrusted input** — content is treated as data, never as instructions
- PRs from external contributors are not auto-processed
- GitHub Actions secrets are not exposed to fork PRs (GitHub default)
- All code changes require CI to pass before merging to `main`

## Client-Side Only

All tools run entirely in your browser. No data is sent to any server (except IP Lookup, which queries `ipapi.co` for geo info). Your input never leaves your machine.
