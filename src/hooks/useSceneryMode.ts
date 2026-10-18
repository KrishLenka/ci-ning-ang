import { useEffect, useSyncExternalStore, type RefObject } from "react";

// "Show scenery" mode: the hero pill hides the text, the nav and everything else over the
// video so the meadow can be seen. Scrolling down (or the pill again) brings them back.

let showing = false;
const listeners = new Set<() => void>();
const SCROLL_BACK = 40; // px scrolled down before the text comes back on its own
let startY = 0;

function onScroll() {
  if (window.scrollY > startY + SCROLL_BACK) setSceneryMode(false);
}

export function setSceneryMode(on: boolean) {
  if (on === showing) return;
  showing = on;
  if (on) {
    startY = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
  } else {
    window.removeEventListener("scroll", onScroll);
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** True while the scenery is showing (and the text is hidden). */
export function useSceneryMode() {
  return useSyncExternalStore(subscribe, () => showing);
}

/** Makes an element unclickable and skipped by keyboard and screen readers while hidden. */
export function useInert(ref: RefObject<HTMLElement>, inert: boolean) {
  useEffect(() => {
    ref.current?.toggleAttribute("inert", inert);
  }, [ref, inert]);
}

/** Classes for anything that fades out while the scenery is showing. */
export const sceneryFade = (hidden: boolean) =>
  `transition-opacity duration-500 ease-out motion-reduce:transition-none ${hidden ? "opacity-0" : "opacity-100"}`;
