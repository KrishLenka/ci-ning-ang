import { useEffect, useRef } from "react";
import { createMeadowHorses, type MeadowHorsesOptions } from "./meadowHorses";

type Props = Omit<MeadowHorsesOptions, "canvas"> & { className?: string };

/**
 * Now and then a horse gallops down to the lake from behind the trees, drinks and
 * gallops back. Decorative only. Place it in the hero right before <MeadowPiglets />,
 * covering the same box as the video.
 */
export default function MeadowHorses({ className, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const horses = createMeadowHorses({ canvas: ref.current, ...options });
    return () => horses.destroy();
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
