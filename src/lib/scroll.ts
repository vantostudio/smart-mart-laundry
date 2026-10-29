/** Smooth-scroll an element into view (instant with reduced motion) and move focus to it. */
export function revealElement(
  target: HTMLElement | null,
  focusTarget: HTMLElement | null = target,
) {
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  focusTarget?.focus({ preventScroll: true });
}

export function revealById(id: string, focusId: string = id) {
  revealElement(document.getElementById(id), document.getElementById(focusId));
}
