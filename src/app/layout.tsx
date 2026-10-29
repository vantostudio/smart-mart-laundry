import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/config/site";

import "./globals.css";

// Self-hosted from Fontshare under the ITF Free Font License (see fonts/FONTSHARE-FFL.txt).

// Headings: Clash Display, a confident geometric display face with tight, modern proportions.
const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
});

// Content: Satoshi, a clean neutral grotesk that stays legible at small sizes on budget phones.
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Laundry & Clothes in Chuka`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_KE" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // Lets bottom bars reach the screen edge on notched phones; pad them with env(safe-area-inset-*).
  viewportFit: "cover",
  // Browser chrome can't read CSS variables — keep in sync with --cream-100 in globals.css.
  themeColor: "#f7f3ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${satoshi.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
