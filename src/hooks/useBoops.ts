import { useEffect, useRef } from "react";
import { easterEggs } from "@/content/site";

// Every piglet on the page (hero and About) shares one running total, kept in this browser.

type MilestoneListener = (total: number) => void;

const listeners = new Set<MilestoneListener>();
let total: number | null = null;

function readTotal(): number {
  try {
    const n = Number(localStorage.getItem(easterEggs.boopStorageKey));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0; // storage blocked (e.g. some private windows)
  }
}

function writeTotal(n: number) {
  try {
    localStorage.setItem(easterEggs.boopStorageKey, String(n));
  } catch {
    // Storage blocked: the count just won't survive a reload.
  }
}

function boop() {
  total = (total ?? readTotal()) + 1;
  writeTotal(total);
  if (total % easterEggs.boopEvery === 0) {
    const n = total;
    listeners.forEach((listener) => listener(n));
  }
}

/**
 * Returns `boop`, to call on every piglet click. `onMilestone(total)` runs whenever the
 * shared total reaches a multiple of `easterEggs.boopEvery`, whichever piglet was clicked.
 */
export function useBoops(onMilestone?: MilestoneListener) {
  const latest = useRef(onMilestone);
  latest.current = onMilestone;

  useEffect(() => {
    total ??= readTotal();
    const listener: MilestoneListener = (n) => latest.current?.(n);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return boop;
}
