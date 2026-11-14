# Running the admin

For the owner who runs streetmart.africa day to day: setting it up, staff, getting back in, database
changes, rolling back, secrets, logs and the Cloudflare rules. It describes the site as it runs
today. The full setup steps are in the README
([Run on Cloudflare](../README.md#run-on-cloudflare-workers-via-opennext) and
[Admin, database and hosting](../README.md#admin-database-and-hosting)); why Neon and Neon Auth is
in [`decisions/0001`](decisions/0001-neon-and-neon-auth-on-cloudflare.md).

This file names secrets but never holds their values. Values live in Wrangler, in your local
`.dev.vars` and `.env.local` (both gitignored), and in the Neon console.

## 1. Provisioning recap

**Neon.** One project with two branches:

- `dev`: local work and the preview Worker (`street-mart-preview`).
- `main`: production, the live Worker (`street-mart`). Older notes, including README steps 4 and 5,
  call it `production`; it is `main`.

**Google sign-in.** Today Neon Auth uses Neon's shared Google keys. To switch to our own Google
OAuth client (README step 3):

1. In Google Cloud, create a web OAuth client. Add the redirect URIs Neon Auth asks for, for
   production, the preview `workers.dev` origin and localhost.
2. Put its client id and secret into Neon Auth, on `main` and on `dev`.
3. Turn on Google as the only provider.
4. Sign in on the preview Worker, then on the live site, to check.

**Neon Auth trusted origins.** `main` trusts `https://streetmart.africa` and
`https://www.streetmart.africa`. The preview `workers.dev` origin, `http://localhost:3000` and
`http://localhost:8787` belong on `dev`. To see the list:

```sh
pnpm dlx neon@latest neon-auth domain list --branch main
```

**Wrangler secrets.** Set each with `pnpm exec wrangler secret put <NAME>` for production, and
`pnpm exec wrangler secret put <NAME> --env preview` for the preview Worker.

| Name                      | Where the value comes from                                         | Production (`main`) | `--env preview` (`dev`) |
| ------------------------- | ------------------------------------------------------------------ | ------------------- | ----------------------- |
| `DATABASE_URL`            | Neon, the branch's pooled connection string                        | `main` value        | `dev` value             |
| `NEON_AUTH_BASE_URL`      | Neon Auth on the branch, used as written                           | `main` value        | `dev` value             |
| `NEON_AUTH_COOKIE_SECRET` | Ours: `openssl rand -base64 32`, a different value per environment | its own value       | its own value           |
| `AWS_ACCESS_KEY_ID`       | Neon Object Storage on the branch                                  | `main` value        | `dev` value             |
| `AWS_SECRET_ACCESS_KEY`   | Neon Object Storage on the branch                                  | `main` value        | `dev` value             |
| `AWS_ENDPOINT_URL_S3`     | Neon Object Storage on the branch                                  | `main` value        | `dev` value             |
| `AWS_REGION`              | Neon Object Storage on the branch                                  | `main` value        | `dev` value             |

`DATABASE_URL_UNPOOLED` (the branch's direct connection string) is not a Worker secret. Only the
`db:*` scripts on your machine use it.

**Local files.** `.dev.vars` holds the `dev` values for `pnpm cf:preview` (local workerd).
`.env.local` holds them for `pnpm dev` and the `db:*` scripts. Both are gitignored; never commit
them. `.env.example` lists the names.

**Building.** `pnpm cf:build` refuses to run while any `.env*` file other than `.env.example` sits
in the repo root, because OpenNext would copy its values into the Worker. Move `.env.local` out of
the repo root while you build, and put it back after.

## 2. First owner

Add the first owner on `dev`, then on production (`main`):

```sh
pnpm db:seed-owner justmogen.dev@gmail.com
```

**Which database it uses.** The script reads `DATABASE_URL_UNPOOLED`, else `DATABASE_URL`. A
variable set in your shell wins over `.env.local`. With `.env.local` holding the `dev` values, the
plain command above seeds `dev`. To seed `main`, copy the direct `main` connection string from the
Neon console and pass it inline, for that one command only:

```sh
DATABASE_URL_UNPOOLED='<direct main connection string>' pnpm db:seed-owner justmogen.dev@gmail.com
```

Never save the `main` string in the repo or in `.env.local`.

**Check which branch you hit.** The host in the connection string (the part after `@`) names the
Neon endpoint. Compare it with the branch's connection details in the Neon console before you run
the command.

**What it prints.**

- `Owner <email> added.`: the email is now an owner.
- `Owner <email> already exists; nothing changed.`: the email was already on the list, as owner or
  as admin. The script never changes an existing row, so an email listed as `admin` stays `admin`
  (see [Lockout recovery](#4-lockout-recovery)).

## 3. Adding and removing staff

Owners do this at `/admin/settings`, under Staff:

- **Add:** the person's Google email, an optional name, and the role `owner` or `admin`. Admins
  manage products; owners also change shop settings, laundry items and staff.
- **Change a role:** "Make owner" or "Make admin" next to the person.
- **Remove:** deletes their `admin_user` row. Every admin page and API request reads the list
  again, so their next request is refused. Their Neon Auth session is not revoked, but it opens
  nothing.

What the app refuses, in the words staff see:

- Removing or changing yourself: "You can't change your own access. Ask another owner."
- Removing or demoting the last owner: "There must always be at least one owner. Make someone else
  an owner first."

**Team rule: Google 2-step verification.** Every admin keeps 2-step verification on for the Google
account they sign in with. The app can't check or enforce this. When you add someone, ask them to
confirm it is on, and remove anyone who turns it off.

## 4. Lockout recovery

When no owner can sign in:

1. Re-run `pnpm db:seed-owner <email>` with a Google email you control, against the right branch
   (see [First owner](#2-first-owner) for passing the `main` string inline).
2. If it prints "already exists; nothing changed" because that email is on the list as `admin`,
   either seed a different email, or promote the row in the Neon SQL editor on that branch (email
   in lowercase):

   ```sql
   update admin_user set role = 'owner' where email = '<email>';
   ```

3. Sign in at `/admin`, then tidy the team at `/admin/settings`.

## 5. Migrations

The schema is in `src/lib/db/schema.ts`, migrations in `drizzle/`, and one rollback file per
migration in `drizzle/rollback/`. Migrations run by hand from your machine, never on install, build
or deploy.

1. After a schema change, write the migration and review its SQL in the PR:

   ```sh
   pnpm db:generate
   ```

2. In the same PR, write `drizzle/rollback/<tag>.sql` in the style of the existing ones: undo the
   change, then delete the migration's row from `drizzle.__drizzle_migrations`.
3. Apply it on `dev` first, check the preview Worker, then apply it on `main` (pass the direct
   `main` string inline, as for the seed):

   ```sh
   pnpm db:migrate
   ```

4. Always migrate before you deploy the code that needs the change.

**Rollback.** First roll back the code that needs the change ([Rolling back the Worker](#6-rolling-back-the-worker)).
Then run the rollback files newest first, one at a time:

```sh
psql "$DATABASE_URL_UNPOOLED" -f drizzle/rollback/<tag>.sql
```

Neon point-in-time restore is the backstop. If `admin_user` was affected, re-seed the owner.

## 6. Rolling back the Worker

To go back to the previous version:

```sh
pnpm exec wrangler rollback                  # production
pnpm exec wrangler rollback --env preview    # the preview Worker
```

To pick a version, list them first and pass its id to `rollback`:

```sh
pnpm exec wrangler deployments list
pnpm exec wrangler deployments list --env preview
pnpm exec wrangler rollback <version-id>
```

Or redeploy an older build: check out the previous commit, move `.env*` files out of the repo root,
then build and deploy (`cf:deploy` deploys the last build, it doesn't build):

```sh
pnpm cf:build
pnpm cf:deploy                  # add --env preview for the preview Worker
```

A Worker rollback doesn't undo a database migration, or the cache data in KV and D1.

**Every page answers 500.** Run `pnpm exec wrangler tail street-mart --format pretty` and load a
page. If the error is "This promise was created by a request that has since ended", check that
`no_handle_cross_request_promise_resolution` is still in `compatibility_flags` in `wrangler.jsonc`
(README, Run on Cloudflare), then roll back. If the live domains serve the preview (dev data on
streetmart.africa), a preview deploy took them: `pnpm exec wrangler triggers deploy` gives them
back to production.

## 7. Rotating secrets

For each secret: get the new value, put it in Wrangler, redeploy, check, then update your local
files.

| Secret                                                                                  | New value from                                                                                                                    |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` (and the local `DATABASE_URL_UNPOOLED`)                                  | Reset the branch's database role password in the Neon console, then copy the new pooled string (and the direct one for local use) |
| `NEON_AUTH_COOKIE_SECRET`                                                               | `openssl rand -base64 32`, a new value per environment                                                                            |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (with `AWS_ENDPOINT_URL_S3`, `AWS_REGION`) | A new key pair for the branch's Neon Object Storage, from Neon; the endpoint and region only change if Neon changes them          |

Then, for each changed name:

```sh
pnpm exec wrangler secret put <NAME>                  # production
pnpm exec wrangler secret put <NAME> --env preview    # the preview Worker
```

Redeploy (with `.env*` moved out of the repo root):

```sh
pnpm cf:build
pnpm cf:deploy                  # add --env preview for the preview Worker
```

Check: `/api/health` answers `{"ok":true}`, a shop page shows its photos, and you can sign in to
`/admin`. Then put the new values in `.dev.vars` and `.env.local`.

What people notice:

- **Cookie secret:** every staff member is signed out and signs in again.
- **Database password:** reads fail from the reset until the new secret is live. Public pages fall
  back to the default settings and laundry items, and product pages fail for that time. Do it at a
  quiet time, and put the new value in Wrangler straight after the reset.
- **Storage keys:** revoke the old pair only after the new one is live and photos load.

## 8. Reading logs

Each log line is one JSON object with `level`, `msg` and `requestId`, plus the fields below.

- **Workers Logs:** in the Cloudflare dashboard, open the Worker `street-mart` (or
  `street-mart-preview`) and its Logs. You can query JSON fields such as `msg` and `requestId`.
- **Live tail** from your machine:

  ```sh
  pnpm exec wrangler tail --format pretty
  pnpm exec wrangler tail --env preview --format pretty
  pnpm exec wrangler tail --search <text>
  ```

**Finding one request.** When something fails, staff see "…quote code <code>". That code is the
request's `cf-ray` id, which is also the `requestId` of every log line for that request. Search
Workers Logs for `requestId` equal to the code, or tail with `--search <code>` while they try again.

| Event (`msg`)                                            | Level | Fields                                   | What it means                                                                                                         |
| -------------------------------------------------------- | ----- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `rate_limited`                                           | warn  | `route`, `group`, `adminId` if signed in | A client went over a rate limit and got 429.                                                                          |
| `sign_in_denied`                                         | warn  | `reason`, `emailDomain`                  | A Google account was refused: `unverified_email`, or `not_on_allowlist` (not on the staff list).                      |
| `auth_unavailable`                                       | warn  |                                          | `/api/auth` was called without the Neon Auth secrets; it answered 503.                                                |
| `auth_handler_failed`                                    | error | `err`                                    | The Neon Auth proxy at `/api/auth` failed unexpectedly.                                                               |
| `auth_session_unavailable`                               | warn  | `status`                                 | Neon Auth couldn't be reached, or failed, while reading a session. Staff see "Sign-in isn't available right now".     |
| `auth_session_cleared`                                   | info  |                                          | Neon Auth wanted to change the session cookies during a page render; the visitor was treated as signed out.           |
| `admin_lookup_failed`                                    | error | `errorName`, `errorCode`                 | Reading the staff list from the database failed.                                                                      |
| `admin_check_failed`                                     | error | `err`                                    | The access check failed unexpectedly.                                                                                 |
| `sign_in_check_failed`                                   | error | `err`                                    | The sign-in page's check failed unexpectedly.                                                                         |
| `admin_api_failed`                                       | error | `errorName`, `errorCode`                 | An admin API request failed unexpectedly; staff saw the "quote code" message.                                         |
| `public_api_failed`                                      | error | `errorName`, `errorCode`                 | `/api/products` failed unexpectedly, usually the database.                                                            |
| `photo_delete_failed`                                    | warn  | `error`, `code`                          | A photo file couldn't be deleted after its product or item changed. The file is left in storage; nothing else breaks. |
| `photo_fetch_failed`                                     | warn  | `key`, `status`                          | A photo couldn't be read from the bucket (timeout, network, a Neon error or a non-image type); the visitor got a 502. |
| `photo_unavailable`                                      | error | none                                     | `/photos/` has no storage endpoint (`AWS_ENDPOINT_URL_S3` unset); every photo answers 503.                            |
| "Shop settings unavailable, using defaults"              | warn  | `requestId: "cache"`, `error`            | The site layout couldn't read the settings and showed the defaults for a short while.                                 |
| "Laundry items unavailable, using defaults"              | warn  | `requestId: "cache"`, `error`            | The same for laundry items.                                                                                           |
| "Sitemap products unavailable, listing fixed pages only" | warn  | `requestId: "cache"`, `error`            | The sitemap couldn't read products and listed only the fixed pages.                                                   |

Successful sign-ins and staff changes are not logged. No log line holds an email address (only
`emailDomain`), a cookie, a token or an IP address.

## 9. Cloudflare Cache Rule

A person adds this in the Cloudflare dashboard for `streetmart.africa` (Caching, Cache Rules). One
rule, action **Bypass cache**, with this expression:

```txt
starts_with(http.request.uri.path, "/admin") or starts_with(http.request.uri.path, "/api/admin/") or starts_with(http.request.uri.path, "/api/auth/")
```

Don't widen it to `/api/` as a whole: the public `/api/products` is meant to be cached at the edge
for up to 90 seconds (`s-maxage=30, stale-while-revalidate=60`), which keeps traffic off Neon.

Never add `/photos/` to this rule: the Worker caches photos itself and a bypass rule there would
send every view to Neon's transfer limit.

This rule is a backup. The app's own headers are the main guard: admin API responses send
`Cache-Control: no-store`, and every `/admin` page sends `private, no-store`.

## 10. Rate limiting

**In the app.** Every API request is counted by a Cloudflare Rate Limiting binding, one per group
(`ratelimits` in `wrangler.jsonc`; the limits table at the top of `src/lib/rate-limit.ts` is the
source, and its test fails if the two differ). Cloudflare counts per location and lets a few
requests through while counts sync, so the limits are approximate. To change a limit, edit both
and deploy. If a binding is missing or fails, the Worker counts in its own memory instead, so the
API never goes down because of the limiter. Over the limit, the API answers 429 with
`Retry-After` and logs `rate_limited`.

**WAF rule from the README.** A Cloudflare WAF rate-limiting rule on `/api/*` and `/shop/*`, per IP,
in front of the Worker. `/shop/<code>` pages read the database without going through the app's
limiter.

```txt
starts_with(http.request.uri.path, "/api/") or starts_with(http.request.uri.path, "/shop/")
```

`/photos/` isn't counted by the app's limiter (the Worker answers it before the app). Add it to
this WAF rule only if Neon's request counts spike.

**Optional: a stricter rule on sign-in.** A WAF rate-limiting rule for `/api/auth/*`, counted per
IP:

```txt
starts_with(http.request.uri.path, "/api/auth/")
```

Start at about 30 requests per minute with action Block, or the nearest period your plan allows
(for example 10 requests per 10 seconds where only 10 seconds is offered). One sign-in makes
several `/api/auth` requests, so sign in once after adding the rule to check it doesn't block you.
If your plan allows only one rate-limiting rule, fold `/api/auth/` into the expression of the rule
above (its `/api/` prefix already covers it) and choose one threshold for both.
