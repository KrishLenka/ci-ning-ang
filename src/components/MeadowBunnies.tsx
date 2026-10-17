import { useEffect, useRef } from "react";
import { createMeadowBunnies, type MeadowBunniesOptions } from "./meadowBunnies";

type Props = Omit<MeadowBunniesOptions, "canvas"> & { className?: string };

/**
 * An occasional bunny bounding through the foreground flowers. Decorative
 * only. Place it in the hero right after <MeadowPiglets />, covering the same
 * box as the video.
 */
export default function MeadowBunnies({ className, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const bunnies = createMeadowBunnies({ canvas: ref.current, ...options });
    return () => bunnies.destroy();
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
