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

- Likely **Workers Paid (USD 5 a month)**: OpenNext bundles of a Next 16 app usually exceed the
  Free plan's 3 MiB compressed size cap, and SSR exceeds its 10 ms CPU cap. Slice `hosting`
  measures the bundle and confirms this.
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
  handler, which may set cookies. The clearing writes can still come; Next then throws its
  read-only cookies error, and `readSession()` reads that as signed out (deny by default), so an
  expired session sends people to sign in rather than reporting an outage. Server actions and
  route handlers may write cookies, so there the SDK clears them normally.
- **CSRF:** the SDK forwards the request's Origin to Neon Auth, where Better Auth checks it
  against the Neon Auth trusted domains. Next server actions compare Origin with Host or
  `x-forwarded-host`. The cookies are `SameSite=Lax`. Nothing custom.
- **Workers and OpenNext:** the SDK's server entry imports only `jose`, `better-auth/cookies`,
  `next/headers` and `next/server`, and uses `fetch` and WebCrypto with no `node:` built-ins, so it
  should run on the Node.js runtime with `nodejs_compat`. Not yet proven with `cf:build`, because
  slice `hosting` is parked.
- **Rate limits:** not documented, not relied on. Checked 2026-11-04: Neon Auth's
  `production-checklist.md` and `overview.md` mention only the rate limit of the shared SMTP
  sender, which we don't use. The backup is a Cloudflare WAF rate-limit rule on `/api/auth/*`.
  Sign-in is Google only, so there is no password to guess through our app.

## Open, filled in by later slices

- OpenNext support for `cacheComponents`, `typedRoutes`, the custom image loader and server
  actions, and the measured Worker bundle size (slice `hosting`).
