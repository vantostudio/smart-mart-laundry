# Roadmap — Street Mart Kenya

Design goals: modern, minimal and clean; warm cream + bottle green + terracotta palette; Clash Display
headings and Satoshi content; static data only; payment on delivery; a lean structure ready for a
backend.

## Done

- [x] Content gathered from the live site (streetmart.africa)
- [x] Next.js App Router, feature-sliced (`src/features/<name>/data.ts` + `components/`)
- [x] Design system in `src/app/globals.css` with a stepped type and spacing scale (see `docs/design-system.md`)
- [x] Home (/): hero with quick pickup card and live order-update card, services, how it works, reviews, shop teaser, FAQ
- [x] Laundry (/laundry): booking flow (when → what → where & send), booking kept in the URL, notify by WhatsApp / SMS / call, checkout as a pre-filled WhatsApp message
- [x] Shop (/shop): search, aisles, mtumba/new, size and price filters, sort, quick view with sizes, item codes, a bag with delivery or pick up (free delivery from KSh 1,500), one WhatsApp order
- [x] About (/about), per-route metadata, sitemap and robots
- [x] Header, phone action bar, footer with open-now status
- [x] Unit tests (`pnpm test`) and Playwright checks at 320–1920px (`pnpm e2e`): no sideways scroll, per-device type scale, 44px targets, 16px fields, booking and shop flows end to end

## Next

- [ ] Real shop stock (replace the sample `products` in `src/features/shop/data.ts`), photos of actual pieces, marking sold mtumba

## Later

- [ ] Backend: real orders, shop stock, order tracking, M-Pesa
