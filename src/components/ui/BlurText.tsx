import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { blurInFrames, blurInStart } from "@/lib/motion";

type BlurTextProps = {
  text: string;
  className?: string;
  /** Stagger between words, in ms. */
  delay?: number;
  /** Seconds before the first word starts. */
  startDelay?: number;
  /** Duration of each keyframe step, in seconds. */
  stepDuration?: number;
  as?: "h1" | "h2" | "p";
};

/** Reveals text word by word, each word blurring in from below once it scrolls into view. */
export function BlurText({
  text,
  className = "",
  delay = 100,
  startDelay = 0,
  stepDuration = 0.35,
  as: Tag = "p",
}: BlurTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`flex flex-wrap ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block will-change-[transform,filter,opacity]"
          initial={blurInStart}
          animate={inView ? blurInFrames : blurInStart}
          transition={{
            duration: stepDuration * 2,
            times: [0, 0.5, 1],
            delay: startDelay + (i * delay) / 1000,
            ease: "easeOut",
          }}
        >
          {word}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </Tag>
  );
}
