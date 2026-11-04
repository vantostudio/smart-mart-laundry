# Project profile

What the factory knows about this project. Every agent reads it before working. `/factory:init`
writes it by studying the repo; edit it whenever it's wrong or out of date. Keep it short and
specific: commands that work, paths that exist.

## What it is
The public website for Street Mart Kenya (streetmart.africa), a laundry and clothing business at
Chuka General, Chuka. Visitors (mostly Chuka University students, Ndagani and Chuka town) book a
laundry pickup and delivery, or fill a shop bag of mtumba and new clothes and shoes, and send the
order as a pre-filled WhatsApp message. Payment is on delivery or in store. All content is static
data in the repo. Not here yet, and not to be added without a plan: a backend, accounts, real
stock, order tracking, M-Pesa or any online payment UI.

## Stack
TypeScript 5.9, Next.js 16.4 (App Router, `cacheComponents`, `typedRoutes`), React 19.3,
Tailwind CSS v4 (via `@tailwindcss/turbopack`), shadcn/ui on `radix-ui`, `motion`, `lucide-react`.
pnpm 12.15 (`packageManager`), Node >= 24.11. Vite+ (`vite-plus` 1.4) for tests (Vitest, jsdom,
Testing Library), lint (Oxlint, type-aware) and format (Oxfmt). Playwright for browser tests.
Next.js in this version differs from training data: read `node_modules/next/dist/docs/` before
writing Next code.

## Scale
`small`. One Next.js app, one owner, no backend, no accounts, no stored data beyond the visitor's
own `localStorage`, orders go out over WhatsApp, static data. It moves to `growing` when the
roadmap's backend lands: real orders and stock in a database, order tracking, M-Pesa payments,
or staff logging in to manage stock.

## Architecture
Today: a single Next.js app, presumably on a managed host (no deploy config in the repo).
Routes in `src/app/(site)` (`/`, `/laundry`, `/shop`, `/about`) plus `sitemap.ts`, `robots.ts`,
`manifest.ts`, icons; `/egikomba` redirects to `/shop` (`next.config.ts`). Page code and static
data in `src/features/<name>/` (`data.ts`, `components/`, `lib/`). The laundry basket and shop bag
live in `localStorage` via `src/features/cart/cart-provider.tsx`; the saved area via
`src/lib/saved-details.ts`. Booking state is kept in the URL (search params). Checkout builds a
`wa.me` deep link (`src/lib/whatsapp.ts`, messages in `src/features/laundry/lib/pickup-message.ts`
and `src/features/shop/lib/shop-message.ts`). Photos come from Unsplash's CDN through a custom
`next/image` loader (`src/lib/image-loader.ts`). Business details are in `src/config/site.ts`.
No database, no API routes, no auth, no third-party services beyond WhatsApp links and Unsplash.

Coming (roadmap.md): real shop stock replacing the sample `products` in
`src/features/shop/data.ts` and marking sold mtumba; later a backend for orders, stock, tracking
and M-Pesa. Simplest architecture for that: keep one Next.js app as a modular monolith (server
actions / route handlers per feature, the `features/*/data.ts` shapes swapped for typed data
calls); managed Postgres with Drizzle and migrations in the repo when stock or orders must be
stored; a managed auth library (Better Auth or Auth.js) only when staff need to log in; M-Pesa
via Daraja STK push with webhooks and idempotency keys when money moves in the product; object
storage (R2/S3) only when staff upload product photos; a job queue only when work (payment
callbacks, notifications) must be retried outside a request; Sentry when real orders depend on it.
Not yet: cache, search engine (filtering stays in `src/features/shop/lib/filters.ts`), queues.

## Standards
- Errors: no error type yet (no server). `src/app/(site)/error.tsx` is the route error boundary
  with calm copy and a retry; `localStorage` failures are caught and ignored by design. When a
  backend lands: one `{ code, message, field?, requestId }` shape with codes in one module
  (recommended, not yet in use).
