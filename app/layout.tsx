import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devpick.sh"),
  title: {
    default: "devpick.sh — Developer Tools That Don't Suck",
    template: "%s | devpick.sh",
  },
  description:
    "Free, fast developer tools for everyday tasks. JSON formatter, Base64, UUID generator, hash tools, JWT decoder & more. No sign-up, 100% client-side.",
  keywords: [
    "developer tools",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "hash generator",
    "jwt decoder",
    "url encoder",
    "timestamp converter",
  ],
  authors: [{ name: "devpick.sh" }],
  creator: "devpick.sh",
  openGraph: {
    type: "website",
    url: "https://devpick.sh",
    siteName: "devpick.sh",
    title: "devpick.sh — Developer Tools That Don't Suck",
    description:
      "Free, fast developer tools for everyday tasks. JSON formatter, Base64, UUID generator, hash tools, JWT decoder & more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "devpick.sh — Developer Tools That Don't Suck",
    description:
      "Free, fast developer tools for everyday tasks. 100% client-side, no sign-up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline script to apply saved theme before first paint (prevents flash)
  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t&&t!=='system')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "devpick.sh",
              url: "https://devpick.sh",
              description: "Free, fast developer tools that run in your browser",
              logo: "https://devpick.sh/favicon.ico",
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
