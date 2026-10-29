# Roadmap — Street Mart Kenya redesign

Design goals: modern 2026 aesthetic, minimal & clean, warm cream + bottle green + terracotta palette, Bricolage Grotesque (display) + Figtree (body) + JetBrains Mono (figures), 2×2 mobile grids, static data only, payment on delivery, lean structure for later backend work.

- [x] Gather real content from live site (streetmart.africa)
- [x] Design system (tokens, fonts, animations) in src/app/globals.css (see docs/design-system.md)
- [x] Static data layer (src/features/*/data.ts)
- [x] Cart context + header/footer components
- [x] Home page (/)
- [x] Laundry page with cart + WhatsApp checkout (/laundry)
- [x] Shop page (/shop) — clothing shop and E-Gikomba merged into one; /egikomba redirects here
- [x] About page (/about)
- [x] Per-route head metadata
- [x] Verify in preview (Playwright, mobile 390×844)
- [x] Home: hero with quick pickup card + photos and live order-update card; "Everything taken care of" bento; How it works bento; reviews; shop teaser; FAQ
- [x] Booking flow: when → what → where & send on /laundry, booking in the URL, notify by WhatsApp / SMS / call
- [x] Two-link header, phone action bar, footer with open-now status and contact rows
- [x] Responsive checks at 320–1920 px with Playwright (`pnpm e2e`): no sideways scroll, per-device type scale, 44 px targets, 16 px fields; booking flow end to end

- [x] Shop catalogue on /shop: search, aisles, mtumba/new, size and price filters, sort, quick view with sizes, item codes, a bag with delivery or pick up (free delivery from KSh 1,500), one WhatsApp order
- [ ] Real stock for the shop (replace the sample `products` in src/features/shop/data.ts), photos of actual pieces, and marking sold mtumba

Later (not now): backend via Lovable Cloud — real orders, seller stalls, order tracking, M-Pesa.
