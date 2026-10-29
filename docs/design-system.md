# Street Mart design system

Every visual decision lives in [`src/app/globals.css`](../src/app/globals.css). Components consume
**semantic Tailwind utilities only**: no hex values, no `text-white`, no arbitrary font sizes.

## Layers

| Layer      | Where                 | Example                         | Use in components? |
| ---------- | --------------------- | ------------------------------- | ------------------ |
| Primitives | `:root` (top of file) | `--bottle-700`, `--clay-500`    | Never              |
| Semantics  | second `:root`        | `--primary`, `--success-soft`   | Via utilities      |
| Theme      | `@theme` blocks       | `bg-primary`, `text-display-lg` | Yes                |

To re-skin the site, change the primitives or remap the semantics. Components don't change.
There is no dark theme: `.dark` values were dropped until one is designed.

## Colour roles

| Utility                                      | Purpose                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `bg-background` / `text-foreground`          | Page ground (cream) and body ink (deep green)     |
| `bg-card` / `text-card-foreground`           | Raised surfaces                                   |
| `bg-muted` / `text-muted-foreground`         | Quiet panels, secondary text                      |
| `bg-primary` / `text-primary-foreground`     | Bottle green: brand, primary buttons, dark bands  |
| `bg-secondary` / `text-secondary-foreground` | Soft cream panel                                  |
| `bg-accent` / `text-accent-foreground`       | Soft terracotta wash                              |
| `bg-clay` / `text-clay-foreground`           | Terracotta call to action, badges, "most popular" |
| `bg-clay-soft`, `text-clay`                  | Tints and eyebrow labels                          |
| `bg-leaf`                                    | Fresh green dot ("open now")                      |
| `text-success`, `bg-success-soft`            | Done, in stock                                    |
| `text-destructive`, `bg-destructive-soft`    | Errors                                            |
| `text-on-media`                              | Text over photos and gradient overlays            |
| `fill-skin`                                  | People in illustrations                           |
| `border-border`, `border-input`, `ring-ring` | Lines, fields, focus                              |

Pairing rule: a solid `bg-X` takes `text-X-foreground`; a `bg-X-soft` takes `text-X` or
`text-foreground`. Add a missing pair (e.g. a warning colour) to `globals.css` when a component needs it.

## Typography

| Family  | Utility                    | Font                | For                                    |
| ------- | -------------------------- | ------------------- | -------------------------------------- |
| Display | `font-display` / `display` | Clash Display (600) | Headings, prices, big numbers          |
| Body    | `font-sans`                | Satoshi (default)   | Everything else; `figures` for numbers |
| Mono    | `font-mono`                | System monospace    | Item codes                             |

Both faces are self-hosted from Fontshare under the ITF Free Font License (`src/app/fonts/`, loaded
with `next/font/local` in `src/app/layout.tsx`). The licence forbids redistributing the files, so keep
the repository private.

**Stepped scale.** Each step has one fixed size per device class (phone < 640px, tablet 640–1023px,
desktop ≥ 1024px), set in `@theme` and overridden in `@layer base`. Line height and tracking come with
the step, so headings never need `sm:`/`lg:` size overrides. `e2e/responsive.spec.ts` checks it.

| Utility           | Phone | Tablet | Desktop | Use                          |
| ----------------- | ----: | -----: | ------: | ---------------------------- |
| `text-display-xl` |    38 |     52 |      72 | Home hero, 404               |
| `text-display-lg` |    32 |     42 |      56 | Page hero (`h1`)             |
| `text-display`    |    28 |     36 |      44 | Section heading (`h2`)       |
| `text-title`      |    18 |     20 |      22 | Card / step heading (`h3`)   |
| `text-subtitle`   |    17 |     18 |      18 | Small heading, prices        |
| `text-body-lg`    |    16 |     17 |      18 | Intro paragraphs             |
| `text-body`       |    15 |     16 |      16 | Running text (default)       |
| `text-body-sm`    |    14 |     14 |      15 | Card copy, form help         |
| `text-caption`    |    12 |     13 |      13 | Meta, footnotes              |
| `text-overline`   |    12 |     12 |      12 | Backs `eyebrow`/`caps-label` |

Helpers: `eyebrow` (clay uppercase label), `caps-label` (same, inherits colour), `display` (display
face at heading weight, paired with any size), `figures` (tabular numbers), `text-link` (underlined
inline link). `h1`–`h4` use the display face and balanced wrapping by default.

Rules: form fields are always 16px (`text-base`; smaller makes iOS Safari zoom on focus), body text
never drops under 15px, and section headings carry no eyebrow: keep one, in the page hero, at most.

## Layout

| Token / utility  | Value           | Use                                              |
| ---------------- | --------------- | ------------------------------------------------ |
| `container-page` | 72rem + gutters | Every page section's inner column                |
| `max-w-reading`  | 40rem           | Long text, hero intros                           |
| `max-w-narrow`   | 28rem           | Error pages, floating cart/bag bars              |
| `px-gutter`      | 20 / 32 / 40px  | Side padding (phone / tablet / desktop)          |
| `py-section`     | 64 / 88 / 120px | Vertical rhythm between sections (`pt-`, `pb-`)  |
| `h-header`       | 4rem            | Sticky header height (also anchor scroll offset) |
| `xs:` breakpoint | 480px           | Small-phone tweaks                               |

Standard section: `<Section>` (or `<section className="py-section"><div className="container-page">`).

## Shape, depth, motion, layers

- **Radius.** One knob, `--radius` (0.75rem), drives `rounded-lg` through `rounded-4xl`. Pills use
  `rounded-full`.
