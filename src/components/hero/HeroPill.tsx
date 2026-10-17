import { motion } from "motion/react";
import { heroPill } from "@/content/site";
import { Credit } from "@/components/ui/Credit";
import { blurIn } from "@/lib/motion";

/** Glass pill pinned to the bottom of the hero, with Krish's handwritten credit underneath. */
export function HeroPill() {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-1 px-4 pb-[22px]">
      <motion.div {...blurIn(1.3)} data-boop-below className="liquid-glass rounded-full px-[26px] py-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
          {heroPill.label}
        </span>
      </motion.div>

      <motion.div {...blurIn(1.45)}>
        <Credit className="glow-warm -rotate-[3deg] text-2xl text-cream md:text-[1.7rem]" />
      </motion.div>
    </div>
  );
}
