import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseInline(text: string): string {
  let s = text;
  s = s.replace(/`([^`]+)`/g, (_, code: string) => `<code>${escapeHtml(code)}</code>`);
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/_(.+?)_/g, "<em>$1</em>");
  s = s.replace(/~~(.+?)~~/g, "<del>$1</del>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  return s;
}

function markdownToHtml(md: string): string {
  if (!md.trim()) return "";
  const lines = md.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeContent: string[] = [];
  let inList = false;
  let listType = "";
  let inBlockquote = false;

  const closeList = () => { if (inList) { html.push(`</${listType}>`); inList = false; } };
  const closeBlockquote = () => { if (inBlockquote) { html.push("</blockquote>"); inBlockquote = false; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList(); closeBlockquote();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeContent = [];
      } else {
        inCodeBlock = false;
        const lang = codeLang ? ` class="language-${codeLang}"` : "";
        html.push(`<pre><code${lang}>${escapeHtml(codeContent.join("\n"))}</code></pre>`);
        codeLang = ""; codeContent = [];
      }
      continue;
    }
    if (inCodeBlock) { codeContent.push(line); continue; }

    if (line.trim() === "") {
      closeList(); closeBlockquote();
      html.push("");
      continue;
    }

    if (line.startsWith("#")) {
      closeList(); closeBlockquote();
      const m = line.match(/^(#{1,6})\s+(.*)/);
      if (m) html.push(`<h${m[1].length}>${parseInline(m[2])}</h${m[1].length}>`);
      continue;
    }

    if (line.startsWith("---") || line.startsWith("***") || line.startsWith("___")) {
      closeList(); closeBlockquote();
      html.push("<hr>");
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      if (!inBlockquote) { html.push("<blockquote>"); inBlockquote = true; }
      html.push(`<p>${parseInline(line.slice(2))}</p>`);
      continue;
    } else { closeBlockquote(); }

    if (/^(\*|-|\+) /.test(line)) {
      if (!inList || listType !== "ul") { closeList(); html.push("<ul>"); inList = true; listType = "ul"; }
      html.push(`<li>${parseInline(line.replace(/^(\*|-|\+) /, ""))}</li>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      if (!inList || listType !== "ol") { closeList(); html.push("<ol>"); inList = true; listType = "ol"; }
      html.push(`<li>${parseInline(line.replace(/^\d+\. /, ""))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${parseInline(line)}</p>`);
  }

  if (inCodeBlock) {
    const lang = codeLang ? ` class="language-${codeLang}"` : "";
    html.push(`<pre><code${lang}>${escapeHtml(codeContent.join("\n"))}</code></pre>`);
  }
  closeList();
  closeBlockquote();

  return html.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

export function register(server: McpServer) {
  server.tool(
    "markdown_to_html",
    "Convert Markdown text to HTML",
    {
      markdown: z.string().describe("Markdown text to convert"),
    },
    async ({ markdown }) => {
      try {
        const output = markdownToHtml(markdown);
        return { content: [{ type: "text", text: output }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Failed"}` }],
          isError: true,
        };
      }
    }
  );
}
