import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/features/cart/cart-provider";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </CartProvider>
  );
}
