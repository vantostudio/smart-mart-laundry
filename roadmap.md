# Roadmap — Street Mart Kenya

Design goals: modern, minimal and clean; warm cream + bottle green + terracotta palette; Clash Display
headings and Satoshi content; public pages stay static and client-loaded; payment on delivery; a
small staff-only admin backend on Neon, live on Cloudflare Workers at streetmart.africa.

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
- [x] Staff admin (`/admin`) with Google sign-in (Neon Auth), owners and staff managed at `/admin/settings`
- [x] Real shop stock: products with photos and thumbnails in Neon, sold-out items hidden, `/shop/[code]` pages
- [x] Shop settings (delivery, phone, hours) and laundry items and prices edited in the admin
- [x] Live on Cloudflare Workers via OpenNext, with rate limits and an admin runbook (`docs/admin.md`)

## Next

- [ ] Cloudflare Rate Limiting binding in place of the in-memory store, and a WAF rule on `/api/*` and `/shop/*`
- [x] Cloudflare CDN in front of the Neon photo bucket
- [ ] Own Google OAuth client for Neon Auth (production uses Neon's shared keys)

## Later

- [ ] Backend for customers: real orders, stock that goes down when something sells, order tracking, M-Pesa
