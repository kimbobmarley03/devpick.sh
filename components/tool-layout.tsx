import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  kbdHint?: string;
  breadcrumb?: string;
  /** Enable WebMCP badge (tool is agent-compatible) */
  agentReady?: boolean;
}

export function ToolLayout({ title, description, children, kbdHint, breadcrumb, agentReady }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border-subtle px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-text-dimmed hover:text-text-primary transition-colors text-sm no-underline"
        >
          <ChevronLeft size={15} />
          <span className="font-mono">devpick.sh</span>
        </Link>
        <span className="text-border-strong">/</span>
        <span className="text-sm text-text-secondary font-mono flex-1">
          {title.toLowerCase().replace(/\s+/g, "-")}
        </span>
        <ThemeToggle />
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://devpick.sh" },
              { "@type": "ListItem", position: 2, name: breadcrumb ?? title },
            ],
          }),
        }}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {kbdHint && (
              <span className="kbd">{kbdHint}</span>
            )}
            {agentReady && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="This tool supports WebMCP — AI agents can call it directly">
                <span>🤖</span> Agent Ready
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>

        {children}
      </main>

      <footer className="border-t border-border-subtle py-4 text-center text-sm text-text-muted">
        devpick.sh — 100% client-side, private, free · <span className="text-emerald-400">WebMCP ready</span>
      </footer>
    </div>
  );
}