- **Shadows.** Green-tinted, never grey: `shadow-card` (resting), `shadow-lift` (hover, featured),
  `shadow-ticket` (sheet, ticket card), `shadow-glow-primary` / `shadow-glow-clay` (coloured halos),
  `inset-shadow-highlight` (1px top highlight on solid buttons).
- **Motion.** Easing `ease-out-expo` for transitions. The page hero rises in on load
  (`animate-fade-up`); `animate-marquee` drives the reviews `Marquee`; the home hero's order updates
  animate with `motion`. Never start content at opacity 0 on scroll. `prefers-reduced-motion` turns
  animation off globally.
- **Z-index.** `z-(--z-header)` 40, `z-(--z-overlay)` 50, `z-(--z-toast)` 60.

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
| `text-gradient-sunset` | Gradient fill for a highlighted heading word     |
| `sheen`                | Light sweep across the surface on hover          |

## Dark bands: `surface-inverse`

`surface-inverse` re-scopes the semantic tokens, so `text-foreground`, `text-muted-foreground`,
`border-border` and `bg-card` all turn light on a dark band; components never need an "on-dark" prop.
`Section tone="brand"`, the footer, the order ticket head, the Good to know tiles and the floating
cart/bag bars apply it. Set `[--ink:…]` to change the light colour.

## Components

**Primitives** (`src/components/ui`, from shadcn, restyled to these tokens):

| Component      | Variants                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`       | `primary` `clay` `secondary` `inverse` · `gradient-primary` `gradient-clay` · `outline` `outline-inverse` `soft` `ghost`; sizes `sm` `md` `lg` `xl` `icon-lg`; `block`; `asChild` for links |
| `Badge`        | `primary` `gradient` `soft` `secondary` `chip` `code`; sizes `sm` `md`                                                                                                                      |
| `Input`        | `shape` `rounded` / `pill` (shared `fieldVariants` in `field-styles.ts`)                                                                                                                    |
| `NativeSelect` | Native select with our chevron, same field look                                                                                                                                             |
| `Textarea`     | Same field look as `Input`                                                                                                                                                                  |
| `Sheet`        | Bottom sheet on phones and tablets, right-hand panel on desktop; `SheetHeader`, scrolling `SheetBody`, pinned `SheetFooter`, `SheetTitle`, `SheetDescription`                               |
| `Marquee`      | Magic UI (`@magicui` registry in `components.json`): scrolling reviews row                                                                                                                  |

Use a `gradient-*` button for the single main action in a view, solid buttons for secondary actions,
and `inverse` / `outline-inverse` on brand bands.

**Shared** (`src/components/shared`, built from the primitives):

| Component              | Use                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Section`, `Container` | Page band (`tone` plain / muted / brand, `spacing` default / bottom) and page column                                                                    |
| `SectionHeading`       | h2 + intro, left aligned                                                                                                                                |
| `PageHero`             | Inner-page hero: eyebrow, h1, intro (/about)                                                                                                            |
| `ImageTile`            | Linked photo with scrim and caption (home shop teaser)                                                                                                  |
| `StaggerGrid`          | Grid whose columns sit at different heights: 2 columns (right one dropped) on phones, 3 or 4 on lg                                                      |
| `MediaCard`            | Visual + title + copy (+ footer): horizontal on phones (mirrored in a StaggerGrid), stacked from 640px                                                  |
| `ChoiceChips`          | Radio group as chips, calendar dates or icon tiles; rail scrolls on narrow cards, grid on wide                                                          |
| `Price`                | KSh amount in the display face with tabular figures                                                                                                     |
| `QuantityStepper`      | − qty + control with a 44px hit area, optional `max` (one-off mtumba pieces)                                                                            |
| `StillNeeded`          | "2 of 5 done" meter and a checklist of missing fields that jump to each one; "All set" when complete                                                    |
| `OrderSent`            | "Your order is ready in WhatsApp" with Copy order / Call us, after a send                                                                               |
| `RememberedNotice`     | "Filled in from your last order on this phone. Not you? Clear"                                                                                          |
| `FloatingCartBar`      | Bottom pill with count, caption, total and an action (laundry cart, shop bag)                                                                           |
| `PerkList`             | Row of icon pills under a page heading                                                                                                                  |
| `InfoItem`             | Icon + title + detail list item                                                                                                                         |
| `FormField`            | Label wrapping a control, with an optional hint                                                                                                         |
| `WhatsAppButton`       | Button that opens a pre-filled WhatsApp chat                                                                                                            |
| `Wordmark`, `LogoMark` | Logo: the hanger "S" mark (in `currentColor`) + "Street Mart" with the sunset full stop. `LOGO_PATHS` also draw `src/app/icon.svg` and `apple-icon.tsx` |

Site chrome (header, footer, phone action bar, open-now status) lives in `src/components/layout`.
Feature-specific pieces stay in `src/features/<name>/components`; anything used by two or more
features moves to `src/components/shared`. Add shadcn components only when a feature needs them
(`pnpm dlx shadcn@latest add <name>`), then restyle them to these tokens.

If you add a utility that shares a Tailwind prefix (`text-*`, `bg-*`, `shadow-*`), register it in
`src/lib/utils.ts` so `cn()` doesn't strip it.

**Illustrations** (`src/components/illustrations`): unDraw art (free, no attribution) converted to
React components by `node scripts/undraw.mjs Name=<cdn path>`, which maps unDraw's colours to fill
utilities (`fill-clay`, `fill-foreground`, `fill-muted`, `fill-skin` …) so the art follows the theme.
Use photos for real results (clean clothes, machines, the shop) and illustrations for the service
around them (booking, pickup, messages, payment).
