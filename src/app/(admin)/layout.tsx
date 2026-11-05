import type { Metadata } from "next";

// Staff only: no site chrome, cart or structured data, and kept out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="main" className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  );
}
