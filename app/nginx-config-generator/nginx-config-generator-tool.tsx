"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { CopyButton } from "@/components/copy-button";

function generateNginxConfig(cfg: {
  serverName: string;
  port: string;
  rootDir: string;
  indexFiles: string;
  ssl: boolean;
  sslCert: string;
  sslKey: string;
  reverseProxy: boolean;
  proxyPass: string;
  gzip: boolean;
  staticCaching: boolean;
  cacheMaxAge: string;
  cors: boolean;
  rateLimit: boolean;
  accessLog: string;
  errorLog: string;
}): string {
  const lines: string[] = [];
  const ind = "    ";

  if (cfg.rateLimit) {
    lines.push("# Rate limiting zone");
    lines.push(`limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;`);
    lines.push("");
  }

  if (cfg.gzip) {
    lines.push("# Gzip compression");
    lines.push("gzip on;");
    lines.push("gzip_vary on;");
    lines.push("gzip_min_length 1024;");
    lines.push("gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;");
    lines.push("");
  }

  // HTTP server block (redirect to HTTPS if SSL enabled)
  if (cfg.ssl) {
    lines.push("server {");
    lines.push(`${ind}listen 80;`);
    lines.push(`${ind}server_name ${cfg.serverName || "example.com"};`);
    lines.push(`${ind}return 301 https://$host$request_uri;`);
    lines.push("}");
    lines.push("");
  }

  lines.push("server {");

  if (cfg.ssl) {
    lines.push(`${ind}listen 443 ssl http2;`);
  } else {
    lines.push(`${ind}listen ${cfg.port || "80"};`);
  }

  lines.push(`${ind}server_name ${cfg.serverName || "example.com"};`);
  lines.push("");

  if (cfg.ssl) {
    lines.push(`${ind}# SSL Configuration`);
    lines.push(`${ind}ssl_certificate ${cfg.sslCert || "/etc/ssl/certs/example.crt"};`);
    lines.push(`${ind}ssl_certificate_key ${cfg.sslKey || "/etc/ssl/private/example.key"};`);
    lines.push(`${ind}ssl_protocols TLSv1.2 TLSv1.3;`);
    lines.push(`${ind}ssl_ciphers HIGH:!aNULL:!MD5;`);
    lines.push(`${ind}ssl_prefer_server_ciphers on;`);
    lines.push(`${ind}ssl_session_cache shared:SSL:10m;`);
    lines.push(`${ind}ssl_session_timeout 10m;`);
    lines.push("");
  }

  if (!cfg.reverseProxy) {
    lines.push(`${ind}root ${cfg.rootDir || "/var/www/html"};`);
    lines.push(`${ind}index ${cfg.indexFiles || "index.html index.htm"};`);
    lines.push("");
  }

  if (cfg.accessLog) {
    lines.push(`${ind}access_log ${cfg.accessLog};`);
  }
  if (cfg.errorLog) {
    lines.push(`${ind}error_log ${cfg.errorLog};`);
  }
  if (cfg.accessLog || cfg.errorLog) lines.push("");

  if (cfg.rateLimit) {
    lines.push(`${ind}# Rate limiting`);
    lines.push(`${ind}limit_req zone=one burst=20 nodelay;`);
    lines.push("");
  }

  lines.push(`${ind}location / {`);

  if (cfg.cors) {
    lines.push(`${ind}${ind}# CORS Headers`);
    lines.push(`${ind}${ind}add_header 'Access-Control-Allow-Origin' '*' always;`);
    lines.push(`${ind}${ind}add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;`);
    lines.push(`${ind}${ind}add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;`);
    lines.push(`${ind}${ind}if ($request_method = 'OPTIONS') {`);
    lines.push(`${ind}${ind}${ind}return 204;`);
    lines.push(`${ind}${ind}}`);
    lines.push("");
  }

  if (cfg.reverseProxy) {
    lines.push(`${ind}${ind}proxy_pass ${cfg.proxyPass || "http://localhost:3000"};`);
    lines.push(`${ind}${ind}proxy_http_version 1.1;`);
    lines.push(`${ind}${ind}proxy_set_header Upgrade $http_upgrade;`);
    lines.push(`${ind}${ind}proxy_set_header Connection 'upgrade';`);
    lines.push(`${ind}${ind}proxy_set_header Host $host;`);
    lines.push(`${ind}${ind}proxy_set_header X-Real-IP $remote_addr;`);
    lines.push(`${ind}${ind}proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
    lines.push(`${ind}${ind}proxy_set_header X-Forwarded-Proto $scheme;`);
    lines.push(`${ind}${ind}proxy_cache_bypass $http_upgrade;`);
  } else {
    lines.push(`${ind}${ind}try_files $uri $uri/ =404;`);
  }

  lines.push(`${ind}}`);

  if (cfg.staticCaching) {
    lines.push("");
    lines.push(`${ind}# Static file caching`);
    lines.push(`${ind}location ~* \\.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|woff|woff2|ttf|svg)$ {`);
    lines.push(`${ind}${ind}expires ${cfg.cacheMaxAge || "30d"};`);
    lines.push(`${ind}${ind}add_header Cache-Control "public, no-transform";`);
    lines.push(`${ind}}`);
  }

  lines.push("}");

  return lines.join("\n");
}

