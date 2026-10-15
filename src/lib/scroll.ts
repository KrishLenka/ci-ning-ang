import type { MouseEvent } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth-scrolls to a section by id (or to the top for "top"), and keeps the URL hash in sync. */
export function scrollToId(id: string) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
    history.replaceState(null, "", window.location.pathname);
    return;
  }

  const target = document.getElementById(id);
  if (!target) return; // section not built yet
  target.scrollIntoView({ behavior, block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** onClick handler for `<a href="#id">` links: keeps real hrefs but scrolls smoothly. */
export const handleAnchorClick = (id: string, after?: () => void) => (e: MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  after?.();
  scrollToId(id);
};
