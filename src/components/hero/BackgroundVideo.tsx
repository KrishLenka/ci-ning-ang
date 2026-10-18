import { useEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Tracks the visitor's reduced-motion setting, including changes while the page is open. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED).matches);
  useEffect(() => {
    const mq = window.matchMedia(REDUCED);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

type Props = { src: string; still: string; className?: string };

/**
 * Full-bleed looping background video, or a still image for visitors who prefer reduced motion.
 *
 * Keep both object-cover and centered: MeadowPiglets maps its sprites onto the
 * picture with the same object-fit: cover math.
 */
export function BackgroundVideo({ src, still, className = "" }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const cover = `absolute inset-0 h-full w-full object-cover object-center ${className}`;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React doesn't always reflect `muted` as an attribute; autoplay requires it.
    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      if (video.paused) video.play().catch(() => {});
    };
    tryPlay();
    video.addEventListener("canplay", tryPlay);
    // Resume after the tab regains focus (iOS low-power mode can pause it).
    document.addEventListener("visibilitychange", tryPlay);
    // iPhones in Low Power Mode refuse to autoplay, but a video may start on any tap or swipe.
    document.addEventListener("touchend", tryPlay, { passive: true });
    document.addEventListener("pointerup", tryPlay, { passive: true });
    return () => {
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
      document.removeEventListener("touchend", tryPlay);
      document.removeEventListener("pointerup", tryPlay);
    };
  }, [reduced]);

  if (reduced) return <img src={still} alt="" aria-hidden className={cover} />;

  return (
    <video
      ref={ref}
      aria-hidden
      className={cover}
      src={src}
      poster={still}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      tabIndex={-1}
    />
  );
}
