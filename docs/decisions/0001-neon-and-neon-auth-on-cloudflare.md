# 0001 — Neon Postgres and Neon Auth on Cloudflare Workers

Status: **Accepted**, 2026-11-03. Plan: `.factory/plans/001-backend-auth-for-admins-on/plan.md`.

## Context

- This is the first backend in the repo. Until now the site has been static data, with orders
  sent over WhatsApp and nothing stored beyond the visitor's own `localStorage`.
- 3 to 5 named Street Mart staff must sign in to a private `/admin` area.
- The site is moving to Cloudflare (slice `hosting` adds the config).
- The public pages stay static and never touch the database. (Later: they load products in the
  browser from a public API. Since [0002](0002-server-cached-public-reads.md) three cached server
  reads are the only exception: shop settings, product pages and the sitemap.)
- The project's scale moves from `small` to `growing`, because staff now log in.

## Options considered

Auth (Neon Auth, self-hosted Better Auth, Auth.js or Clerk):

- **Neon Auth (managed Better Auth).** Pro: Better Auth run by Neon, with its data in the same
  database and nothing to host. Con: tied to Neon, and some details (package, variable names,
  rate limits) are only known after `neon deploy`.
- **Better Auth, self-hosted.** Pro: full control of the library and its tables. Con: we run,
  patch and migrate the auth server and its schema ourselves.
- **Auth.js.** Pro: mature and widely used with Next.js. Con: more wiring for sessions and the
  database adapter, and we host and maintain it ourselves.
- **Clerk.** Pro: polished hosted sign-in and user management. Con: a third-party user store
  outside our database, and paid tiers as needs grow.

Runtime:

- **Cloudflare Workers via `@opennextjs/cloudflare`.** Pro: the supported way to run full
  Next.js (server actions, route handlers, dynamic pages) on Cloudflare. Con: the real runtime is
  workerd, so bundle size and CPU limits apply, and `next start` is not the same environment.
- **Static export.** Pro: the simplest possible host, plain files. Con: a static export can't run
  server actions, route handlers or sessions, so there could be no sign-in.
- Cloudflare Pages with `next-on-pages` is not an option: `next-on-pages` is deprecated.

Driver:

- **Neon serverless HTTP driver.** Pro: plain `fetch`, no TCP socket and no pool, works in
  Workers as is. Con: one statement per round trip and no interactive transactions.
- **Neon WebSocket `Pool`.** Pro: sessions and interactive transactions. Con: the pool must be
  created and closed per request (`ctx.waitUntil`) in Workers.
- **Hyperdrive with `pg`.** Pro: Cloudflare's pooler in front of Neon, fast for many queries per
  request. Con: another Cloudflare resource to configure, and not needed for one indexed lookup
  per admin request.

## Decision

- **Cloudflare Workers via OpenNext, on the Node.js runtime with `nodejs_compat`.** Never
  `export const runtime = "edge"`: OpenNext does not support it. Reason: it is the only supported
  full-Next path on Cloudflare.
- **Neon Postgres, with a `production` branch and a `dev` branch** (the `dev` branch serves local
  work and the preview Worker). Reason: managed Postgres on the free plan at this load, with
  branches for previews.
- **Neon Auth with Google as the only provider.** Access is decided by our own `admin_user`
  allowlist with `owner` and `admin` roles, deny by default, not by Neon Auth roles. Reason: deny
  by default, instant cutoff, and Neon's schema is not ours to migrate.
- **Drizzle on `@neondatabase/serverless` HTTP (`drizzle-orm/neon-http`)**, with a client created
  per request and nothing kept in module scope. Reason: it is fetch-based and safe in Workers, has
  no pool to manage, keeps migrations as SQL in the repo, and is enough for 5 admins.
- **`cf-ray` as the request id**, falling back to `crypto.randomUUID()` locally and in
  `next start`. Reason: free, present on every request, and it matches Cloudflare's own logs.
  Errors use one `{ code, message, field?, requestId }` shape (slice `db`).
- **Workers Logs with JSON lines** (`observability.enabled` in the Wrangler config), and no
  logging library. Reason: JSON fields become searchable in Workers Logs, and `wrangler tail`
  gives a live view.
- **No `proxy.ts`.** Every admin page and action checks access itself. Reason: it avoids
  depending on Node-runtime proxy support in OpenNext, and the proxy would only have been an
  optimistic redirect.
