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

- Frontend-first redesign: all content is static data in `src/data/*.ts`; the cart lives in `localStorage` via `src/lib/cart.tsx`; checkout builds a WhatsApp deep link. Payment for laundry is on delivery — no online payment UI.
- Backend (orders, seller stalls, real tracking, M-Pesa) comes later on Lovable Cloud; keep data shapes in `src/data` easy to swap for API calls.
- Palette and type live only in `src/styles.css` tokens (cream ground, bottle green `--primary`, terracotta `--clay`; Fraunces display + Karla body via Google Fonts in `__root.tsx`). Never hardcode colors in components.
