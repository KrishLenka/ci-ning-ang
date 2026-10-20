import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useBoops } from "@/hooks/useBoops";

// A little quokka that now and then peeks in from the left or right edge of the screen while the
// visitor is reading the content (never over the hero), like a puppy with its paws on the edge
// of its playpen, turned on its side. Its paws come onto the edge first, then its head pops out
// behind them. It puffs out its cheeks and gives a small retro nod every couple of seconds, then slips back out
// after 5-10 s, or right away if tapped (with a little heart) or if the visitor scrolls back up
// to the hero.
//
// The peek is drawn as if from the bottom edge, then the whole thing is turned a quarter so
// that "bottom" becomes the left or right side of the screen.

const FIRST_AFTER: [number, number] = [5, 10]; // s of reading before the first one
const EVERY: [number, number] = [15, 30]; // s of reading between quokkas
const PUFF_FOR: [number, number] = [5, 10]; // s it stays out with its cheeks puffed
const PAWS_FIRST = 350; // ms between the paws reaching the edge and the head coming up
const HEAD_UP = 0.85; // s for the head to pop up
const HEAD_DOWN = HEAD_UP;
const PUFF_AFTER = 350; // ms after the head settles before the cheeks puff
const NOD_HOLD = 500; // ms the head stays down before popping back up
const NOD_UP_HOLD = NOD_HOLD;

/* Pixel art, facing the viewer. The head is 22 x 15, the paws 6 x 3. */
const CALM = [
  "...OOO..........OOO...",
  "..OBIBO........OBIBO..",
  "..OBIIBOOOOOOOOBIIBO..",
  "..OBBBBBBBBBBBBBBBBO..",
  "...OBBBBBBBBBBBBBBO...",
  "..OBBBBBBBBBBBBBBBBO..",
  ".OBBBBBBBBBBBBBBBBBBO.",
  ".OBBWEBBBBBBBBBBWEBBO.",
  ".OBBEEBBBBLLBBBBEEBBO.",
  ".OBBEEBBBLLLLBBBEEBBO.",
  ".OBPPBBLLLNNLLLBBPPBO.",
  ".OBBBBLLLMLLMLLLBBBBO.",
  "..OBBLLLLLMMLLLLLBBO..",
  "...OBBLLLLLLLLLLBBO...",
  "....OOOOOOOOOOOOOO....",
];
// Cheeks puffed out past the outline, a tiny pursed mouth.
const PUFF = [
  ...CALM.slice(0, 10),
  "OBCCCBBLLLNNLLLBBCCCBO",
  "OCPPCCLLLLLLLLLLCCPPCO",
  "OCCCCLLLLLMMLLLLLCCCCO",
  ".OCCLLLLLLLLLLLLLLCCO.",
  "..OOOOOOOOOOOOOOOOOO..",
];
const PAW = [".OOOO.", "OBLLBO", "OLLLLO"];
// A little heart that pops out when it's tapped, like the piglets' (7 x 6).
const HEART = [".DD.DD.", "DRRDRRD", "DRRRRRD", ".DRRRD.", "..DRD..", "...D..."];
const HEART_SCALE = 2; // whole screen px per art pixel (14 x 12 px), about a piglet's heart

const HEAD_W = 22, HEAD_H = 15, PAW_W = 6, PAW_H = 3;
const BOX_H = HEAD_H + 1; // the chin rests one pixel above the edge, behind the paws
const SCALE = 2; // exactly 2 screen px per art pixel keeps the pixel art crisp (44 x 32 px)
const NOD_DROP = 2 * SCALE; // how far the head dips: 2 art pixels, in whole screen px

const PALETTE: Record<string, string> = {
  O: "#4a3325", B: "#a9825f", L: "#ecd6ba", I: "#e8a596", E: "#1f140e",
  W: "#ffffff", N: "#2e1f17", M: "#6e4232", P: "#f4a6a4", C: "#f6e4cc",
  R: "#ff86ad", D: "#c23f6c",
};

function sprite(rows: string[]) {
  const c = document.createElement("canvas");
  c.width = rows[0].length; c.height = rows.length;
  const g = c.getContext("2d")!;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (!PALETTE[ch]) return;
    g.fillStyle = PALETTE[ch];
    g.fillRect(x, y, 1, 1);
  }));
  return c.toDataURL();
}