- **Object storage deferred** until there are real stock photos. Reason: nothing is uploaded yet.
- **Env read lazily from `process.env`**, fed by Wrangler secrets and `.dev.vars`. Reason: checks
  build without secrets, and the code is portable between `next start` and workerd.

## Differs from earlier recommendations

`.factory/project.md` recommended "Better Auth or Auth.js" for staff sign-in, and R2/S3 for
photos (drift item 3 in the plan).

- **Neon Auth instead of Better Auth or Auth.js.** Neon Auth is Better Auth run by Neon, with its
  data in the same database, so there is no auth server to host. We store no passwords, and
  Google provides 2-step verification. Authorisation stays in our own tables (`admin_user`), so
  Neon Auth stays replaceable.
- **Object storage is deferred.** Neither R2 nor S3 is added now. When real stock photos arrive,
  Neon storage and R2 get compared then.

## Consequences

- **Workers Paid (USD 5 a month)** is needed. With the backend the Worker is 4.05 MiB gzip, over
  the Free plan's 3 MiB cap, and every page request runs the Next server inside the Worker, which
  doesn't fit the Free plan's 10 ms CPU cap. See "Hosting findings".
- Neon runs in one region, so each query is a round trip from the Cloudflare edge to that region.
  That is fine for one query per admin request. Prefer an EU region such as Frankfurt if it can
  still be chosen.
- `.factory/checks.sh` still gates on `next build` and `next start`. The real runtime is workerd,
  so the live end-to-end proof is a manual run on `opennextjs-cloudflare preview` and the preview
  Worker (drift item 5).
- Checks and builds run without secrets.

## Revisit when

- A request needs several queries or an interactive transaction (orders, stock): move to
  Hyperdrive with `pg`, or the Neon WebSocket `Pool` created per request.
- On-demand revalidation is needed (real stock pages): add an R2 incremental cache.
- A partner asks for SSO.
- Real orders depend on the backend: add Sentry.

## Auth details (slice auth-core)

- **Package:** `@neon/auth` 0.8.2 (its Next.js entry `@neon/auth/next/server`), pinned by
  `pnpm-lock.yaml`. The plan guessed `@neondatabase/auth`; the real name differs. It brings Better
  Auth 1.7 as its own dependency; we don't depend on Better Auth directly.
- **Variables:** `NEON_AUTH_BASE_URL` comes from `neon deploy` and includes the path; use it as
  written, `https` only. `NEON_AUTH_COOKIE_SECRET` is
  ours, not Neon's: generate it with `openssl rand -base64 32` (the SDK refuses fewer than 32
  characters) and store it as a Wrangler secret. Both are read by `authEnv()` in
  `src/config/env.ts`, apart from `serverEnv()`, so the database and `/api/health` never need them.
- **Mount:** `GET|POST /api/auth/[...path]` proxies to Neon Auth. The SDK instance is built on
  first use in a request, because it throws at creation without the secret; without env the
  route answers `503 AUTH_UNAVAILABLE`.