- Logger: none (only `console.error` in the error boundary). Recommended when a backend lands:
  the host's logs with structured JSON (pino), not yet in use.
- Validation: none; there is no free-text input except the optional note, and stored values are
  checked by hand (area must be one of `site.areas`, cart parsed defensively). Recommended: Zod
  for URL search params and `localStorage` reads now, and on every server input later (recommended,
  not yet in use).
- Typed API: none (no API). `typedRoutes` types links. Recommended: server actions with Zod
  schemas shared with the client when the backend arrives.
- Migrations: none (no database). Recommended: Drizzle Kit migrations in the repo.
- Money: integer KSh in data (`price: number`), shown with `src/components/shared/price.tsx` and
  `src/lib/format.ts`.

## Commands
- Setup (fresh checkout): `pnpm install --frozen-lockfile` (prepare runs `vp config` and `next typegen`)
- Dev server on a port (`{port}`), or "none": `pnpm dev -p {port}`
- Preview of the last build on a port (`{port}`), or "none": `pnpm build && pnpm start -p {port}`
- Checks: `.factory/checks.sh` runs: `pnpm install --frozen-lockfile`, `pnpm check` (next typegen,
  Oxfmt check, Oxlint type-aware), `pnpm typecheck` (tsc --noEmit), `pnpm exec vp test run`,
  `pnpm build`, then `next start -p $FACTORY_PORT` and
  `E2E_BASE_URL=http://localhost:$FACTORY_PORT pnpm exec playwright test` (Edge if installed,
  else `E2E_CHANNEL=chrome`).

## Pages
yes
- `/` home: hero with a quick pickup card and order-updates card, shop rail up front, services,
  how it works, reviews, FAQ; links into laundry and shop.
- `/laundry`: pick items (picture cards, basket sizes, duvets, mats, shoes), pick a date on the
  calendar, pick an area, optional note, send the booking as a WhatsApp message.
- `/shop`: search, aisles, mtumba/new, size and price filters, sort, quick view with sizes, add to
  the bag, delivery or pickup (free delivery from KSh 1,500), one WhatsApp order.
- `/about`: who Street Mart is, location, hours, contact.
- Site chrome: header with phone menu, phone action bar, footer with open-now status.

## Tests
Unit tests sit next to the code as `*.test.ts` / `*.test.tsx` under `src/` (Vitest via Vite+,
jsdom, setup in `src/test/setup.ts`, import from `vite-plus/test`). Browser tests are Playwright
specs in `e2e/*.spec.ts` with helpers in `e2e/helpers.ts`, config in `playwright.config.ts`; they
cover 320–1920px widths (no sideways scroll, type scale, 44px targets, 16px fields) and the
booking and shop flows. New logic tests go next to the module; new flow or layout checks go in
the matching `e2e/*.spec.ts`. Interact only after hydration (see `addLaundryItem` in
`e2e/helpers.ts`): retry the first action until its visible effect shows, bounded with
`toPass({ timeout: 15_000 })`. The gate runs Playwright with `--retries=0`, so a spec that taps
before hydration fails it.

## Conventions
- Read `AGENTS.md`, `README.md`, `docs/design-system.md` and `roadmap.md` first.
- Feature-sliced: routes in `src/app/(site)` stay thin; page code in
  `src/features/<name>/components`, static data in `src/features/<name>/data.ts`, pure logic in
  `src/features/<name>/lib`. Keep `data.ts` shapes easy to swap for API calls.
- Shared site components in `src/components/shared` (only when two or more features use them),
  site chrome in `src/components/layout`, shadcn primitives in `src/components/ui` (installed only
  when used, `pnpm dlx shadcn@latest add <name>`; excluded from lint and format).
- kebab-case file names, named exports, `@/` path alias.
- Commits: short imperative sentence in plain English describing the user-visible change
  ("Give each laundry basket size its own photo"), no prefixes.
