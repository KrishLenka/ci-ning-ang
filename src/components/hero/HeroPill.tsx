import { useRef } from "react";
import { motion } from "motion/react";
import { heroPill } from "@/content/site";
import { Credit } from "@/components/ui/Credit";
import { blurIn } from "@/lib/motion";
import { sceneryFade, setSceneryMode, useInert, useSceneryMode } from "@/hooks/useSceneryMode";

/**
 * Glass pill pinned to the bottom of the hero, with Krish's handwritten credit underneath.
 * The pill switches "show scenery" mode: everything else over the video fades away.
 */
export function HeroPill() {
  const scenery = useSceneryMode();
  const creditRef = useRef<HTMLDivElement>(null);
  useInert(creditRef, scenery);

  return (
    <div className="pointer-events-none flex flex-col items-center gap-1 px-4 pb-[22px]">
      <motion.button
        {...blurIn(1.3)}
        type="button"
        data-boop-below
        aria-pressed={scenery}
        onClick={() => setSceneryMode(!scenery)}
        className="liquid-glass pointer-events-auto rounded-full px-[26px] py-2.5 transition-transform hover:scale-[1.03]"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
          {scenery ? heroPill.showText : heroPill.showScenery}
        </span>
      </motion.button>

      <motion.div {...blurIn(1.45)}>
        <div ref={creditRef} aria-hidden={scenery} className={sceneryFade(scenery)}>
          <Credit className="glow-warm -rotate-[3deg] text-2xl text-cream md:text-[1.7rem]" />
        </div>
      </motion.div>
    </div>
  );
}
