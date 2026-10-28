# Street Mart design system

Every visual decision lives in [`src/app/globals.css`](../src/app/globals.css). Components consume
**semantic Tailwind utilities only**: no hex values, no `text-white`, no arbitrary font sizes.

## Layers

| Layer      | Where                 | Example                         | Use in components? |
| ---------- | --------------------- | ------------------------------- | ------------------ |
| Primitives | `:root` (top of file) | `--bottle-700`, `--clay-500`    | Never              |
| Semantics  | `:root` and `.dark`   | `--primary`, `--success-soft`   | Via utilities      |
| Theme      | `@theme` blocks       | `bg-primary`, `text-display-lg` | Yes                |

To re-skin the site, change the primitives or remap the semantics. Components don't change.

## Colour roles

| Utility                                        | Purpose                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `bg-background` / `text-foreground`            | Page ground (cream) and body ink (deep green)                          |
| `bg-card`, `bg-popover`                        | Raised surfaces                                                        |
| `bg-muted` / `text-muted-foreground`           | Quiet panels, secondary text                                           |
| `bg-primary` / `text-primary-foreground`       | Bottle green: brand, primary buttons, dark bands                       |
| `bg-secondary`                                 | Soft cream panel                                                       |
| `bg-accent` / `text-accent-foreground`         | Soft terracotta wash                                                   |
| `bg-clay` / `text-clay-foreground`             | Terracotta call to action, badges, "most popular"                      |
| `bg-clay-soft`, `text-clay`                    | Tints and eyebrow labels                                               |
| `text-leaf`                                    | Fresh green highlight                                                  |
| `success` · `warning` · `info` · `destructive` | Status. Each has `-foreground` (text on solid) and `-soft` (tinted bg) |
| `text-on-media`                                | Text over photos and gradient overlays                                 |
| `border-border`, `border-input`, `ring-ring`   | Lines, fields, focus                                                   |

Pairing rule: a solid `bg-X` always takes `text-X-foreground`. A `bg-X-soft` takes `text-X` or `text-foreground`.

## Typography

| Family  | Utility        | Font                | For                                        |
| ------- | -------------- | ------------------- | ------------------------------------------ |
| Display | `font-display` | Bricolage Grotesque | Headings, prices, big numbers              |
| Body    | `font-sans`    | Figtree (default)   | Everything else                            |
| Mono    | `font-mono`    | JetBrains Mono      | Ticket numbers, order codes, phone numbers |

Why these: Bricolage Grotesque has the bold, slightly irregular energy of hand-painted market
signage, which fits Gikomba and the stall. Figtree is round and very legible at small sizes on
budget Android screens. Mono makes a laundry ticket look like a ticket.

**Fluid scale.** Each step sets its own line height and tracking and scales from phone to desktop,
so you don't need `sm:`/`lg:` size overrides:

| Utility           | Size (phone → desktop) | Use                         |
| ----------------- | ---------------------- | --------------------------- |
| `text-display-xl` | 44 → 80px              | Home hero                   |
| `text-display-lg` | 36 → 60px              | Page hero (`h1`)            |
| `text-display`    | 30 → 44px              | Section heading (`h2`)      |
| `text-title`      | 22 → 28px              | Card / block heading (`h3`) |
| `text-subtitle`   | 18px                   | Lead-in, small heading      |
| `text-body-lg`    | 18px                   | Intro paragraphs            |
| `text-body`       | 16px (body default)    | Running text                |
| `text-body-sm`    | 14px                   | Card copy, form help        |
| `text-caption`    | 12px                   | Meta, footnotes             |
| `text-overline`   | 12px, 0.14em tracking  | Backs the `eyebrow` utility |

Helpers: `eyebrow` (clay uppercase label), `display` (display font with heading weight and
tracking, paired with any size), `figures` (tabular numbers for prices and quantities).
`h1`–`h4` use the display face and balanced wrapping by default.

## Layout

| Token / utility  | Value                    | Use                                              |
| ---------------- | ------------------------ | ------------------------------------------------ |
| `container-page` | 72rem max + fluid gutter | Every page section's inner column                |
| `max-w-reading`  | 40rem                    | Long text, hero intros                           |
| `max-w-narrow`   | 28rem                    | Forms, lookups                                   |
| `px-gutter`      | 16 → 24px                | Side padding                                     |
| `py-section`     | 64 → 96px                | Vertical rhythm between sections                 |
| `h-header`       | 4rem                     | Sticky header height (also anchor scroll offset) |
| `xs:` breakpoint | 480px                    | Small-phone tweaks                               |

Standard section: `<section className="py-section"><div className="container-page">…</div></section>`.

## Shape, depth, motion, layers

- **Radius.** A single knob, `--radius` (0.75rem), drives `rounded-sm` through `rounded-4xl`.
  Pills use `rounded-full`.
