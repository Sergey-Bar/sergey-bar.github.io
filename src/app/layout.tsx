import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";

import { MotionDirector } from "@/components/motion-director";
import { PersonJsonLd } from "@/components/person-jsonld";
import { images } from "@/content/hero";
import { site } from "@/content/site";

import "./globals.css";

/**
 * Geist ships as a package, so the text face is self-hosted with no network
 * request and no font swap. JetBrains Mono is reserved for terminal output:
 * the scan transcript, the loading line and the key hint. On Apple devices the stylesheet names SF Pro and
 * SF Mono first, so these two are what every other device reads.
 */
const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.domain,
    siteName: site.name,
    title: site.title,
    description: site.description,
    // Static asset: GitHub Pages has no image optimisation server (§3.1).
    images: [{ url: images.og, width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [images.og],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png?v=3",
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
  // The composer is fixed to the bottom; the virtual keyboard must shrink the
  // layout viewport rather than cover it.
  interactiveWidget: "resizes-content",
};

/**
 * Runs before the body parses. `data-js` is the switch that lets the stylesheet
 * hold scroll-reveal targets hidden at all: without it a visitor who never runs
 * JavaScript sees the finished page. The stored motion preference is applied in
 * the same breath so a visitor who paused motion never sees a frame of it.
 */
const motionFlag =
  'try{var d=document.documentElement;d.dataset.js="";' +
  'if(localStorage.getItem("motion")==="off")d.dataset.motion="off"}catch(e){}';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[var(--radius-chip)] focus:border focus:border-ink focus:bg-surface focus:px-3 focus:py-2 focus:t-small"
        >
          Skip to content
        </a>
        <PersonJsonLd />
        {children}
        <MotionDirector />
      </body>
    </html>
  );
}
