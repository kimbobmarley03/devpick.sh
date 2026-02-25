"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";
import { Search } from "lucide-react";

interface StatusCode {
  code: number;
  name: string;
  description: string;
  category: string;
}

const STATUS_CODES: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body.", category: "1xx Informational" },
  { code: 101, name: "Switching Protocols", description: "The server is switching protocols as requested (e.g., from HTTP to WebSocket).", category: "1xx Informational" },
  { code: 102, name: "Processing", description: "Server has received and is processing the request, but no response is available yet (WebDAV).", category: "1xx Informational" },
  { code: 103, name: "Early Hints", description: "Used to return some response headers before the final HTTP message.", category: "1xx Informational" },
  // 2xx Success
  { code: 200, name: "OK", description: "The request has succeeded.", category: "2xx Success" },
  { code: 201, name: "Created", description: "The request has succeeded and a new resource has been created.", category: "2xx Success" },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed.", category: "2xx Success" },
  { code: 203, name: "Non-Authoritative Information", description: "The returned metadata is from a cached copy or third-party source, not the origin server.", category: "2xx Success" },
  { code: 204, name: "No Content", description: "The server successfully processed the request, but is not returning any content.", category: "2xx Success" },
  { code: 205, name: "Reset Content", description: "The server processed the request and asks the client to reset the document view.", category: "2xx Success" },
  { code: 206, name: "Partial Content", description: "The server is delivering only part of the resource due to a range header sent by the client.", category: "2xx Success" },
  { code: 207, name: "Multi-Status", description: "Multiple status codes might be appropriate (WebDAV). Body contains XML.", category: "2xx Success" },
  { code: 208, name: "Already Reported", description: "The members of a DAV binding have already been enumerated.", category: "2xx Success" },
  { code: 226, name: "IM Used", description: "The server has fulfilled a GET request and the response is a representation of the result of one or more instance-manipulations.", category: "2xx Success" },
  // 3xx Redirection
  { code: 300, name: "Multiple Choices", description: "Multiple options for the resource are available. The user should select one.", category: "3xx Redirection" },
  { code: 301, name: "Moved Permanently", description: "The resource has been permanently moved to a new URL.", category: "3xx Redirection" },
  { code: 302, name: "Found", description: "The resource is temporarily at a different URL.", category: "3xx Redirection" },
  { code: 303, name: "See Other", description: "The response can be found at a different URI using a GET method.", category: "3xx Redirection" },
  { code: 304, name: "Not Modified", description: "The resource has not been modified since the version specified in the request headers.", category: "3xx Redirection" },
  { code: 305, name: "Use Proxy", description: "The requested resource must be accessed through the proxy given in the Location field. (Deprecated)", category: "3xx Redirection" },
  { code: 307, name: "Temporary Redirect", description: "The request should be repeated with another URI, but future requests should still use the original URI.", category: "3xx Redirection" },
  { code: 308, name: "Permanent Redirect", description: "The request and all future requests should be repeated using another URI (method preserved).", category: "3xx Redirection" },
  // 4xx Client Error
  { code: 400, name: "Bad Request", description: "The server could not understand the request due to invalid syntax.", category: "4xx Client Error" },
  { code: 401, name: "Unauthorized", description: "Authentication is required and has failed or has not yet been provided.", category: "4xx Client Error" },
  { code: 402, name: "Payment Required", description: "Reserved for future use. Originally intended for digital payment systems.", category: "4xx Client Error" },
  { code: 403, name: "Forbidden", description: "The client does not have access rights to the content.", category: "4xx Client Error" },
  { code: 404, name: "Not Found", description: "The server could not find the requested resource.", category: "4xx Client Error" },
  { code: 405, name: "Method Not Allowed", description: "The request method is known but has been disabled and cannot be used.", category: "4xx Client Error" },
  { code: 406, name: "Not Acceptable", description: "No content matching the criteria given by the user agent is found.", category: "4xx Client Error" },
  { code: 407, name: "Proxy Authentication Required", description: "Authentication with the proxy is required before the request can proceed.", category: "4xx Client Error" },
  { code: 408, name: "Request Timeout", description: "The server would like to shut down this unused connection.", category: "4xx Client Error" },
  { code: 409, name: "Conflict", description: "The request conflicts with the current state of the server.", category: "4xx Client Error" },
  { code: 410, name: "Gone", description: "The requested content has been permanently deleted from server.", category: "4xx Client Error" },
  { code: 411, name: "Length Required", description: "Server rejected the request because the Content-Length header is not defined.", category: "4xx Client Error" },
  { code: 412, name: "Precondition Failed", description: "The client has indicated preconditions in its headers which the server does not meet.", category: "4xx Client Error" },
  { code: 413, name: "Content Too Large", description: "The request entity is larger than limits defined by server.", category: "4xx Client Error" },
  { code: 414, name: "URI Too Long", description: "The URI requested by the client is longer than the server is willing to interpret.", category: "4xx Client Error" },
  { code: 415, name: "Unsupported Media Type", description: "The media format of the requested data is not supported by the server.", category: "4xx Client Error" },
  { code: 416, name: "Range Not Satisfiable", description: "The range specified by the Range header cannot be fulfilled.", category: "4xx Client Error" },
  { code: 417, name: "Expectation Failed", description: "The expectation given in the Expect request-header field cannot be met by the server.", category: "4xx Client Error" },
  { code: 418, name: "I'm a Teapot", description: "The server refuses to brew coffee because it is, permanently, a teapot. (RFC 2324 April Fool's joke)", category: "4xx Client Error" },
  { code: 421, name: "Misdirected Request", description: "The request was directed at a server that is not able to produce a response.", category: "4xx Client Error" },
  { code: 422, name: "Unprocessable Content", description: "The request was well-formed but was unable to be followed due to semantic errors.", category: "4xx Client Error" },
  { code: 423, name: "Locked", description: "The resource that is being accessed is locked (WebDAV).", category: "4xx Client Error" },
  { code: 424, name: "Failed Dependency", description: "The request failed because it depended on another request which failed (WebDAV).", category: "4xx Client Error" },
  { code: 425, name: "Too Early", description: "The server is unwilling to risk processing a request that might be replayed.", category: "4xx Client Error" },
  { code: 426, name: "Upgrade Required", description: "The server refuses to perform the request using the current protocol but will after a protocol upgrade.", category: "4xx Client Error" },
  { code: 428, name: "Precondition Required", description: "The origin server requires the request to be conditional.", category: "4xx Client Error" },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time (rate limiting).", category: "4xx Client Error" },
  { code: 431, name: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large.", category: "4xx Client Error" },
  { code: 451, name: "Unavailable For Legal Reasons", description: "The user agent requested a resource that cannot legally be provided.", category: "4xx Client Error" },
  // 5xx Server Error
  { code: 500, name: "Internal Server Error", description: "The server has encountered a situation it does not know how to handle.", category: "5xx Server Error" },
  { code: 501, name: "Not Implemented", description: "The request method is not supported by the server and cannot be handled.", category: "5xx Server Error" },
  { code: 502, name: "Bad Gateway", description: "The server got an invalid response while working as a gateway.", category: "5xx Server Error" },
  { code: 503, name: "Service Unavailable", description: "The server is not ready to handle the request — temporarily overloaded or down for maintenance.", category: "5xx Server Error" },
  { code: 504, name: "Gateway Timeout", description: "The server is acting as a gateway and cannot get a response in time.", category: "5xx Server Error" },
  { code: 505, name: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported by the server.", category: "5xx Server Error" },
  { code: 506, name: "Variant Also Negotiates", description: "The server has an internal configuration error.", category: "5xx Server Error" },
  { code: 507, name: "Insufficient Storage", description: "The method could not be performed because the server cannot store the representation needed (WebDAV).", category: "5xx Server Error" },
  { code: 508, name: "Loop Detected", description: "The server detected an infinite loop while processing the request (WebDAV).", category: "5xx Server Error" },
  { code: 510, name: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it.", category: "5xx Server Error" },
  { code: 511, name: "Network Authentication Required", description: "The client needs to authenticate to gain network access.", category: "5xx Server Error" },
];

const CATEGORIES = [
  "1xx Informational",
  "2xx Success",
  "3xx Redirection",
  "4xx Client Error",
  "5xx Server Error",
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "1xx Informational": { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  "2xx Success": { bg: "rgba(34,197,94,0.08)", text: "var(--dp-success)", border: "rgba(34,197,94,0.25)" },
  "3xx Redirection": { bg: "rgba(251,191,36,0.08)", text: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  "4xx Client Error": { bg: "rgba(239,68,68,0.08)", text: "var(--dp-error)", border: "rgba(239,68,68,0.25)" },
  "5xx Server Error": { bg: "rgba(168,85,247,0.08)", text: "#a855f7", border: "rgba(168,85,247,0.3)" },
};

export function HttpStatusTool() {
  useWebMCP({
    name: "lookupHttpStatus",
    description: "Look up HTTP status code meaning",
    inputSchema: {
      type: "object" as const,
      properties: {
      "code": {
            "type": "string",
            "description": "HTTP status code (e.g. 404)"
      }
},
      required: ["code"],
    },
    execute: async (params) => {
      const codes: Record<string,string> = {"200":"OK","201":"Created","204":"No Content","301":"Moved Permanently","302":"Found","304":"Not Modified","400":"Bad Request","401":"Unauthorized","403":"Forbidden","404":"Not Found","405":"Method Not Allowed","409":"Conflict","429":"Too Many Requests","500":"Internal Server Error","502":"Bad Gateway","503":"Service Unavailable"}; const c = params.code as string; return { content: [{ type: "text", text: c + " " + (codes[c] || "Unknown") }] };
    },
  });

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = STATUS_CODES;
    if (activeCategory) list = list.filter((s) => s.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.code.toString().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, StatusCode[]> = {};
    for (const cat of CATEGORIES) {
      const items = filtered.filter((s) => s.category === cat);
      if (items.length > 0) map[cat] = items;
    }
    return map;
  }, [filtered]);

  return (
    <ToolLayout agentReady
      title="HTTP Status Codes"
      description="Complete reference for all HTTP status codes (1xx–5xx) with descriptions"
    >
      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div
          className="flex items-center gap-2 flex-1 min-w-[200px] rounded-lg px-3 py-2"
          style={{
            background: "var(--dp-bg-output)",
            border: "1px solid var(--dp-border)",
          }}
        >
          <Search size={14} style={{ color: "var(--dp-text-dimmed)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, name, or description..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--dp-text-primary)",
              fontSize: "13px",
              width: "100%",
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`tab-btn ${activeCategory === null ? "active" : ""}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`tab-btn ${activeCategory === cat ? "active" : ""}`}
              style={
                activeCategory === cat
                  ? { background: CATEGORY_COLORS[cat].bg, borderColor: CATEGORY_COLORS[cat].border, color: CATEGORY_COLORS[cat].text }
                  : {}
              }
            >
              {cat.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([cat, codes]) => {
          const colors = CATEGORY_COLORS[cat];
          return (
            <div key={cat}>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-md inline-block"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {cat}
              </div>
              <div className="flex flex-col gap-1">
                {codes.map((s) => (
                  <div
                    key={s.code}
                    className="flex items-start gap-4 rounded-lg px-4 py-3 transition-all duration-150"
                    style={{ background: "var(--dp-bg-card)", border: "1px solid var(--dp-border)" }}
                  >
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-[80px]">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {s.code}
                      </span>
                      <CopyButton text={String(s.code)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: "var(--dp-text-primary)" }}
                      >
                        {s.name}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: "var(--dp-text-secondary)" }}>
                        {s.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--dp-text-ghost)" }}>
            <p className="font-mono text-sm">No results for &quot;{query}&quot;</p>
          </div>
        )}
      </div>
      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "IP Lookup", href: "/ip-lookup" },
            { name: "Subnet Calculator", href: "/subnet" },
            { name: "Chmod Calculator", href: "/chmod" },
            { name: "Regex Tester", href: "/regex" },
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
