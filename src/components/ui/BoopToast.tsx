import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easterEggs } from "@/content/site";
import { useBoops } from "@/hooks/useBoops";

// Timeline: fade in (0.5 s), a wave runs through the letters left to right, a short hold,
// then it floats up and fades out.
const FADE_IN = 0.5;
const WAVE_STAGGER = 0.05; // s between neighbouring letters
const WAVE_BUMP = 0.42; // s for one letter to rise and settle
const HOLD_AFTER_WAVE = 0.9;

/**
 * Where the message sits: halfway between the hero's "Get to know me" button and its
 * "Work in Progress" pill, measured as if the page were scrolled to the top. It's fixed to
 * the viewport, so it shows in the same spot wherever the visitor has scrolled.
 */
function messageTop() {
  const above = document.querySelector("[data-boop-above]")?.getBoundingClientRect();
  const below = document.querySelector("[data-boop-below]")?.getBoundingClientRect();
  const h = window.innerHeight;
  if (!above || !below) return h * 0.72;
  const mid = (above.bottom + below.top) / 2 + window.scrollY;
  return Math.min(Math.max(mid, h * 0.55), h - 48);
}

/** True while the message's spot on screen is over the hero video (cream reads best there). */
function overHero(top: number) {
  const hero = document.getElementById("top")?.getBoundingClientRect();
  return !!hero && top < hero.bottom;
}

/** The secret handwritten "50 boops!" note. Never takes clicks and never moves the layout. */
export function BoopToast() {
  const [message, setMessage] = useState<{ id: number; text: string; top: number } | null>(null);
  const [onVideo, setOnVideo] = useState(true);
  const timer = useRef<number>();
  const reduced = useReducedMotion();

  useBoops((total) => {
    const text = easterEggs.boopMessage(total);
    const top = messageTop();
    const letters = Array.from(text).length;
    const showMs = (FADE_IN + letters * WAVE_STAGGER + WAVE_BUMP + HOLD_AFTER_WAVE) * 1000;
    window.clearTimeout(timer.current);
    setOnVideo(overHero(top));
    setMessage({ id: total, text, top });
    timer.current = window.setTimeout(() => setMessage(null), showMs);
  });

  // Keep the colour right if the visitor scrolls while the note is showing.
  useEffect(() => {
    if (!message) return;
    const update = () => setOnVideo(overHero(message.top));
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [message]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message.id}
            aria-label={message.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: FADE_IN, ease: "easeOut" } }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.6, ease: "easeIn" } }}
            style={{ top: message.top }}
            className={`absolute inset-x-0 -mt-[0.5em] whitespace-pre px-4 text-center font-hand text-[1.7rem] leading-none transition-[color,text-shadow] duration-300 md:text-[2rem] ${
              onVideo ? "glow-warm text-cream" : "glow-soft text-plum"
            }`}
          >
            {Array.from(message.text).map((char, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block"
                style={
                  reduced
                    ? undefined
                    : {
                        animation: `boop-wave ${WAVE_BUMP}s ease-in-out ${FADE_IN + 0.05 + i * WAVE_STAGGER}s both`,
                      }
                }
              >
                {char}
              </span>
            ))}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
