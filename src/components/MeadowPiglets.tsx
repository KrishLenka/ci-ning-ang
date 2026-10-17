import { useEffect, useRef, type MutableRefObject } from "react";
import { createMeadowPiglets, type MeadowPiglets as PigletsApi, type MeadowPigletsOptions } from "./meadowPiglets";

type Props = Omit<MeadowPigletsOptions, "canvas"> & {
  className?: string;
  /** Receives the engine so the page can call e.g. apiRef.current?.summonFlyer("gold"). */
  apiRef?: MutableRefObject<PigletsApi | null>;
};

/**
 * Pixel piglets living in the hero video. Place it inside the hero section,
 * directly after the <video>, in a box that covers the same area as the video.
 * It never captures the mouse: clicks are detected from the window, so links
 * and buttons on top keep working and the cursor never changes.
 * Callbacks (onPigletClick, onEasterEgg) always use their latest version.
 */
export default function MeadowPiglets({ className, apiRef, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    if (!ref.current) return;
    const piglets = createMeadowPiglets({
      ...latest.current,
      canvas: ref.current,
      onPigletClick: (kind, wasAsleep) => latest.current.onPigletClick?.(kind, wasAsleep),
      onEasterEgg: (n) => latest.current.onEasterEgg?.(n),
    });
    if (apiRef) apiRef.current = piglets;
    return () => {
      piglets.destroy();
      if (apiRef) apiRef.current = null;
    };
    // Engine options are read once on mount.
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
