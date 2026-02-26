# @devpick/mcp-server

**Developer tools for AI agents.** Merge PDFs, calculate subnets, test regex, diff JSON — things your AI agent can't do alone.

> 43 tools • 100% local • No API keys • Works offline

From [devpick.sh](https://devpick.sh) — developer tools that don't suck.

---

## Install

### Claude Code
```bash
claude mcp add devpick -- npx -y @devpick/mcp-server
```

### Cursor
Add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "devpick": {
      "command": "npx",
      "args": ["-y", "@devpick/mcp-server"]
    }
  }
}
```

### VS Code (Copilot)
Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "devpick": {
      "command": "npx",
      "args": ["-y", "@devpick/mcp-server"]
    }
  }
}
```

### Codex
```bash
codex mcp add devpick -- npx -y @devpick/mcp-server
```

---

## Tools

### 📄 PDF Operations
Your AI agent can't manipulate PDF files. Now it can.

| Tool | Description |
|------|-------------|
| `merge_pdfs` | Merge multiple PDFs into one |
| `split_pdf` | Extract specific pages from a PDF |
| `pdf_info` | Get page count, metadata, dimensions |
| `rotate_pdf` | Rotate pages by 90°, 180°, or 270° |
| `pdf_watermark` | Add text watermark to every page |
| `remove_pdf_pages` | Remove specific pages from a PDF |

### 🧮 Computation
Things LLMs get wrong — subnet math, regex execution, cron scheduling.

| Tool | Description |
|------|-------------|
| `calculate_subnet` | CIDR subnet calculator (network, broadcast, hosts) |
| `test_regex` | Execute regex against test strings with match details |
| `parse_cron` | Parse cron expression and show next N execution times |
| `parse_jwt` | Decode JWT header + payload |
| `calculate_chmod` | Unix permission octal ↔ symbolic conversion |
| `json_diff` | Structural diff between two JSON objects |
| `text_diff` | Line-by-line text comparison |
| `generate_hash` | MD5, SHA-1, SHA-256, SHA-512 hashing |

### ✨ Format & Validate
| Tool | Description |
|------|-------------|
| `format_json` | Prettify or minify JSON |
| `format_sql` | Beautify SQL queries |
| `format_xml` | Format XML documents |
| `format_html` | Beautify HTML |
| `format_css` | Format CSS |
| `validate_yaml` | Validate YAML syntax |
| `validate_toml` | Validate TOML syntax |

### 🔐 Encode & Decode
| Tool | Description |
|------|-------------|
| `encode_base64` / `decode_base64` | Base64 encoding/decoding |
| `encode_url` / `decode_url` | URL encoding/decoding |
| `encode_html_entities` / `decode_html_entities` | HTML entity encoding |
| `escape_string` / `unescape_string` | String escape sequences |

### 🔄 Convert
| Tool | Description |
|------|-------------|
| `yaml_to_json` / `json_to_yaml` | YAML ↔ JSON |
| `csv_to_json` / `json_to_csv` | CSV ↔ JSON |
| `json_to_typescript` | Generate TypeScript interfaces from JSON |
| `markdown_to_html` | Convert Markdown to HTML |
| `number_base_convert` | Convert between binary, octal, decimal, hex |
| `hex_to_rgb` / `rgb_to_hex` | Color format conversion |

### 🔧 Generate
| Tool | Description |
|------|-------------|
| `generate_uuid` | Generate UUID v4 |
| `generate_lorem_ipsum` | Generate placeholder text |
| `generate_slug` | URL-friendly slug from text |
| `generate_cron_expression` | Build cron expressions from description |
| `count_words` | Word, character, sentence, paragraph count |

---

## Why?

Your AI coding agent can format JSON. It can encode Base64. But it **can't**:
- Merge your PDF files
- Calculate exact subnet boundaries without guessing
- Execute a regex against 50 test strings and report matches
- Diff two large JSON objects structurally

This MCP server gives your agent real tools for real work. Everything runs locally on your machine — no API keys, no network calls, no rate limits.

---

## License

MIT — [devpick.sh](https://devpick.sh)
