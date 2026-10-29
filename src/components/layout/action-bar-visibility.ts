/**
 * Pages mark their own main booking button with this attribute (e.g. the home hero's
 * "Book a pickup"). While any such element is on screen the mobile action bar stays hidden,
 * so the same action is never shown twice.
 */
export const HERO_CTA_SELECTOR = "[data-hero-cta]";

/** On pages without a hero CTA, the bar appears after this much scrolling. */
export const ACTION_BAR_SCROLL_THRESHOLD = 400;

export type ActionBarState = {
  pathname: string;
  /** At least one `[data-hero-cta]` element is on the page. */
  heroCtaPresent: boolean;
  /** At least one `[data-hero-cta]` element intersects the viewport. */
  heroCtaInView: boolean;
  /** The page is scrolled further than `ACTION_BAR_SCROLL_THRESHOLD`. */
  scrolledPastThreshold: boolean;
  footerInView: boolean;
  /** A text input, textarea or select has focus (the on-screen keyboard is likely open). */
  textEntryFocused: boolean;
};

/** Routes with their own sticky bottom bar. */
function hasOwnBottomBar(pathname: string): boolean {
  return ["/laundry", "/shop"].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function shouldShowActionBar(s: ActionBarState): boolean {
  if (hasOwnBottomBar(s.pathname)) return false;
  if (s.textEntryFocused || s.footerInView) return false;
  if (s.heroCtaPresent) return !s.heroCtaInView;
  return s.scrolledPastThreshold;
}

const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

/** True for elements that bring up the on-screen keyboard (or a picker) when focused. */
export function isTextEntry(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(el.type);
  return (
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el.isContentEditable === true
  );
}

/** `id` of the site footer; the bar hides while the footer is on screen. */
export const SITE_FOOTER_ID = "site-footer";
