import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from "next/font/google";

import { site } from "@/config/site";

import "./globals.css";

// Display: a characterful grotesque that reads like hand-painted market signage.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

// Body: open, round and legible at small sizes on budget phone screens.
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

// Mono: ticket numbers, order codes and price columns.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Laundry, Clothing & E-Gikomba in Chuka`,
    template: `%s — ${site.name}`,
  },
  description:
    "Free laundry pickup, delivery and ironing across Chuka. Our own clothing shop and the E-Gikomba clothes and shoes marketplace at Chuka General, Tharaka Nithi County.",
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_KE" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // Browser chrome can't read CSS variables — keep in sync with --cream-100 in globals.css.
  themeColor: "#f7f3ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
