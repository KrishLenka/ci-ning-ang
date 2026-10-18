import { useEffect, useRef, type ReactNode } from "react";

/**
 * The hero's video and its animals. On touch screens the stage keeps the video's full width
 * (instead of cropping its sides), starts centered, and can be swiped left and right; the
 * hero text stays put on top. On desktop it's simply the size of the hero.
 */
export function HeroStage({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Re-center only when the stage changes size (first layout, rotation), never mid-swipe.
    let lastWidth = -1;
    const center = () => {
      if (el.scrollWidth === lastWidth) return;
      lastWidth = el.scrollWidth;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    };
    center();
    const ro = new ResizeObserver(center);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`no-scrollbar absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain ${className}`}
    >
      <div className="hero-stage">{children}</div>
    </div>
  );
}
