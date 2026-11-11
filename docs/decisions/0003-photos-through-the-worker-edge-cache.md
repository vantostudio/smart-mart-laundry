# 0003 — Photos through the Worker's edge cache

Status: **Accepted**, 2026-11-12. Settles the storage question that
[0001](0001-neon-and-neon-auth-on-cloudflare.md) deferred.

## Context

- Product and laundry photos live in Neon Object Storage (the `products` bucket in `neon.ts`).
  Neon has no CDN and a 5 GB/month transfer cap, so every view straight from the bucket counts
  against it, and real customers are arriving.
- Photo addresses held the Neon endpoint, which differs per branch.

## Options

- **A proxied DNS record (`photos.` CNAME to Neon) with Origin Rules.** Neon's endpoint may sit
  behind Cloudflare itself (error 1014), Host and SNI overrides depend on the plan, path-style S3
  needs the right Host, and it is a second domain with nothing to test in the repo.
- **A Next route handler on Workers.** Runs the full Next router per photo (more CPU and latency),
  and request-time handling in workerd already needed workarounds (0001).
- **The Worker entry with the Cache API.** Nothing new to provision or pay for.
- **Moving photos to R2** with a public custom domain. Best long term, but R2 isn't enabled on
  the account today.

## Decision

The Worker entry (`cloudflare/worker.mjs`) answers `/photos/*` before OpenNext with
`servePhoto` (`src/lib/photo-proxy.ts`), through `caches.default`. Photos are cached for a year
(keys are never reused), misses on well-formed keys for 60 s, and upstream failures never.
`X-Photo-Cache` shows HIT or MISS. Every other request reaches OpenNext untouched. A Next route
handler at `src/app/photos/[...key]` runs the same function under `next dev` and `next start`.

Every photo address is the same-site path `/photos/<key>`: no DNS, no CORS, and the same on
production, preview and local. Addresses are relative in data and API responses, and made
absolute only where a crawler needs them (JSON-LD; Open Graph uses `metadataBase`).

The bucket stays `public_read`, so old addresses in saved bags, cached pages and copied links keep
working and a rollback stays safe. Making it private (the proxy signing its reads) is the
follow-up if Neon's usage shows direct traffic.

## Costs

Photo requests count as Worker requests on Workers Paid, already paid: USD 5/month with 10 M
requests included, then USD 0.30 per million. About a millisecond of CPU per photo request. A
cache hit costs Neon nothing.

## Revisit when

- R2 is enabled: move photos there with a public custom domain, so they never invoke the Worker
  and egress is free.
- Worker requests head toward the included 10 M a month.
- We need Tiered Cache (it doesn't apply to the Cache API) or resizing beyond the thumbnail and
  the full photo.
