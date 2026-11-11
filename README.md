# Street Mart Kenya

Website for Street Mart: laundry pickup and delivery booked over WhatsApp, and a clothing shop
(mtumba and new), payment on delivery. Pages are static and load products and contact details from
a small public API. Staff run the shop from a private admin, and the site is built to run on
Cloudflare Workers.

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

## Run on Cloudflare (Workers via OpenNext)

The site runs as a Cloudflare Worker built by OpenNext (`@opennextjs/cloudflare`), configured in
`wrangler.jsonc` and `open-next.config.ts`. Keep using `pnpm dev` while working; these check the
Worker build.

```sh
pnpm cf:build       # runs `next build`, then bundles the Worker into .open-next/ (no login)
pnpm cf:preview     # serves the last cf:build in local workerd on http://localhost:8787
E2E_BASE_URL=http://localhost:8787 pnpm e2e   # browser checks against the preview
```

Deploying needs `pnpm exec wrangler login` first:

```sh
pnpm cf:deploy                  # the `street-mart` Worker (production)
pnpm cf:deploy --env preview    # the `street-mart-preview` Worker, on its own workers.dev URL
pnpm exec wrangler rollback     # back to the previous deployed version
```

`pnpm cf:build` stops before building when the repo root holds any `.env*` file other than
`.env.example` (`scripts/check-no-env-files.mjs`), because OpenNext copies `.env` values into the
Worker bundle and the deployed Worker would fall back to them for any secret Wrangler doesn't set.
Move `.env.local` aside while you build. Secrets go in `wrangler secret put <NAME>` (add
`--env preview` for the preview Worker), and in `.dev.vars` for local preview.

