import { useEffect, useRef } from "react";
import { createMeadowSwans, type MeadowSwansOptions } from "./meadowSwans";

type Props = Omit<MeadowSwansOptions, "canvas"> & { className?: string };

/**
 * Swans (and later their cygnets) on the hero's pond; tapping the water makes ripples.
 * Place it in the hero right after the video, covering the same box. It never captures
 * the pointer: taps are read from the window, so links and buttons on top keep working.
 */
export default function MeadowSwans({ className, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const swans = createMeadowSwans({ canvas: ref.current, ...options });
    return () => swans.destroy();
    // Options are read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
