import { useEffect, useRef } from "react";

/**
 * Full-bleed looping background video. It's decorative and silent, so it plays
 * for everyone, including visitors with prefers-reduced-motion set (some browsers
 * block autoplay in that case, so we nudge it with play() as a fallback).
 */
export function BackgroundVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

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
    return () => {
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
    </div>
  );
}
