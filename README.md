# Street Mart Kenya

Website for Street Mart: laundry pickup and delivery booked over WhatsApp, and a clothing shop
(mtumba and new). Static data for now, payment on delivery.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui · Vite+ for tests, lint and format.

## Run it

Needs Node.js 24.11+ and pnpm.

```sh
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # unit tests (Vitest via Vite+)
pnpm check          # format, lint and type checks
pnpm build          # production build; `pnpm start` serves it
```

Browser checks (Playwright, uses the installed Microsoft Edge) run against a server that is already
up, on port 3210 by default:

```sh
pnpm build && pnpm start -p 3210
pnpm e2e

# or against the dev server
E2E_BASE_URL=http://localhost:3000 pnpm e2e
```

## Where things live

- `src/app/(site)` — routes: `/`, `/laundry`, `/shop`, `/about`
- `src/features/<name>` — page components and static data (`data.ts`)
- `src/components/ui` · `src/components/shared` · `src/components/layout` — primitives, shared pieces, site chrome
- `src/app/globals.css` — the design system; reference in [`docs/design-system.md`](docs/design-system.md)
- `e2e/` — Playwright specs

Plans: [`roadmap.md`](roadmap.md).
