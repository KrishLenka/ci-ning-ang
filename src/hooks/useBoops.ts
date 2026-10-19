import { useEffect, useRef } from "react";
import { easterEggs } from "@/content/site";

// Every piglet on the page (hero and About) shares one running total. It lives only in memory,
// so each visit (and each reload) starts counting from 0.

type MilestoneListener = (total: number) => void;

const listeners = new Set<MilestoneListener>();
let total = 0;

function boop() {
  total += 1;
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
    const listener: MilestoneListener = (n) => latest.current?.(n);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return boop;
}
