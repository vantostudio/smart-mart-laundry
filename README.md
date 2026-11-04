# Street Mart Kenya

Website for Street Mart: laundry pickup and delivery booked over WhatsApp, and a clothing shop
(mtumba and new). The public site is static data, payment on delivery. A small staff-only admin
backend is being added, and the site is moving to Cloudflare.

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

## Admin, database and hosting

The site is moving to Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) in slice
`hosting`; the repo has no Wrangler or OpenNext config yet. A private `/admin` area for staff is
on its way: Neon Postgres for data and Neon Auth (Google sign-in only) for staff, with our own
allowlist deciding who gets in. Why these:
[`docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md`](docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md).

Provisioning, done once by a person. The `db:*` scripts exist; the `cf:*` scripts come with slice
`hosting`.

1. Neon:
   `pnpm dlx neon@latest init -y --org-id <neon-org-id> --project-id <neon-project-id> --branch production --services postgres,auth`
   (no object storage), with the org and project ids from the Neon console. If a browser sign-in
   opens, finish it there, or run `pnpm dlx neon@latest login` and retry. Review what `init` adds.
   Commit `neon.ts` and the Neon agent skills, never `.env.local`.
2. `pnpm dlx neon@latest deploy` writes env into `.env.local`. Write down the variable names (not
   values) for `.env.example`. Create a Neon `dev` branch for local work and previews.
3. Google Cloud: create a web OAuth client with redirect URIs for production, the preview
   `workers.dev` origin and localhost, as Neon Auth specifies. Put its id and secret into Neon
   Auth and turn on Google as the only provider. Set Neon Auth trusted origins to
   `https://streetmart.africa`, the preview `workers.dev` origin, `http://localhost:3000` and
   `http://localhost:8787`.
4. Cloudflare (after slice `hosting`): `wrangler login`, then `wrangler secret put <NAME>` for each
   secret in production (Neon `production` branch values) and
   `wrangler secret put <NAME> --env preview` (`dev` branch values). Copy the dev values into
   `.dev.vars` for local preview. Switch the live deploy to `pnpm cf:deploy`, or to Workers Builds
   on the repo with the same command.
5. After slice `db`: from a dev machine with the direct Neon URL, run `pnpm db:migrate` against
   `dev`, then `production`. Then run `pnpm db:seed-owner <owner-email>` on each.
6. After slice `admin-shell`: sign in on the preview Worker, then production. Keep the output of
   `wrangler tail` showing `sign_in` as the end-to-end proof.

### Database

Schema in `src/lib/db/schema.ts`, SQL migrations in `drizzle/`, config in `drizzle.config.ts`.
These run by hand from a dev machine, never on install, build or deploy. `db:migrate` and
`db:seed-owner` use `DATABASE_URL_UNPOOLED` (the direct URL), else `DATABASE_URL`, from the
environment or `.env.local`.

- `pnpm db:generate` after a schema change writes the next migration; review its SQL in the PR.
- `pnpm db:migrate` applies pending migrations. Run it on the Neon `dev` branch first, then
  `production`.
- `pnpm db:seed-owner <email>` adds an owner to the admin allowlist (does nothing if already
  there).
- Rollback: `psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/<tag>.sql`, then re-seed the owner.
  Neon point-in-time restore is the backstop.

`GET /api/health` answers `{"ok":true}` with `Cache-Control: no-store` and never touches the
database, so uptime pings don't wake Neon.

Secrets live only in Wrangler. `.env.local` and `.dev.vars` are never committed; `.env.example`
lists the names. `.dev.vars` isn't gitignored until slice `hosting` adds it, so nobody should
create one before then.

Plans: [`roadmap.md`](roadmap.md).
