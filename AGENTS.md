> [!IMPORTANT]
> `main` is the live branch. Never rewrite pushed history (no force push, rebase, amend or
> squash of pushed commits) and keep `main` in a working state.

## Architecture

- Next.js App Router, feature-sliced: routes in `src/app/(site)`, page code and static data in `src/features/<name>/` (`data.ts`, `components/`); the laundry basket and the shop bag live in `localStorage` via `src/features/cart/cart-provider.tsx`; checkout builds a WhatsApp deep link (`src/lib/whatsapp.ts`). Payment is on delivery (or in store) — no online payment UI.
- Hosting is moving to Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) in slice `hosting`; the repo has no Wrangler or OpenNext config yet. Server code targets the Node.js runtime with `nodejs_compat`. Never set `export const runtime = "edge"` (OpenNext doesn't support it) and add no `proxy.ts`: every admin page and action checks access itself. Why: [`docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md`](docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md).
- A backend is being added for the staff admin area (`/admin`) only: Neon Postgres plus Neon Auth (Google only). Its server code lives in `src/lib/db` (Drizzle on Neon's HTTP driver, migrations in `drizzle/`) and `src/config/env.ts`; `src/features/admin` is planned.
- Public pages (`src/app/(site)`, the public features, `src/components`) stay static and never import that server code.
- Server modules import `server-only`. Their tests run in the default jsdom environment and start with `vi.mock("server-only", () => ({}))`, because `src/test/setup.ts` needs `window`.
- Env will come from Wrangler secrets and `.dev.vars` and be read lazily, so builds and checks run without secrets. The names are in `.env.example`. Never commit values.
- Orders, real stock, tracking and M-Pesa still come later; keep the `features/*/data.ts` shapes easy to swap for API calls.
- Design system lives only in `src/app/globals.css` (primitives → semantic tokens → Tailwind theme); reference in `docs/design-system.md`. Clash Display headings and Satoshi content, self-hosted from Fontshare (ITF Free Font License, `src/app/fonts/`) with `next/font/local` in `src/app/layout.tsx`. Type and spacing step per device class (phone / tablet ≥640 / desktop ≥1024) — no `sm:`/`lg:` size overrides on headings. Never hardcode colors, sizes or fonts in components — use the semantic utilities (`bg-primary`, `text-clay-foreground`, `text-display-lg`, `container-page`, …).
- shadcn/ui: install only components that are actually used (`pnpm dlx shadcn@latest add <name>`); `src/components/ui` holds shadcn primitives restyled to our tokens; reusable site components live in `src/components/shared` (catalogue in `docs/design-system.md`).
- Tooling: pnpm + Vite+ (`vp test` / `vp lint` / `vp fmt` / `vp check`); Next.js owns `dev` and `build`. Unit tests sit next to the code (`*.test.ts(x)`); Playwright specs in `e2e/` run against a running server (`pnpm e2e`, see `README.md`).
- pnpm only: use `pnpm add`, `pnpm dlx` (for example `pnpm dlx neon@latest`) and `pnpm exec`, never `npm`, `npx` or `yarn`. When a tool's own instructions say `npm`/`npx`, translate them to pnpm.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
