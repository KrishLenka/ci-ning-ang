import { useEffect, useRef } from "react";
import { createMeadowHorses, type MeadowHorsesOptions } from "./meadowHorses";

type Props = Omit<MeadowHorsesOptions, "canvas" | "frontCanvas"> & {
  className?: string;
  /** When set, routes marked `front` draw on a second canvas with this class (e.g. a higher z-index). */
  frontClassName?: string;
};

/**
 * Now and then a horse gallops down to the lake from behind the trees, drinks and
 * gallops back. Decorative only. Place it in the hero right before <MeadowPiglets />,
 * covering the same box as the video. With `frontClassName`, the right-hand horses get
 * their own canvas so they can sit in front of the piglets.
 */
export default function MeadowHorses({ className, frontClassName, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const horses = createMeadowHorses({ canvas: ref.current, frontCanvas: frontRef.current ?? undefined, ...options });
    return () => horses.destroy();
    // Options are read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" } as const;
  return (
    <>
      <canvas ref={ref} aria-hidden="true" className={className} style={style} />
      {frontClassName !== undefined && <canvas ref={frontRef} aria-hidden="true" className={frontClassName} style={style} />}
    </>
  );
}
