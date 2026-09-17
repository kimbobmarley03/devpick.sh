import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "out");
const failures = [];
const warnings = [];

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(target);
      return entry.name.endsWith(".html") ? [target] : [];
    }),
  );

  return nested.flat();
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function pageLabel(file) {
  return `/${path.relative(outputRoot, file).replace(/\\/g, "/").replace(/(?:index)?\.html$/, "")}`;
}

for (const file of await findHtmlFiles(outputRoot)) {
  const page = pageLabel(file);
  if (page.includes("404") || page.includes("_not-found")) continue;

  const html = await readFile(file, "utf8");
  const title = decodeHtml(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "");
  const description = decodeHtml(
    html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "",
  );
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] ?? "";
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const breadcrumbCount = jsonLdBlocks.filter((match) => match[1].includes('"BreadcrumbList"')).length;

  if (!title) failures.push(`${page}: missing title`);
  if (/devpick\.sh\s*\|\s*devpick\.sh/i.test(title)) {
    failures.push(`${page}: duplicate site name in title: ${title}`);
  }
  if (title.length > 65) failures.push(`${page}: title is ${title.length} characters: ${title}`);
  if (!description) failures.push(`${page}: missing meta description`);
  if (description.length > 160) {
    failures.push(`${page}: description is ${description.length} characters`);
  }
  if (!canonical.startsWith("https://devpick.sh/")) failures.push(`${page}: missing canonical URL`);
  if (breadcrumbCount > 1) failures.push(`${page}: ${breadcrumbCount} BreadcrumbList blocks`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) warnings.push(`${page}: expected one H1, found ${h1Count}`);
}

if (warnings.length > 0) {
  console.warn(`SEO audit warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

if (failures.length > 0) {
  console.error(`SEO audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exitCode = 1;
} else {
  console.log("SEO audit passed: titles, descriptions, canonicals, and breadcrumbs are healthy.");
}