export function NginxConfigGeneratorTool() {
  const [serverName, setServerName] = useState("example.com");
  const [port, setPort] = useState("80");
  const [rootDir, setRootDir] = useState("/var/www/html");
  const [indexFiles, setIndexFiles] = useState("index.html index.htm");
  const [ssl, setSsl] = useState(false);
  const [sslCert, setSslCert] = useState("/etc/ssl/certs/example.crt");
  const [sslKey, setSslKey] = useState("/etc/ssl/private/example.key");
  const [reverseProxy, setReverseProxy] = useState(false);
  const [proxyPass, setProxyPass] = useState("http://localhost:3000");
  const [gzip, setGzip] = useState(true);
  const [staticCaching, setStaticCaching] = useState(false);
  const [cacheMaxAge, setCacheMaxAge] = useState("30d");
  const [cors, setCors] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);
  const [accessLog, setAccessLog] = useState("/var/log/nginx/access.log");
  const [errorLog, setErrorLog] = useState("/var/log/nginx/error.log");

  const config = generateNginxConfig({
    serverName, port, rootDir, indexFiles, ssl, sslCert, sslKey,
    reverseProxy, proxyPass, gzip, staticCaching, cacheMaxAge,
    cors, rateLimit, accessLog, errorLog,
  });

  const inputCls = "w-full px-3 py-2 text-sm border border-border-subtle rounded-lg bg-surface-raised text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-mono";
  const labelCls = "block text-xs text-text-secondary font-mono uppercase tracking-wide mb-1.5";
  const toggleCls = (on: boolean) =>
    `relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${on ? "bg-accent" : "bg-border-subtle"}`;
  const thumbCls = (on: boolean) =>
    `inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`;

  return (
    <ToolLayout
      agentReady
      title="Nginx Config Generator"
      description="Generate a complete nginx server block configuration visually. Toggle options and get production-ready config instantly."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options */}
        <div className="space-y-5">
          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Server Settings</h2>
            <div>
              <label className={labelCls}>Server Name</label>
              <input value={serverName} onChange={(e) => setServerName(e.target.value)} className={inputCls} placeholder="example.com" />
            </div>
            <div>
              <label className={labelCls}>Listen Port</label>
              <select value={port} onChange={(e) => setPort(e.target.value)} className={inputCls}>
                <option value="80">80 (HTTP)</option>
                <option value="443">443 (HTTPS)</option>
                <option value="8080">8080</option>
                <option value="3000">3000</option>
              </select>
            </div>
            {!reverseProxy && (
              <>
                <div>
                  <label className={labelCls}>Root Directory</label>
                  <input value={rootDir} onChange={(e) => setRootDir(e.target.value)} className={inputCls} placeholder="/var/www/html" />
                </div>
                <div>
                  <label className={labelCls}>Index Files</label>
                  <input value={indexFiles} onChange={(e) => setIndexFiles(e.target.value)} className={inputCls} placeholder="index.html index.htm" />
                </div>
              </>
            )}
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Logging</h2>
            <div>
              <label className={labelCls}>Access Log Path</label>
              <input value={accessLog} onChange={(e) => setAccessLog(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Error Log Path</label>
              <input value={errorLog} onChange={(e) => setErrorLog(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="bg-card-bg border border-card-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary">Features</h2>

            {/* SSL */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">SSL / HTTPS</span>
                <button onClick={() => setSsl(!ssl)} className={toggleCls(ssl)}>
                  <span className={thumbCls(ssl)} />
                </button>
              </div>
              {ssl && (
                <div className="space-y-3 pl-3 border-l-2 border-accent/30">
                  <div>
                    <label className={labelCls}>Certificate Path</label>
                    <input value={sslCert} onChange={(e) => setSslCert(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Key Path</label>
                    <input value={sslKey} onChange={(e) => setSslKey(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}
            </div>

            {/* Reverse Proxy */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">Reverse Proxy</span>
                <button onClick={() => setReverseProxy(!reverseProxy)} className={toggleCls(reverseProxy)}>
                  <span className={thumbCls(reverseProxy)} />
                </button>
              </div>
              {reverseProxy && (
                <div className="pl-3 border-l-2 border-accent/30">
                  <label className={labelCls}>Proxy Pass URL</label>
                  <input value={proxyPass} onChange={(e) => setProxyPass(e.target.value)} className={inputCls} />
                </div>
              )}
            </div>

            {/* Static Caching */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">Static File Caching</span>
                <button onClick={() => setStaticCaching(!staticCaching)} className={toggleCls(staticCaching)}>
                  <span className={thumbCls(staticCaching)} />
                </button>
              </div>
              {staticCaching && (
                <div className="pl-3 border-l-2 border-accent/30">
                  <label className={labelCls}>Cache Max Age</label>
                  <input value={cacheMaxAge} onChange={(e) => setCacheMaxAge(e.target.value)} className={inputCls} placeholder="30d" />
                </div>
              )}
            </div>

            {[
              { label: "Gzip Compression", value: gzip, set: setGzip },
              { label: "CORS Headers", value: cors, set: setCors },
              { label: "Rate Limiting", value: rateLimit, set: setRateLimit },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{label}</span>
                <button onClick={() => set(!value)} className={toggleCls(value)}>
                  <span className={thumbCls(value)} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Generated Config</h2>
            <CopyButton text={config} label="Copy Config" />
          </div>
          <div className="bg-[#1a1a2e] border border-card-border rounded-xl p-4 flex-1 overflow-auto">
            <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed">{config}</pre>
          </div>
          <p className="text-xs text-text-muted">
            Save this as <code className="font-mono text-accent">/etc/nginx/sites-available/example.com</code> and symlink to <code className="font-mono text-accent">sites-enabled/</code>
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
