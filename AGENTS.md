<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture

- Next.js App Router, feature-sliced: routes in `src/app/(site)`, page code and static data in `src/features/<name>/` (`data.ts`, `components/`); the cart lives in `localStorage` via `src/features/cart/cart-provider.tsx`; checkout builds a WhatsApp deep link. Payment for laundry is on delivery — no online payment UI.
- Backend (orders, seller stalls, real tracking, M-Pesa) comes later on Lovable Cloud; keep the `features/*/data.ts` shapes easy to swap for API calls.
- Design system lives only in `src/app/globals.css` (primitives → semantic tokens → Tailwind theme); reference in `docs/design-system.md`. Clash Display headings and Satoshi content, self-hosted from Fontshare (ITF Free Font License, `src/app/fonts/`) with `next/font/local` in `src/app/layout.tsx`. Type and spacing step per device class (phone / tablet ≥640 / desktop ≥1024) — no `sm:`/`lg:` size overrides on headings. Never hardcode colors, sizes or fonts in components — use the semantic utilities (`bg-primary`, `text-clay-foreground`, `text-display-lg`, `container-page`, …).
- shadcn/ui: install only components that are actually used (`pnpm dlx shadcn@latest add <name>`); `src/components/ui` holds shadcn primitives restyled to our tokens; reusable site components live in `src/components/shared` (catalogue in `docs/design-system.md`).
- Tooling: pnpm + Vite+ (`vp test` / `vp lint` / `vp fmt` / `vp check`); Next.js owns `dev` and `build`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