let art: { calm: string; puff: string; paw: string; heart: string } | null = null;
const getArt = () => (art ??= { calm: sprite(CALM), puff: sprite(PUFF), paw: sprite(PAW), heart: sprite(HEART) });

const rand = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** paws: paws on the edge · up: head up · puff: cheeks puffed, nodding · down: head sinking · gone: paws dropping */
type Phase = "paws" | "up" | "puff" | "down" | "gone";
/** top: whole px from the top of the screen (whole px keep the pixel art sharp) */
type Peek = { id: number; side: "left" | "right"; top: number; phase: Phase; quick: boolean };

export function Quokka() {
  const [peek, setPeek] = useState<Peek | null>(null);
  /** the heart popping out of a tapped quokka, in screen px (one at a time) */
  const [heart, setHeart] = useState<{ id: number; x: number; y: number } | null>(null);
  const boop = useBoops(); // a tapped quokka counts toward the piglets' boop total
  const reduced = useReducedMotion();
  const hideRef = useRef<(quick: boolean) => void>(() => {});
  const state = useRef({ inContent: false, wait: rand(FIRST_AFTER), showing: false, timers: [] as number[] });

  useEffect(() => {
    const s = state.current;
    const later = (ms: number, fn: () => void) => s.timers.push(window.setTimeout(fn, ms));
    const clear = () => { s.timers.forEach((t) => window.clearTimeout(t)); s.timers = []; };
    const phase = (p: Phase, quick = false) => setPeek((q) => (q ? { ...q, phase: p, quick } : q));

    const hide = (quick: boolean) => {
      if (!s.showing) return;
      clear();
      s.showing = false;
      s.wait = rand(EVERY);
      if (quick) {
        // tapped, or scrolled away: duck straight down
        phase("down");
        later(480, () => phase("gone"));
        later(260, () => setPeek(null));
      } else {
        // cheeks go down, the head sinks, then the paws let go
        phase("down");
        later(480, () => phase("gone"));
        later(900, () => setPeek(null));
      }
    };
    const show = () => {
      s.showing = true;
      // anywhere along the left or right edge, clear of the navbar at the top
      const top = Math.round(window.innerHeight * (0.18 + Math.random() * 0.6));
      setPeek({ id: Date.now(), side: Math.random() < 0.5 ? "left" : "right", top, phase: "paws", quick: false });
      later(PAWS_FIRST, () => phase("up"));
      const puffAt = PAWS_FIRST + HEAD_UP * 1000 + PUFF_AFTER;
      later(puffAt, () => phase("puff"));
      later(puffAt + rand(PUFF_FOR) * 1000, () => hide(false));
    };
    hideRef.current = hide;

    // "In the content": the hero is (almost) scrolled out of view. Back up at the hero, any
    // quokka ducks away and the countdown pauses.
    const hero = document.getElementById("top");
    const io = new IntersectionObserver(
      ([en]) => {
        s.inContent = en.intersectionRatio < 0.2;
        if (!s.inContent) hide(true);
      },
      { threshold: [0, 0.2, 0.4] },
    );
    if (hero) io.observe(hero);

    // The countdown only runs while the visitor is reading the content.
    const tick = window.setInterval(() => {
      if (!s.inContent || s.showing || document.hidden) return;
      s.wait -= 0.25;
      if (s.wait <= 0) show();
    }, 250);

    return () => { io.disconnect(); window.clearInterval(tick); clear(); };
  }, []);

  // Retro nod, like the piglets swapping eating frames: the head snaps down, holds, snaps back
  // up and rests, with no in-between positions. One nod every NOD_EVERY s while puffed.
  const [nodDown, setNodDown] = useState(false);
  const nodding = peek?.phase === "puff" && !reduced;
  useEffect(() => {
    if (!nodding) {
      setNodDown(false);
      return;
    }
    let timer = 0;
    const nod = () => {
      setNodDown(true);
      timer = window.setTimeout(() => {
        setNodDown(false);
        timer = window.setTimeout(nod, NOD_UP_HOLD);
      }, NOD_HOLD);
    };
    timer = window.setTimeout(nod, 500);
    return () => window.clearTimeout(timer);
  }, [nodding]);

  const A = getArt();
  const heartLayer = heart && (
    <motion.img
      key={heart.id}
      src={A.heart}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none fixed z-40 select-none"
      style={{ left: heart.x, top: heart.y, width: 7 * HEART_SCALE, height: 6 * HEART_SCALE, imageRendering: "pixelated" }}
      // pops out, floats up a little and fades
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 0 }}
      animate={reduced ? { opacity: [0, 1, 0] } : { opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1], y: -22 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      onAnimationComplete={() => setHeart(null)}
    />
  );
  if (!peek) return <>{heartLayer}</>;
  const { phase, quick } = peek;
  const headUp = phase === "up" || phase === "puff";
  const pawsUp = phase !== "gone";
  const puffed = phase === "puff";
  const ease = [0.33, 1, 0.68, 1] as const; // smooth ease-out

  // With reduced motion: no sliding or nodding, just a gentle fade in and out.
  const hidden = reduced ? { opacity: 0 } : { y: "110%" };
  const shown = reduced ? { opacity: 1 } : { y: "0%" };
  const headT = quick ? { duration: 0.18, ease: "easeIn" as const }
    : reduced ? { duration: 0.3 }
    : headUp ? { type: "tween" as const, duration: HEAD_UP, ease: "easeInOut" as const }
    : { type: "tween" as const, duration: HEAD_DOWN, ease: "easeInOut" as const };
  const pawT = quick ? { duration: 0.15, ease: "easeIn" as const } : { duration: 0.32, ease };

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  const tapped = (box: DOMRect) => {
    // Only the first tap counts: it's already ducking away after that.
    if (!state.current.showing) return;
    // just in front of its face, toward the middle of the screen
    const x = Math.round(peek.side === "left" ? box.right + 2 : box.left - 7 * HEART_SCALE - 2);
    const y = Math.round(box.top + box.height / 2 - 6 * HEART_SCALE);
    setHeart({ id: Date.now(), x, y });
    boop();
    hideRef.current(true);
  };

  return (
    <>
    {heartLayer}
    <button
      key={peek.id}
      type="button"
      aria-label="A quokka peeking in. Tap to shoo it away"
      onClick={(e) => tapped(e.currentTarget.getBoundingClientRect())}
      // the turned peek's footprint: as wide as the head is tall, as tall as it is wide
      className="fixed z-40 block cursor-pointer overflow-visible bg-transparent p-0"
      style={{ width: BOX_H * SCALE, height: HEAD_W * SCALE, top: peek.top, [peek.side]: 0 }}
    >
      {/* the peek, drawn upright, then turned so its bottom edge sits on this side of the screen
          (a quarter turn clockwise for the left edge, anticlockwise for the right) */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: HEAD_W * SCALE, height: BOX_H * SCALE,
          transform: `translate(-50%, -50%) rotate(${peek.side === "left" ? 90 : -90}deg)`,
        }}
      >
      {/* the head pops up from below the edge (behind the paws) */}
      <motion.div
        className="absolute left-0 top-0 w-full"
        style={{ height: pct(HEAD_H, BOX_H) }}
        initial={hidden}
        animate={headUp ? shown : hidden}
        transition={headT}
      >
        {/* a small retro nod while the cheeks are puffed (see nodDown above) */}
        <div className="h-full w-full" style={{ transform: `translateY(${nodDown ? NOD_DROP : 0}px)` }}>
          <motion.img
            key={puffed ? "puff" : "calm"}
            src={puffed ? A.puff : A.calm}
            alt=""
            draggable={false}
            className="h-full w-full select-none"
            style={{ imageRendering: "pixelated", transformOrigin: "50% 100%" }}
            // the cheeks fill out with a little pop
            initial={puffed && !reduced ? { scale: 0.96 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.5 }}
          />
        </div>
      </motion.div>
      {/* two paws resting on the edge, in front of the chin */}
      {[3, 13].map((x) => (
        <motion.img
          key={x}
          src={A.paw}
          alt=""
          draggable={false}
          className="absolute bottom-0 select-none"
          style={{ imageRendering: "pixelated", left: pct(x, HEAD_W), width: pct(PAW_W, HEAD_W), height: pct(PAW_H, BOX_H) }}
          initial={hidden}
          animate={pawsUp ? shown : hidden}
          transition={pawT}
        />
      ))}
      </div>
    </button>
    </>
  );
}
