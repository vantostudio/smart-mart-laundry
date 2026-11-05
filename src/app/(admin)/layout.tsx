import type { Metadata } from "next";
import localFont from "next/font/local";

// Staff only: no site chrome, cart or structured data, and kept out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Google's branding rules name this font for the sign-in button. Here, so public pages never load it.
const googleSans = localFont({
  src: "../fonts/GoogleSans-Medium.woff2",
  variable: "--font-google-sans",
  weight: "500",
  display: "swap",
});

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main" className={`${googleSans.variable} min-h-screen bg-background text-foreground`}>
      {children}
    </main>
  );
}
