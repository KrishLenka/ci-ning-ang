import { useEffect, useRef } from "react";
import { createMeadowClouds, type MeadowCloudsOptions } from "./meadowClouds";

type Props = Omit<MeadowCloudsOptions, "canvas"> & { className?: string };

/**
 * Little animal-shaped clouds in the hero sky (tap one and it goes poof). Place it right after
 * the video and before <MeadowPiglets />, so flying piggies pass in front of the clouds.
 * It never captures the pointer: taps are read from the window.
 */
export default function MeadowClouds({ className, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const clouds = createMeadowClouds({ canvas: ref.current, ...options });
    return () => clouds.destroy();
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
