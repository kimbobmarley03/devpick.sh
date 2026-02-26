#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// === PDF Operations (genuine value — Claude can't do these) ===
import { register as registerMergePdfs } from "./tools/merge-pdfs.js";
import { register as registerSplitPdf } from "./tools/split-pdf.js";
import { register as registerPdfInfo } from "./tools/pdf-info.js";
import { register as registerRotatePdf } from "./tools/rotate-pdf.js";
import { register as registerPdfWatermark } from "./tools/pdf-watermark.js";
import { register as registerRemovePdfPages } from "./tools/remove-pdf-pages.js";

// === Computation (LLMs get these wrong) ===
import { register as registerCalculateSubnet } from "./tools/calculate-subnet.js";
import { register as registerTestRegex } from "./tools/test-regex.js";
import { register as registerParseCron } from "./tools/parse-cron.js";
import { register as registerParseJwt } from "./tools/parse-jwt.js";
import { register as registerCalculateChmod } from "./tools/calculate-chmod.js";
import { register as registerJsonDiff } from "./tools/json-diff.js";
import { register as registerTextDiff } from "./tools/text-diff.js";
import { register as registerGenerateHash } from "./tools/generate-hash.js";

// === Format & Validate ===
import { register as registerFormatJson } from "./tools/format-json.js";
import { register as registerFormatSql } from "./tools/format-sql.js";
import { register as registerFormatXml } from "./tools/format-xml.js";
import { register as registerFormatHtml } from "./tools/format-html.js";
import { register as registerFormatCss } from "./tools/format-css.js";
import { register as registerValidateYaml } from "./tools/validate-yaml.js";
import { register as registerValidateToml } from "./tools/validate-toml.js";

// === Encode & Decode ===
import { register as registerEncodeBase64 } from "./tools/encode-base64.js";
import { register as registerDecodeBase64 } from "./tools/decode-base64.js";
import { register as registerEncodeUrl } from "./tools/encode-url.js";
import { register as registerDecodeUrl } from "./tools/decode-url.js";
import { register as registerEncodeHtmlEntities } from "./tools/encode-html-entities.js";
import { register as registerDecodeHtmlEntities } from "./tools/decode-html-entities.js";
import { register as registerEscapeString } from "./tools/escape-string.js";
import { register as registerUnescapeString } from "./tools/unescape-string.js";

// === Convert ===
import { register as registerYamlToJson } from "./tools/yaml-to-json.js";
import { register as registerJsonToYaml } from "./tools/json-to-yaml.js";
import { register as registerCsvToJson } from "./tools/csv-to-json.js";
import { register as registerJsonToCsv } from "./tools/json-to-csv.js";
import { register as registerJsonToTypeScript } from "./tools/json-to-typescript.js";
import { register as registerMarkdownToHtml } from "./tools/markdown-to-html.js";
import { register as registerNumberBaseConvert } from "./tools/number-base-convert.js";
import { register as registerHexToRgb } from "./tools/hex-to-rgb.js";
import { register as registerRgbToHex } from "./tools/rgb-to-hex.js";

// === Generate ===
import { register as registerGenerateUuid } from "./tools/generate-uuid.js";
import { register as registerGenerateLoremIpsum } from "./tools/generate-lorem-ipsum.js";
import { register as registerGenerateSlug } from "./tools/generate-slug.js";
import { register as registerGenerateCronExpression } from "./tools/generate-cron-expression.js";
import { register as registerCountWords } from "./tools/count-words.js";

const server = new McpServer({
  name: "devpick",
  version: "1.0.0",
});

// PDF Operations
registerMergePdfs(server);
registerSplitPdf(server);
registerPdfInfo(server);
registerRotatePdf(server);
registerPdfWatermark(server);
registerRemovePdfPages(server);

// Computation
registerCalculateSubnet(server);
registerTestRegex(server);
registerParseCron(server);
registerParseJwt(server);
registerCalculateChmod(server);
registerJsonDiff(server);
registerTextDiff(server);
registerGenerateHash(server);

// Format & Validate
registerFormatJson(server);
registerFormatSql(server);
registerFormatXml(server);
registerFormatHtml(server);
registerFormatCss(server);
registerValidateYaml(server);
registerValidateToml(server);

// Encode & Decode
registerEncodeBase64(server);
registerDecodeBase64(server);
registerEncodeUrl(server);
registerDecodeUrl(server);
registerEncodeHtmlEntities(server);
registerDecodeHtmlEntities(server);
registerEscapeString(server);
registerUnescapeString(server);

// Convert
registerYamlToJson(server);
registerJsonToYaml(server);
registerCsvToJson(server);
registerJsonToCsv(server);
registerJsonToTypeScript(server);
registerMarkdownToHtml(server);
registerNumberBaseConvert(server);
registerHexToRgb(server);
registerRgbToHex(server);

// Generate
registerGenerateUuid(server);
registerGenerateLoremIpsum(server);
registerGenerateSlug(server);
registerGenerateCronExpression(server);
registerCountWords(server);

const transport = new StdioServerTransport();
await server.connect(transport);
