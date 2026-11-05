# 0002 — Server-cached public reads (settings, product pages, sitemap)

Status: **Accepted**, 2026-11-05. Changes the rule "public pages never touch the database" in
[0001](0001-neon-and-neon-auth-on-cloudflare.md).

## Context

- Google needs HTML with the product in it, and a real address per product. Until now products
  loaded only in the browser, and the only address was the sheet at `/shop?item=SM-1003`.
- The phone and hours staff set in `/admin/settings` reached visitors only after the page loaded,
  while static HTML and search data (JSON-LD) held the code defaults. The owner wants the page, the
  search data and the admin to agree.

## Decision

Three things read the database on the server, each through a `use cache` function with
`cacheTag`, `cacheLife` and a writer that calls `revalidateTag(tag, { expire: 0 })`. Everything
else on public pages stays client-loaded from `/api/products` and `/api/products/[code]`.

| Read           | Where                                    | Tag        | Backstop life     | Expired by                                    |
| -------------- | ---------------------------------------- | ---------- | ----------------- | --------------------------------------------- |
| Shop settings  | `getLiveShopSettings`, site layout       | `settings` | `hours` (1 h)     | `PATCH /api/admin/settings`                   |
| One product    | `getCachedPublicProduct`, `/shop/[code]` | `products` | `minutes` (1 min) | create, edit, delete in `/api/admin/products` |
| In-stock codes | `getCachedSitemapCodes`, `sitemap.ts`    | `products` | `hours`           | same                                          |

- **How long a change takes:** the save request expires the tag before it answers, so the next
  request to the site renders fresh (a blocking read, one query). Anything already open in a
  browser keeps its old copy until the next page load; the client router's cache holds a
  navigated page for up to 5 minutes (`stale`). Without a working tag store the backstop applies:
  up to 1 hour for settings and 1 minute for a product page.
- **Failure is never cached long:**
  - Settings: no env or a failed query (4 s timeout) gives `defaultShopSettings`, kept for 30
    seconds (`revalidate: 30`), so the live values return when the database does. This is also
    what `next build` bakes in with no secrets. A Neon outage can never take the site down.
  - Product: a missing or sold-out piece (`null`) is a real answer and is cached under the tag. A
    database or storage failure throws, and Next does not cache a throw, so an outage is never a
    cached "not found". The page then shows `error.tsx` ("We couldn't load this item", Try again,
    back to the shop) with status 500.
  - Sitemap: no env or a failure lists the fixed pages only, kept 60 seconds.
- **Status codes:** `/shop/[code]` awaits `params` at the top (not in `<Suspense>`) and calls
  `notFound()` before anything streams, so sold out, deleted and malformed codes are a true 404.
  `generateStaticParams` returns one sample that is not a valid code (Cache Components needs at
  least one), so the build touches no database; real codes are rendered on first visit and cached.
- **Search data:** `businessJsonLd(settings)` takes the live phone and hours. There is one source
  of truth, the `shop_settings` row; `src/config/shop-settings.ts` is only the fallback.
- `GET /api/settings` was removed: nothing reads settings in the browser any more.
- `sitemap.ts` is a route handler, which may call `use cache` functions. It has no `lastModified`
  because `product` stores only `created_at`, which is not a modification date.

## Checklist for the Cloudflare slice (`hosting`)

`use cache` keeps entries in memory by default, and a Worker isolate is short-lived. Without a
shared store, every request would read Neon again, and `revalidateTag` in one isolate would not
reach the others. So, when adding OpenNext:

- [ ] Set up the OpenNext incremental cache (R2 or KV bucket binding) and a tag cache (D1 or the
      Durable Object sharded tag cache) in `open-next.config.ts` and `wrangler.jsonc`, plus the
      queue/self-reference bindings that revalidation needs. Check the OpenNext docs for the
      current names; they have changed between releases.
- [ ] Confirm that this OpenNext version supports Next 16 `cacheComponents` and `use cache` with
      `revalidateTag(tag, { expire: 0 })`. If it does not, the fallback is to drop `use cache` for
      `unstable_cache` with the same tags, or accept one indexed Neon query per request for these
      three reads. The pages still work either way; only the speed and the freshness guarantee
      change.
- [ ] Prove it under `cf:preview`: save a setting and see the footer phone change on the next
      request; set a product's stock to 0 and see `/shop/<code>` return 404 and drop out of
      `/sitemap.xml` without a deploy.
- [ ] Give the Worker `DATABASE_URL` and the `AWS_*` values as secrets (the product page needs
      both); `next build` in CI needs none.
- [ ] Measure the Worker bundle: the product page adds `drizzle-orm` and the Neon driver to the
      page route, which already shipped for the API routes.
- [ ] Never set `export const runtime = "edge"`; add no `proxy.ts`.
- [ ] After go-live, submit `https://streetmart.africa/sitemap.xml` in Google Search Console and
      check a product page in the Rich Results Test.