- `main` is live: never rewrite pushed history, keep `main` working.
- `next dev` re-adds a block to `AGENTS.md`; commit it rather than strip it.

## Design
All tokens in `src/app/globals.css` (primitives, then semantic tokens, then Tailwind `@theme`);
reference and component catalogue in `docs/design-system.md`. Fonts: Clash Display (headings) and
Satoshi (content), self-hosted in `src/app/fonts/` and loaded with `next/font/local` in
`src/app/layout.tsx`. Rules: components use semantic utilities only (`bg-primary`,
`text-clay-foreground`, `text-display-lg`, `container-page`, ...), never hex, `text-white`,
arbitrary sizes or fonts; type and spacing step per device class (phone, tablet >= 640, desktop
>= 1024) in the tokens, so no `sm:`/`lg:` size overrides on headings; solid `bg-X` pairs with
`text-X-foreground`, `bg-X-soft` with `text-X`; `surface-inverse` for dark bands; one
`gradient-*` button per view; 44px touch targets and 16px fields. New prefix-sharing utilities
must be registered in `src/lib/utils.ts`. Illustrations via `scripts/undraw.mjs` into
`src/components/illustrations`. No dark theme.

## Risk
- `medium`: changes to the booking or shop flow logic (`src/features/laundry/components/laundry-order.tsx`,
  `src/features/shop/components/shop-catalogue.tsx`, `src/features/shop/lib/*`,
  `src/features/booking/schedule.ts`, `src/lib/opening-hours.ts`), cart storage
  (`src/features/cart/cart-provider.tsx`), the design tokens (`src/app/globals.css`, affects every
  page), `next.config.ts`, SEO and metadata (`src/features/seo/*`, `src/lib/metadata.ts`,
  `src/app/sitemap.ts`, `src/app/robots.ts`).
- `high`: anything that changes the order message or where it goes (`src/lib/whatsapp.ts`,
  `src/features/laundry/lib/pickup-message.ts`, `src/features/shop/lib/shop-message.ts`,
  `src/features/shop/lib/delivery.ts`), the start of any backend, payment or data storage.
- `security` surface: URL search params read into booking and shop state; `localStorage` read back
  (`src/features/cart/cart-provider.tsx`, `src/lib/saved-details.ts`); text put into `wa.me` URLs
  (must stay `encodeURIComponent`); `dangerouslySetInnerHTML` in `src/features/seo/json-ld.tsx`
  (keeps the `<` escape); the image loader building URLs (`src/lib/image-loader.ts`); any new
  server action, route handler, env var or secret; anything payment or M-Pesa.

## Always a human
- Prices, delivery fees and the free-delivery threshold (`src/features/laundry/data.ts`,
  `src/features/shop/data.ts`, `src/features/shop/lib/delivery.ts`).
- Business details: phone, WhatsApp number, email, address, areas, opening hours
  (`src/config/site.ts`).
- Public copy and claims on any page, FAQ, reviews (`src/features/*/data.ts`), metadata, SEO and
  structured data (`src/features/seo/*`, `src/lib/metadata.ts`).
- The WhatsApp order messages and link (`src/lib/whatsapp.ts`, `*/lib/*-message.ts`).
- Brand: logo (`src/components/shared/logo-mark.tsx`, `wordmark.tsx`, `src/app/icon.svg`,
  `src/app/apple-icon.tsx`, `src/app/favicon.ico`), fonts and their licence (`src/app/fonts/`),
  palette in `src/app/globals.css`.
- Config and tooling: `next.config.ts` (redirects, images), `vite.config.ts`,
  `playwright.config.ts`, `tsconfig.json`, `components.json`, `pnpm-workspace.yaml`, `package.json`
  and `pnpm-lock.yaml` (any new dependency), deploy or CI config if added.
- Any backend, database, migration, payment or M-Pesa work, and any change to what is stored on
  the visitor's phone.
- `AGENTS.md`, `README.md`, `roadmap.md`.
