import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { RefreshOnReturn } from "@/components/layout/refresh-on-return";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BagProvider, CartProvider } from "@/features/cart/cart-provider";
import { LaundryItemsProvider } from "@/features/laundry/laundry-items-provider";
import { getLiveLaundryItems } from "@/features/laundry/lib/live-items";
import { JsonLd } from "@/features/seo/json-ld";
import { businessJsonLd } from "@/features/seo/structured-data";
import { getLiveShopSettings } from "@/features/settings/lib/live-settings";
import { ShopSettingsProvider } from "@/features/settings/shop-settings-provider";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, items] = await Promise.all([getLiveShopSettings(), getLiveLaundryItems()]);
  return (
    <ShopSettingsProvider settings={settings}>
      <LaundryItemsProvider items={items}>
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
              <RefreshOnReturn />
              <JsonLd data={businessJsonLd(settings, items)} />
            </div>
          </BagProvider>
        </CartProvider>
      </LaundryItemsProvider>
    </ShopSettingsProvider>
  );
}
