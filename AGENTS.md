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
- Design system lives only in `src/app/globals.css` (primitives → semantic tokens → Tailwind theme); reference in `docs/design-system.md`. Bricolage Grotesque display, Figtree body, JetBrains Mono for codes/figures, loaded with `next/font` in `src/app/layout.tsx`. Never hardcode colors, sizes or fonts in components — use the semantic utilities (`bg-primary`, `text-clay-foreground`, `text-display-lg`, `container-page`, …).
- shadcn/ui: install only components that are actually used (`pnpm dlx shadcn@latest add <name>`); `src/components/ui` holds shadcn primitives restyled to our tokens; reusable site components live in `src/components/shared` (catalogue in `docs/design-system.md`).
- Tooling: pnpm + Vite+ (`vp test` / `vp lint` / `vp fmt` / `vp check`); Next.js owns `dev` and `build`.