Static files are served by Workers Static Assets without running the Worker, so their headers
(the favicon's content type, long caching for `_next/static`) are set in `public/_headers`.

Live since 2026-11-11 on `streetmart.africa` and `www.streetmart.africa` (custom domains in
`wrangler.jsonc` `routes`; `workers.dev` is off). What the live Worker needs:

- **Secrets** (Neon `main` branch, `neon env pull --branch main`): `DATABASE_URL`,
  `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (its own random value, not dev's),
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`. Set each with
  `pnpm exec wrangler secret put <NAME>`; they never go in the repo.
- **Cache**: OpenNext's shared cache in KV (`NEXT_INC_CACHE_KV`) with tags in D1
  (`NEXT_TAG_CACHE_D1`, database `street-mart-tag-cache`), so `use cache` entries and
  `revalidateTag` work across instances. KV instead of R2 because R2 isn't enabled on the
  account. `cf:deploy` creates the D1 table and fills KV.
- **Cache Components on workerd**: `wrangler.jsonc` `main` is `cloudflare/worker.mjs`, which loads
  `cloudflare/next-immediates.mjs` before Next so request-time renders don't hang; `next.config.ts`
  sets `experimental.maxPostponedStateSize` to 25 MB (workerd caps zlib output); and
  `patches/@opennextjs__cloudflare.patch` turns on esbuild `keepNames` so resumed pages match their
  prerendered shell. Drop all three once the adapter ships the fix
  (opennextjs/opennextjs-cloudflare#1318, #1349).
- **Neon Auth** on `main` trusts `https://streetmart.africa` and `https://www.streetmart.africa`
  (`neon neon-auth domain list --branch main`). Google sign-in uses Neon's shared keys for now.
- **Size**: about 4.1 MiB gzip, so the account needs Workers Paid (Free allows 3 MiB).

## Where things live

- `src/app/(site)` — routes: `/`, `/laundry`, `/shop`, `/about`
- `src/features/<name>` — page components and their data
- `src/components/ui` · `src/components/shared` · `src/components/layout` — primitives, shared pieces, site chrome
- `src/app/globals.css` — the design system; reference in [`docs/design-system.md`](docs/design-system.md)
- `e2e/` — Playwright specs

## Admin, database and hosting

The site is built to run on Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`); how to
build, preview and deploy it is in [Run on Cloudflare](#run-on-cloudflare-workers-via-opennext).
A private `/admin` area for staff is on its way: Neon Postgres for data and Neon Auth (Google
sign-in only) for staff, with our own allowlist deciding who gets in. Why these:
[`docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md`](docs/decisions/0001-neon-and-neon-auth-on-cloudflare.md).

Running the admin day to day (staff, lockout, migrations, rollback, secrets, logs, Cloudflare rules): [`docs/admin.md`](docs/admin.md).

Provisioning, done once by a person. The `db:*` and `cf:*` scripts exist.

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
   `wrangler secret put <NAME> --env preview` (`dev` branch values). `NEON_AUTH_COOKIE_SECRET` is
   one we generate, not Neon: `openssl rand -base64 32`, a different value per environment. Copy
   the dev values into `.dev.vars` for local preview. Switch the live deploy to `pnpm cf:deploy`,
   or to Workers Builds on the repo with the same command.
   Rate limiting: the API counts requests in each Worker instance's memory
   (`src/lib/rate-limit.ts`), so every instance has its own count. That is a basic guard only. At
   this step add a Cloudflare Rate Limiting binding named `API_RATE_LIMIT` in `wrangler.jsonc`
   (`ratelimits`), implement `RateLimitStore` over it and pass it to `setRateLimitStore`; no route
   changes. Also add a Cloudflare WAF rate-limiting rule on `/api/*` and `/shop/*` in front of the Worker. `/shop/<code>` pages read the database without going through the limiter.
5. After slice `db`: from a dev machine with the direct Neon URL, run `pnpm db:migrate` against
   `dev`, then `production`. Then run `pnpm db:seed-owner <owner-email>` on each.
6. After slice `admin-shell`: sign in on the preview Worker, then production. Landing on `/admin`
   with your name and role in the header is the end-to-end proof. Successful sign-ins aren't
   logged, so `wrangler tail` shows no line for them. Refused ones appear as `sign_in_denied`.

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
lists the names. `.dev.vars` is gitignored.

### Products API

Staff-only, JSON, under `/api/admin/products`: `GET` (`?page=&limit=&category=&condition=`, newest first, gives `{ items, page, limit, total }`) and `POST`, then `GET`, `PATCH` and `DELETE` on `/api/admin/products/<id>`. Writes must come from the site's own pages. `POST /api/admin/products/images` stores a photo and its thumbnail (form fields `file` and `thumbnail`) and answers the photo's key. Deleting a product, or removing a photo from one, deletes the files too. Staff use all of this at `/admin/products`.

### Public API

No sign-in, GET only, cached by a CDN for up to 90 seconds: `/api/products` (`?page=&limit=&q=&category=&condition=&size=&price=&sort=`, gives `{ items, page, limit, total, counts }`), and `/api/products/<code>`. Only in-stock products appear, and they carry photo and thumbnail URLs but no ids or storage keys. The shop list, its quick view and the home rail load from these in the browser.

Two things read the database on the server instead, through cached functions (see [`docs/decisions/0002-server-cached-public-reads.md`](docs/decisions/0002-server-cached-public-reads.md)): the shop settings (phone, hours, delivery), read once in the site layout so the HTML and search data already hold the real values, and the product page `/shop/<code>` with the sitemap. A product page answers 404 when the piece is sold out or deleted. Saving settings or a product expires these caches at once; the site needs `DATABASE_URL` and the `AWS_*` values wherever it runs, but with no database it still builds and renders, using the defaults in `src/config/shop-settings.ts`.

### Settings

`/admin/settings`: everyone sets their own name. Owners also change delivery, phone and hours (one row in `shop_settings`) and add or remove staff. A save shows on the site at once, in the page, the footer and the search data alike; `src/config/shop-settings.ts` is only the fallback if the database is unreachable.

`/admin/laundry`: owners change prices, and add, edit or remove laundry items, including their photos; other staff can only look. Each category keeps at least one item. A save shows on the site at once, and a page left open catches up when someone returns to it, or within 5 minutes.

Photos live in the Neon `products` bucket declared in `neon.ts`. `pnpm dlx neon@latest deploy` creates it on the checked-out branch and pulls the `AWS_*` values. It's on `dev` and production. Put Cloudflare in front of the photos before real traffic, because Neon has no CDN. Grids load a ~480px thumbnail of each photo to spare the transfer limit; photos uploaded before thumbnails existed fall back to the full photo.

### Auth

Staff sign in with Google through Neon Auth. `/api/auth/*` is the Neon Auth proxy; without its env
it answers `503` with `AUTH_UNAVAILABLE`. It needs `NEON_AUTH_BASE_URL` (from `neon deploy`) and
`NEON_AUTH_COOKIE_SECRET` (ours, at least 32 characters). Access is a verified Google email on the
`admin_user` allowlist, with the role from that row. Every admin page calls `requireAdmin()` and
every admin action calls `requireAdminForAction()`, from `src/features/admin/lib/auth.ts`; there is
no middleware.

`/admin/sign-in` has one "Continue with Google" button (Google is the only provider). Google sends
the browser back to the sign-in page, which exchanges Neon Auth's `neon_auth_session_verifier` for
the session cookies through `/api/auth` and then loads `/admin`. "Sign out" in the `/admin` header
signs out through Neon Auth and goes back to sign-in. Every `/admin` response carries
`X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`,
`Referrer-Policy: same-origin` and `Cache-Control: private, no-store` (`next.config.ts`); admin
pages are `noindex`, and `robots.txt` disallows `/admin` and `/api/`. Admin copy lives in
`src/features/admin/messages.ts`.

Plans: [`roadmap.md`](roadmap.md).