- **Cookies** the SDK sets: `__Secure-neon-auth.session_token`, `__Secure-neon-auth.local.session_data`
  and `__Secure-neon-auth.session_challenge`, all `HttpOnly`, `Secure` and `SameSite=Lax` (the
  default, which we don't override, nor the domain).
- **Session cache:** the server reads the session from the signed `local.session_data` cookie for
  up to 300 s (`sessionDataTtl`, the default) before asking Neon Auth again. Access still ends at
  once when someone's `admin_user` row is deleted, because the allowlist is read on every admin
  request; the cache only spares the call to Neon Auth.
- **No middleware:** the SDK's `.middleware()` adds only the OAuth `neon_auth_session_verifier`
  exchange after the Google redirect. The browser client (`createAuthClient()` from
  `@neon/auth/next`) does the same exchange in its `get-session` call through our handler. So
  `requireAdmin()` on every page, `requireAdminForAction()` on every action, and the handler are
  enough; there is no `proxy.ts`.
- **No cookie writes while rendering a page:** if Neon Auth's `get-session` answers with
  `Set-Cookie`, the SDK calls `cookies().set()`, which Next forbids in a Server Component. In
  Better Auth 1.7 that happens on a session refresh (once `updateAge` has passed), when it clears
  an expired or revoked session, and when it expires a stale cache cookie. `readSession()` passes
  `query: { disableRefresh: "true" }`, which the SDK forwards as a query parameter, so a server
  read never refreshes. Refreshes happen through the browser client's `get-session` calls to our
  handler, which may set cookies. The clearing writes can still come, and so can a Better Auth
  cookie-cache refresh (`cookieRefreshCache`, which runs before `disableRefresh` is looked at) if
  Neon Auth enables it. Next then throws its read-only cookies error, and `readSession()` reads
  that as signed out (deny by default) and logs one `auth_session_cleared` line with the request
  id, so an expired session sends people to sign in rather than reporting an outage, and a valid
  session refused this way shows in the logs. Server actions and
  route handlers may write cookies, so there the SDK clears them normally.
- **CSRF:** the SDK forwards the request's Origin to Neon Auth, where Better Auth checks it
  against the Neon Auth trusted domains. Next server actions compare Origin with Host or
  `x-forwarded-host`. The cookies are `SameSite=Lax`. Nothing custom.
- **Workers and OpenNext:** the SDK's server entry imports only `jose`, `better-auth/cookies`,
  `next/headers` and `next/server`, and uses `fetch` and WebCrypto with no `node:` built-ins, so it
  should run on the Node.js runtime with `nodejs_compat`. Slice `hosting` bundled it with
  `cf:build`, and under `cf:preview` without env `/api/auth/*` answers `503` as `next start` does.
  A real sign-in on the Worker is still unproven.
- **Rate limits:** not documented, not relied on. Checked 2026-11-04: Neon Auth's
  `production-checklist.md` and `overview.md` mention only the rate limit of the shared SMTP
  sender, which we don't use. The backup is a Cloudflare WAF rate-limit rule on `/api/auth/*`.
  Sign-in is Google only, so there is no password to guess through our app.

## Hosting findings (slice `hosting`, 2026-11-10)

First measured on 2026-11-04 on the static site, then measured again on 2026-11-10 after merging
`main` with the backend (Neon, Neon Auth, the admin, route handlers and the `use cache` reads).
The figures below are from the second run.

Versions (since job 011, 2026-11-11): `next` 16.4.5, `@opennextjs/cloudflare` 1.20.16 (with
`@opennextjs/aws` 4.1.15) and `wrangler` 4.159.0 (workerd 1.20261109.1). `next` and the adapter
are pinned exactly. The measurements from "Under `pnpm cf:preview`" on were taken by job 003 on
`next` 16.4.3 with the adapter held at 1.20.15 (with `@opennextjs/aws` 4.1.14); "Job 011" at
the end of this section repeats them on the current versions. Docs read: <https://opennext.js.org/cloudflare> and its
pages on getting started, caching, images, the CLI, env vars and dev and deploy.

Under `pnpm cf:preview` with no `.dev.vars` (so no database and no Neon Auth), the same `.next`
build was compared with `next start`, within minutes of the build:

- `/`, `/laundry`, `/shop`, `/about`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`,
  `/favicon.ico`, `/icon.svg`, `/apple-icon`, `/api/health` and a 404 page gave the same status,
  content type and byte-identical bodies.
- `/egikomba` gave `308` to `/shop` on both servers (`next start` adds a 5-byte body).
- `/api/products`, `/api/products/<code>` and `/api/auth/get-session` gave the same `503` JSON on
  both; only the `requestId` differs. `/admin` gave the same `307` to sign-in.
- `/admin/*` responses carry the same `X-Frame-Options`, `Content-Security-Policy`,
  `Referrer-Policy` and `Cache-Control: private, no-store` headers on both: `next.config.ts`
  headers apply to what the Worker renders. No admin path is in `.open-next/assets`.
- Admin writes: `adminRoute`'s same-origin check sees the same host under the Worker. See "Server
  actions" below.
- Differences, recorded here and not fixed in app code:
  - Every `/shop/<code>` page fails under the Worker: `/shop/not-a-code`, the prerendered
    `/shop/placeholder` and `/shop/SM-1003` all answer `500 text/plain` with workerd's "Worker's
    code had hung" error, where `next start` answers the 404 page or `error.tsx`. See
    `cacheComponents` below.
  - On the partly prerendered admin pages (`/admin/sign-in`, `/admin/products`), the dynamic part
    fails on the server and React renders it in the browser instead. The page still shows the same
    thing, but its server HTML differs from `next start`.
  - Cached pages never refresh. See `cacheComponents`.
  - The public pages break once the build is an hour old. `/`, `/laundry`, `/shop` and `/about`
    have a 1-hour expire (`next build` prints it). The next day, a fresh `cf:preview` of the same
    build answered `500` for all four, with the same "hung" error, and after a few of those the
    local Worker stopped answering pages at all (requests timed out after 30 s; `/api/health`
    still answered). `next start` kept answering `200`.
- The Playwright suite, run within the hour: 93 passed, 1 flaky, 2 failed. The 2 failures are the
  two `e2e/product-page.spec.ts` tests (the `/shop/<code>` failure above). The flaky one,
  `e2e/home.spec.ts` "hero button opens the booking page", passed on retry. A rerun of
  `product-page.spec.ts` and `home.spec.ts` the next day failed the home specs too, for the reason
  above.

Feature support:

- **`cacheComponents`: Gap.** The docs' feature list marks Partial Prerendering and Composable
  Caching (`'use cache'`) as supported, but not with the cache this slice set up, and not reliably
  under workerd:
  - `use cache` reads miss every time. The installed
    `dist/api/overrides/incremental-cache/static-assets-incremental-cache.js` throws "Composable
    cache is not supported in static assets incremental cache" in `get` (caught, logged as "Failed
    to get from cache", treated as a miss) and only logs in `set` ("Failed to set to read-only
    cache … type=composable"). So `getLiveShopSettings`, `getLiveLaundryItems`,
    `getCachedPublicProduct` and `getCachedSitemapCodes` would read Neon on every request, with
    error lines in the logs.
  - Prerendered pages never refresh. `/`, `/laundry`, `/shop`, `/about` and `/sitemap.xml` are
    prerendered with a 30-second (sitemap 60-second) revalidate because they hold the settings
    and laundry reads. Once stale, the Worker tries to regenerate them through the queue and logs
    "Failed to revalidate stale page … Dummy queue is not implemented", then keeps serving the
    build's copy with `Cache-Control: s-maxage=2, stale-while-revalidate=2592000`. The dummy tag
    cache also ignores `revalidateTag`. So settings, laundry prices and products saved in the admin
    would not reach these pages until the next deploy, and a build without a database bakes in the
    fallback defaults.
  - Dynamic holes in partly prerendered pages fail. workerd logs Next's "cannot guarantee that
    Cache Components will run as expected due to the current runtime's implementation of
    `setTimeout()`" and React's "Expected the resume to render <io> in this slot but instead it
    rendered <io2>". On `/admin/*` React falls back to rendering in the browser. On
    `/shop/[code]` (`ensureStatic = "navigation"`), and on every public page once its
    prerendered copy has expired, the request hangs until workerd cancels it. Job 011 found the
    same on `next` 16.4.5 and the adapter 1.20.16, and narrowed it only partly: the
    `setTimeout()` warning is Next's own runtime check, and the file that issues it
    (`dist/server/app-render/app-render-scheduling.js`) is unchanged from 16.4.3 to 16.4.5; the
    read-only cache still refuses every `use cache` entry. Whether the hang comes from the
    read-only cache or from workerd's timers is still open, and is settled only by running with
    the shared cache (job 010).
  - The trigger for R2 and a tag cache has fired: on-demand revalidation (`revalidateTag` on every
    admin save) is in `main`. That work, and proving `/shop/<code>` works, is the
    [0002](0002-server-cached-public-reads.md) "Checklist for the Cloudflare slice" (job 010).
    Until then, this setup is not fit for the live site. On top of that checklist, job 010 must:
    - (a) prove under `cf:preview` that the full Playwright suite passes against a build more
      than one hour old (same build, `.open-next/` untouched since `cf:build`), not only right
      after the build;
    - (b) switch to 0002's named fallback if, with the shared incremental cache and the tag cache
      in place, `/shop/<code>` still hangs or answers `500` where `next start` doesn't, or any
      public page fails once the build is over an hour old. The fallback is to drop `use cache`
      for every server read in 0002's table: `getLiveShopSettings`, `getLiveLaundryItems`,
      `getCachedPublicProduct` and `getCachedSitemapCodes`.
- **`partialPrefetching`: Supported with caveat.** The docs don't name it. It is a client router
  and prerender feature, and the adapter has no special handling for it. Seen under `cf:preview`:
  the page responses carry the same `Vary: rsc, next-router-state-tree, next-router-prefetch,
  next-router-segment-prefetch` header as `next start`, and the navigation specs pass.
- **`typedRoutes`: Supported.** It only exists at build time (`next typegen` and the type check
  inside `next build`), so nothing of it reaches the Worker. Seen: `pnpm cf:build` ran the type
  check and passed.
- **Custom image loader: Supported with caveat.** The docs (`/cloudflare/howtos/image`) say
  image optimization needs "either … an image binding or … a custom loader". With our loader,
  images go straight to `images.unsplash.com` and no `IMAGES` binding is needed. Seen: the `/shop`
  specs load the Unsplash images. The caveat: the Worker still answers `/_next/image` itself
  (`.open-next/worker.js`). It serves local files unoptimized and returns `400` for remote URLs,
  because `remotePatterns` is empty. `next start` returns `404` there. Nothing links to it.
- **Server actions: Supported with caveat.** The docs list App Router and SSR on the Node.js
  runtime and don't call out server actions. The repo still has none (`"use server"` appears
  nowhere): admin writes go through route handlers wrapped in `adminRoute`, and Neon Auth's own
  handler at `/api/auth/[...path]`. On the Origin and Host check, Next's
  `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`
  says Next compares `Origin` with `x-forwarded-host` or `host`, and that no
  `serverActions.allowedOrigins` entry is needed when the proxy forwards the public host. The
  installed `@opennextjs/aws` `dist/core/requestHandler.js` copies `x-forwarded-host` into `host`
  before Next sees the request, so the two can't disagree. `adminRoute`'s own check
  (`src/lib/api.ts`, `isSameOrigin`) compares the same pair. Seen under `cf:preview`: a `POST` to
  `/api/admin/products` with `Origin` set to the preview's own origin gets past the check (it is
  then refused with `503 AUTH_UNAVAILABLE`, as there is no Neon Auth), and one with another origin
  gets `403 FORBIDDEN`, the same as under `next start`. Neon
  Auth's trusted-origin check needs a live Neon Auth, so it is proven only by a sign-in on the
  preview Worker.

Static assets:

- Workers Static Assets serves files without running the Worker, so `next.config.ts` headers
  don't apply to them. Their headers come from `public/_headers`, which OpenNext copies into
  `.open-next/assets/`. It sets two things:
  - `/favicon.ico`: `Content-Type: image/x-icon`. Static Assets would otherwise send
    `image/vnd.microsoft.icon` (same bytes), where `next start` sends `image/x-icon`, and
    `e2e/seo.spec.ts` "logo icons, manifest, sitemap and robots are served" checks for it.
  - `/_next/static/*`: `Cache-Control: public,max-age=31536000,immutable`, as the adapter's
    caching docs recommend. This matches what `next start` sends. Without it, Static Assets sends
    `max-age=0, must-revalidate`.
- Serving the favicon from the Worker instead (`assets.run_worker_first`) is not a fix: the
  Worker corrupts the binary body (bytes above 0x7f become U+FFFD).
- Side effect on `next start`: it serves the file itself at `/_headers` (two lines of public
  header rules, nothing secret). The Worker doesn't serve it (404).
- Static JS goes out as `text/javascript` instead of `application/javascript`. It is the same
  file, and browsers treat both types the same.

Other choices:

- **Incremental cache.** It is the read-only static-assets cache
  (`open-next.config.ts`), with no tag cache and no queue (the adapter's `dummy` defaults) and no
  R2 or KV. Cache interception stays off, because the caching docs say it doesn't work with PPR.
  The trigger for R2 is on-demand revalidation, which `main` now has (see `cacheComponents`).
- **Dev hook.** `initOpenNextCloudflareForDev()` is not added and `next.config.ts` is unchanged.
  The docs (get started step 12, and `/cloudflare/howtos/dev-deploy`) say the hook lets `next dev`
  reach bindings through `getCloudflareContext`. The repo has no bindings and doesn't call that
  function. `cf:build` and `cf:preview` work without it.
- **`.env` files.** `opennextjs-cloudflare build` copies the values in `.env`, `.env.local` and
  `.env.production*` into the bundle (`dist/cli/utils/extract-project-env-vars.js`), and the
  Worker falls back to them for any variable Wrangler doesn't set (`dist/cli/templates/init.js`).
  So `pnpm cf:build` runs `scripts/check-no-env-files.mjs` first, which stops the build when the
  repo root holds any `.env*` file other than `.env.example`.
- **Worker size.** On `next` 16.4.5 and the adapter 1.20.16 (job 011), `wrangler deploy
  --dry-run` reports `Total Upload: 18292.85 KiB / gzip: 4125.51 KiB`. That is 4.03 MiB
  compressed: over the Free limit (3 MiB) and under the Paid limit (10 MiB) with 5.97 MiB to
  spare. Job 003 measured `18553.36 KiB / gzip: 4145.49 KiB` on the old versions, the same for
  `--env preview`. The static site measured 2172.44 KiB gzip; Drizzle, the Neon driver, Neon
  Auth, the storage client and the admin roughly doubled it.
- **Workers Paid needed: yes**, because the Worker is over the Free plan's 3 MiB size limit, and
  because of CPU.
  - Every page request runs the Worker: the prerendered HTML sits in `cdn-cgi/_next_cache`, which
    only the Worker can read, and the Next server streams it out.
  - Warm requests for the four pages and the sitemap took 10 to 34 ms wall time in local workerd
    on the static site, and 270 ms to 1.3 s on the first requests after the merge. A cold
    isolate's first request took 35 s locally.
  - workerd doesn't report CPU time locally, so nothing shows these requests staying under the
    Free plan's 10 ms of CPU. At that wall time they are likely to go over it often, and on Free
    a request over the cap fails.
  - Confirm with the CPU time in Workers Logs after the first preview deploy.

### Job 011: `next` 16.4.5 and the adapter 1.20.16 (2026-11-11)

Job 011 moved `next` from 16.4.3 to 16.4.5 and `@opennextjs/cloudflare` from 1.20.15 to 1.20.16
(`@opennextjs/aws` 4.1.14 to 4.1.15), to see whether the problems above are fixed upstream. The
release-age policy accepted both. `react`, `react-dom` and `wrangler` are unchanged, and no app
code changed. The adapter's `templates/wrangler.jsonc` is byte-identical between 1.20.15 and
1.20.16, so only the version in the comment at the top of `wrangler.jsonc` changed.

Method: `pnpm cf:build` (finished 10:46:27 UTC), then `pnpm cf:preview` with no `.dev.vars` and
`next start` on the same `.next` build, measured from 10:47 UTC, within two minutes of the build.
The Worker's console output was read from Wrangler's local observability store. A real in-stock
code was not measured: there is no database in the preview.

| Path                                | `next start`                  | Worker, within the hour                   |
| ----------------------------------- | ----------------------------- | ----------------------------------------- |
| `/`, `/laundry`, `/shop`, `/about`  | `200 text/html`, same bytes   | `200 text/html`, same bytes               |
| `/shop/not-a-code`                  | `404 text/html`               | `500 text/plain` (hung)                   |
| `/shop/placeholder`                 | `404 text/html`               | `404 text/html`, same bytes               |
| `/shop/SM-1003`                     | `500 text/html` (`error.tsx`) | `500 text/plain` (hung)                   |
| `/admin`                            | `307` to `/admin/products`    | `307` to `/admin/products`                |
| `/admin/sign-in`, `/admin/products` | `200 text/html`               | `200 text/html`, missing the dynamic part |

Problems, each judged by whether the Worker answers what `next start` answers on the same build
and the related log line is gone:

1. **Not fixed.** `/shop/<code>` answers `500` because the request hangs. `/shop/not-a-code` and
   `/shop/SM-1003` give workerd's "Worker's code had hung" error, after "Failed to get from
   cache" and the `setTimeout()` warning. `/shop/placeholder` now matches `next start` within the
   hour, because it is served from its prerendered copy. Both `e2e/product-page.spec.ts` tests
   fail, and after a few hung requests `/shop/not-a-code` got no answer at all within 45 s while
   `/` still answered `200`.
2. **Not fixed.** The public pages answer `500` once the build is over an hour old. The hour-later
   run on the build above was not measured in job 011 (stopped on the owner's instruction); job
   010 must prove it. Evidence from an earlier build of the same commit (`cf:build` finished
   07:05:18 UTC; the machine was suspended in between): a fresh `cf:preview` at 10:44 UTC, 3 h 39
   min after that build, answered `500 text/plain` (hung) for `/`, `/laundry`, `/shop`, `/about`
   and `/shop/placeholder`, where `next start` on the same `.next` answered `200` and `404`.
3. **Not fixed.** `use cache` misses with the composable cache: every read logs "Failed to get
   from cache … Composable cache is not supported in static assets incremental cache" and
   "Failed to set to read-only cache … type=composable". Expected: the read-only cache refuses
   composable entries by design, in 1.20.16 too. The keys are now 64-character hashes (the
   `@opennextjs/aws` 4.1.15 fix below).
4. **Not fixed.** Stale pages never regenerate: the first request to each of `/`, `/laundry`,
   `/shop`, `/about`, `/shop/placeholder` and `/sitemap.xml` logs "Failed to revalidate stale
   page … FatalError: Dummy queue is not implemented".
5. **Not fixed.** Admin pages fall back to client rendering: `/admin/sign-in` and
   `/admin/products` log "Expected the resume to render <io> in this slot but instead it
   rendered <io2>". The Worker's HTML lacks the streamed part `next start` sends (the sign-in
   button on `/admin/sign-in`, 26,902 bytes against 32,064; the redirect to
   `/admin/sign-in?reason=AUTH_UNAVAILABLE` on `/admin/products`, 24,452 bytes against 27,605).
   The browser still gets the redirect from the page's data.

Playwright against the preview:

- Within the hour: the full suite was not completed. A first full run was spoiled by the machine
  suspending mid-run, and the second was stopped on the owner's instruction to keep the job
  fast. Instead `e2e/product-page.spec.ts` and `e2e/home.spec.ts` ran on the build above at
  10:48 UTC: **8 passed, 2 failed** (both `product-page.spec.ts` tests, `page.goto` aborted after
  the 90 s timeout). The home specs passed.
- More than an hour after the build: not measured in job 011. Job 010 must prove the full suite
  passes then (see `cacheComponents` above).

Release notes read for fixes to these problems:

- `next` [v16.4.4](https://github.com/vercel/next.js/releases/tag/v16.4.4): "Emit the Turbopack
  shared-runtime bootstrap in the PPR resume so it gets the CSP nonce" touches the PPR resume but
  is about the CSP nonce, not a hang or the resume mismatch. No other relevant fix.
- `next` [v16.4.5](https://github.com/vercel/next.js/releases/tag/v16.4.5) (security release):
  "Cache poisoning of shared fallback shells in Cache Components via request-supplied
  placeholder route params"
  ([GHSA-vvgp-ww4w-46vf](https://github.com/vercel/next.js/security/advisories/GHSA-vvgp-ww4w-46vf))
  and the `use cache` key advisories touch `generateStaticParams` routes and `use cache`, but
  are security fixes; none addresses the hang, the `setTimeout()` warning, the resume mismatch
  or regeneration.
- `next` [v16.4.6](https://github.com/vercel/next.js/releases/tag/v16.4.6): none found. No
  reason to bump to it for these problems.
- `@opennextjs/cloudflare`
  [1.20.16](https://github.com/opennextjs/opennextjs-cloudflare/releases/tag/%40opennextjs/cloudflare%401.20.16):
  "encode cache keys in the static assets incremental cache and the regional cache" touches the
  static-assets cache, but only how keys become URLs; composable entries are still refused. The
  rest (`run_worker_first` assets check, AVIF/HEIC detection, the `next >=16.4.5` floor) don't
  touch these problems.
- `@opennextjs/aws` [4.1.15](https://github.com/opennextjs/opennextjs-aws/releases/tag/v4.1.15):
  "use a hash of the composable cache key as storage key" touches the composable cache, and "do
  not route requests with dynamic segment placeholder values" touches routes like
  `/shop/[code]`. Neither fixes a miss, a hang or regeneration.

Worker size: `Total Upload: 18292.85 KiB / gzip: 4125.51 KiB` (17.86 MiB, 4.03 MiB gzip), down
19.98 KiB gzip from 4145.49 KiB; 5.97 MiB under the Paid limit (10 MiB).

## Open, filled in by later slices

- Neon Auth's trusted-origin check behind Cloudflare: sign in on the preview Worker (job 010 and
  the first deploy). Next's server-action check and `adminRoute`'s check are covered in "Hosting
  findings".
