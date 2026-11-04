# 0001 — Neon Postgres and Neon Auth on Cloudflare Workers

Status: **Accepted**, 2026-11-03. Plan: `.factory/plans/001-backend-auth-for-admins-on/plan.md`.

## Context

- This is the first backend in the repo. Until now the site has been static data, with orders
  sent over WhatsApp and nothing stored beyond the visitor's own `localStorage`.
- 3 to 5 named Street Mart staff must sign in to a private `/admin` area.
- The site is moving to Cloudflare (slice `hosting` adds the config).
- The public pages stay static and never touch the database.
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

- **Workers Paid (USD 5 a month)** is needed. The Worker fits the Free plan's size cap (2.12 MiB
  gzip of 3 MiB), but every page request runs the Next server inside the Worker, which doesn't
  fit the Free plan's 10 ms CPU cap. See "Hosting findings".
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

## Hosting findings (slice `hosting`, 2026-11-04)

Versions: `@opennextjs/cloudflare` 1.20.15 (with `@opennextjs/aws` 4.1.14) and `wrangler` 4.156.2
(workerd 1.20261102.1). The adapter is pinned exactly to 1.20.15: 1.20.16 needs `next >=16.4.5`,
and the repo pins `next` 16.4.3. 1.20.12 to 1.20.15 accept `next >=16.4.1`. Docs read:
<https://opennext.js.org/cloudflare> and its pages on getting started, caching, images, the CLI,
env vars and dev and deploy.

Under `pnpm cf:preview`, the same `.next` build was compared with `next start`:

- `/`, `/laundry`, `/shop`, `/about`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`
  and a 404 page gave the same status, content type and byte-identical bodies.
- `/egikomba` gave `308` to `/shop` on both servers.
- The Playwright suite passed (64 passed), once `public/_headers` was added (see "Static
  assets" below).

Feature support:

- **`cacheComponents`: Supported with caveat.** The docs' feature list marks Partial
  Prerendering and Composable Caching (`'use cache'`) as supported. The caveat is in the installed
  `dist/api/overrides/incremental-cache/static-assets-incremental-cache.js`, which throws
  "Composable cache is not supported in static assets incremental cache". The repo has no
  `"use cache"` today. Adding one needs the R2 cache. Seen under `cf:preview`: all four pages
  are prerendered shells, and the HTML matches `next start` byte for byte.
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
  runtime and don't call out server actions. The repo has none, so nothing was seen under
  `cf:preview`. On the Origin and Host check, Next's
  `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`
  says Next compares `Origin` with `x-forwarded-host` or `host`, and that no
  `serverActions.allowedOrigins` entry is needed when the proxy forwards the public host. The
  installed `@opennextjs/aws` `dist/core/requestHandler.js` copies `x-forwarded-host` into `host`
  before Next sees the request, so the two can't disagree. On a custom domain, the Worker's
  `host` is `streetmart.africa`. The live check stays with slice `admin-shell`.

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
  The trigger for R2 is on-demand revalidation.
- **Dev hook.** `initOpenNextCloudflareForDev()` is not added and `next.config.ts` is unchanged.
  The docs (get started step 12, and `/cloudflare/howtos/dev-deploy`) say the hook lets `next dev`
  reach bindings through `getCloudflareContext`. The repo has no bindings and doesn't call that
  function. `cf:build` and `cf:preview` work without it.
- **Worker size.** `wrangler deploy --dry-run` reports `Total Upload: 8932.08 KiB / gzip:
  2172.44 KiB`, the same for `--env preview`. That is 2.12 MiB compressed: under the Free
  limit (3 MiB) with 0.88 MiB to spare, and well under the Paid limit (10 MiB).
- **Workers Paid needed: yes**, because of CPU, not size.
  - Every page request runs the Worker: the prerendered HTML sits in `cdn-cgi/_next_cache`, which
    only the Worker can read, and the Next server streams it out.
  - Warm requests for the four pages and the sitemap took 10 to 34 ms wall time in local workerd.
    A cold isolate's first request took seconds.
  - workerd doesn't report CPU time locally, so nothing shows these requests staying under the
    Free plan's 10 ms of CPU. At that wall time they are likely to go over it often, and on Free
    a request over the cap fails.
  - Confirm with the CPU time in Workers Logs after the first preview deploy.

## Open, filled in by later slices

- Whether Neon Auth rate-limits sign-in (slice `auth-core`).
- The exact Neon Auth package and variable names (after `neon deploy`).
