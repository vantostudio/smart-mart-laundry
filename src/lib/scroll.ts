/** Smooth-scroll an element into view and move focus to it. */
export function revealElement(
  target: HTMLElement | null,
  focusTarget: HTMLElement | null = target,
) {
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  focusTarget?.focus({ preventScroll: true });
}

export function revealById(id: string, focusId: string = id) {
  revealElement(document.getElementById(id), document.getElementById(focusId));
}