- **Shadows.** Green-tinted, never grey: `shadow-card` (resting), `shadow-lift` (hover/featured),
  `shadow-ticket` (floating ticket).
- **Motion.** `animate-fade-up` (entrances), `animate-fade-in`, easings `ease-out-expo` and
  `ease-spring`. `prefers-reduced-motion` turns animation off globally.
- **Z-index.** `z-(--z-raised)` 10, `z-(--z-header)` 40, `z-(--z-overlay)` 50, `z-(--z-toast)` 60.
- **Glows.** `shadow-glow-primary` / `shadow-glow-clay` (coloured hover halos) and
  `inset-shadow-highlight` (the 1px top highlight on solid buttons).

## Gradients and textures

| Utility                | Look                                             |
| ---------------------- | ------------------------------------------------ |
| `bg-gradient-primary`  | Deep bottle-green diagonal                       |
| `bg-gradient-clay`     | Warm terracotta                                  |
| `bg-gradient-sunset`   | Clay into gold: the most energetic CTA           |
| `bg-gradient-forest`   | Leaf into bottle green                           |
| `bg-gradient-scrim`    | Green fade over photos so captions stay readable |
| `bg-mesh`              | Brand band: green with clay and leaf light pools |
| `bg-glow`              | Soft warm wash for heroes                        |
| `bg-weave`             | Faint dot grid for muted sections                |
| `text-gradient-sunset` | Gradient fill for one highlighted heading word   |
| `sheen`                | Light sweep across the surface on hover          |

## Dark surfaces: `surface-inverse`

`surface-inverse` re-scopes the semantic tokens, so `text-foreground`, `text-muted-foreground`,
`border-border` and `bg-card` all turn light on a dark band. Components never need an
"on-dark" prop. `Section tone="brand"`, `Card variant="brand"` / `"clay"` and the footer apply it.
Set `[--ink:…]` to change the light colour.

## Dark mode

Semantic tokens have `.dark` values ready. Adding a `dark` class to `<html>` switches the theme.
There's no toggle yet.

## Components

**Primitives** (`src/components/ui`, from shadcn, restyled to these tokens):

| Component      | Variants                                                                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `primary` `clay` `secondary` `inverse` · `gradient-primary` `gradient-clay` `gradient-sunset` `gradient-forest` · `outline` `outline-inverse` `soft` `ghost` `link` `destructive`; sizes `sm` `md` `lg` `xl` `icon-sm` `icon` `icon-lg`; `block`; `asChild` for links |
| `Badge`        | `primary` `clay` `gradient` `soft` `secondary` `chip` `inverse` `success` `warning` `info` `destructive` `code`; sizes `sm` `md` `lg`                                                                                                                                 |
| `Input`        | `tone` `default` / `inverse`, `shape` `rounded` / `pill`                                                                                                                                                                                                              |
| `NativeSelect` | `tone` `default` / `inverse`                                                                                                                                                                                                                                          |
| `Label`        | —                                                                                                                                                                                                                                                                     |

Use `gradient-*` buttons for the single main action in a view, solid buttons for secondary
actions, and `inverse` / `outline-inverse` on brand bands.

**Shared** (`src/components/shared`, built from the primitives):

| Component                       | Use                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Section`, `Container`          | Page band (`tone` plain / muted / glow / brand, `spacing`) and page column                        |
| `SectionHeading`                | Eyebrow + h2 + intro                                                                              |
| `PageHero`                      | Inner-page hero with chips, actions and photo                                                     |
| `Card`, `CardMedia`, `CardBody` | `default` `interactive` `brand` `clay` `glass` `muted` `ticket`; image header that zooms on hover |
| `FeatureCard`                   | Icon or step number + title + copy, optional link                                                 |
| `ImageTile`                     | Photo with scrim and caption, optional link                                                       |
| `IconBadge`                     | Rounded-square icon / number tile (`soft` `primary` `sunset` `glass`)                             |
| `Price`                         | KSh amount with tabular figures and optional period                                               |
| `QuantityStepper`               | − qty + control, `default` / `inverse`                                                            |
| `DetailList`                    | Receipt-style label/value rows                                                                    |
| `InfoItem`                      | Icon + title + detail list item                                                                   |
| `FormField`                     | Label wrapping a control, with an optional hint                                                   |
| `WhatsAppButton`                | Button that opens a pre-filled WhatsApp chat                                                      |
| `CtaBanner`                     | Closing call-to-action on the brand mesh                                                          |
| `Wordmark`                      | "Street Mart" logotype                                                                            |

Add shadcn components only when a feature needs them (`pnpm dlx shadcn@latest add <name>`), then
restyle them to these tokens. Feature-specific pieces stay in `src/features/<name>/components`.
Anything used by two or more features moves to `src/components/shared`.

If you add a utility that shares a Tailwind prefix (`text-*`, `bg-*`, `shadow-*`), register it in
`src/lib/utils.ts` so `cn()` doesn't strip it.
