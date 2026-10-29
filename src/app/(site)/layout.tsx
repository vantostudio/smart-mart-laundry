import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BagProvider, CartProvider } from "@/features/cart/cart-provider";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <BagProvider>
        <div className="flex min-h-screen flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:inline-flex focus:h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-5 focus:text-body-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
          <MobileActionBar />
        </div>
      </BagProvider>
    </CartProvider>
  );
}
