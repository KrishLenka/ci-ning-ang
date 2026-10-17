import type { ReactNode } from "react";
import { motion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait after the element scrolls into view. */
  delay?: number;
  /** How far it rises, in px (smaller than the hero's 50 so long sections don't jump). */
  y?: number;
};

/**
 * Blurs and fades content in the first time it scrolls into view, with the same
 * keyframes as the hero, and settles into a plain, fully visible resting state.
 */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ filter: "blur(10px)", opacity: 0, y }}
      whileInView={{
        filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
        opacity: [0, 0.5, 1],
        y: [y, -3, 0],
        // Clear the filter so liquid glass inside keeps its backdrop blur.
        transitionEnd: { filter: "none" },
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay, duration: 0.7, times: [0, 0.5, 1], ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
