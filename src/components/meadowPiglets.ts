/**
 * Meadow Piglets — little piglets that live in the hero video.
 *
 * - Eight piglets at different distances wander the open grass, graze, flop
 *   down for a rest, fall asleep (with floating z's) and roll on their backs.
 * - Click one (the cursor never changes): awake piglets squeal, hop or roll
 *   with a heart; sleeping piglets startle awake.
 * - Piglets near the lake show a soft, rippling reflection in the water.
 * - Rarely, a winged piglet flies across the sky. Click it for a loop.
 * - summonFlyer("purple" | "gold" | "rainbow") sends a special piggy with a
 *   short sparkle trail in its own colour (used for boop milestones).
 * - Every 7th piglet click summons a flyer (easter egg hook, no UI;
 *   set easterEggClicks: 0 to turn it off, easterEggCooldown to space them out).
 * - mode: "nap" keeps piglets in place, mostly asleep (used for single piglets).
 *
 * Positions are in the hero video's own pixel space (1924x1076) and mapped
 * to the screen with the same math as `object-fit: cover`, so the piglets
 * stay on the grass at every screen size. No dependencies.
 */

export type Vec = [number, number];

export interface PigletZone {
  /** Ground line the piglet walks along (its feet), in video pixels. */
  from: Vec;
  to: Vec;
  /** Video pixels per sprite pixel. Bigger = closer to the camera. */
  scale: number;
  /** 0–1, distance haze that tints the piglet toward the sky. */
  haze?: number;
}

export interface WaterConfig {
  /** Outline of the lake in video pixels; reflections are clipped to it. */
  polygon: Vec[];
  /** Mirror line [x, y] points, left to right, where the water reflects. */
  axis: Vec[];
}

export interface MeadowPigletsOptions {
  canvas: HTMLCanvasElement;
  videoSize?: { width: number; height: number };
  /** Must match the video's CSS object-position (default centered). */
  objectPosition?: { x: number; y: number };
  zones?: PigletZone[];
  /** Lake reflections; pass false to turn them off. */
  water?: WaterConfig | false;
  flyingPiglets?: boolean;
  /** Seconds between flyers, [min, max] (default [75, 150]). */
  flyEvery?: [number, number];
  /** Every Nth piglet click sends a normal flyer (default 7, 0 = off). */
  easterEggClicks?: number;
  /**
   * Seconds after a click-summoned flyer before clicks can summon another (default 0).
   * Clicks keep counting meanwhile; the next one after the cooldown sends it. It also waits
   * while any flyer is already in the sky.
   */
  easterEggCooldown?: number;
  onEasterEgg?: (totalClicks: number) => void;
  onPigletClick?: (kind: "ground" | "flying", wasAsleep: boolean) => void;
  /**
   * "roam" (default): piglets wander their zones. "nap": they never walk, start out asleep
   * and mostly doze, but still graze, roll and react to clicks like roaming piglets.
   */
  mode?: "roam" | "nap";
  /** Draw zone lines, ghost piglets at both ends and the water outline. */
  debug?: boolean;
}

export type FlyerVariant = "normal" | "purple" | "gold" | "rainbow";

export interface MeadowPiglets {
  /** Send a flying piggy now. Special variants leave a sparkle trail. */
  summonFlyer(variant?: FlyerVariant): void;
  /** Current click targets in CSS px relative to the canvas (for tests). */
  hitBoxes(): Array<[number, number, number, number]>;
  destroy(): void;
}

/* ----------------------------------------------------------------------- */
/* Art (30 x 22 frames, generated in the PIGPACK style)                     */
/* ----------------------------------------------------------------------- */

const FRAMES: Record<string, string[]> = {
  stand: [
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........OOOOOOOOBBBEBBBEBBO.",
    "..OOO...OOLLLLLLLLBBBEBBBEBMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMMMMSSO..",
    "......OMMMBBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    ".......OOOSSSSSSSSOOOO........",
    "......OMMOOSSOOOMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OKKOOKKO.OKKOOKKO.......",
    ".......OO..OO...OO..OO........"
  ],
  blink: [
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........OOOOOOOOBBBBBBBBBBO.",
    "..OOO...OOLLLLLLLLBBZZBBBZZMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMMMMSSO..",
    "......OMMMBBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    ".......OOOSSSSSSSSOOOO........",
    "......OMMOOSSOOOMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OKKOOKKO.OKKOOKKO.......",
    ".......OO..OO...OO..OO........"
  ],
  walkA: [
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........OOOOOOOOBBBEBBBEBBO.",
    "..OOO...OOLLLLLLLLBBBEBBBEBMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMMMMSSO..",
    "......OMMMBBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    "......OOOOSSSSSSSSOO.OO.......",
    ".....OMMO.OOSSOMMO..OSSO......",
    ".....OMMO..OSSOMMO..OSSO......",
    ".....OMMO..OSSOMMO..OSSO......",
    ".....OKKO..OKKOKKO..OKKO......",
    "......OO....OO.OO....OO......."
  ],
  walkB: [
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........OOOOOOOOBBBEBBBEBBO.",
    "..OOO...OOLLLLLLLLBBBEBBBEBMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMMMMSSO..",
    "......OMMMBBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    "........OOSSSSSSSSOOO.........",
    ".......OMMSSOOOOOMMSSO........",
    ".......OMMSSO...OMMSSO........",
    ".......OMMSSO...OMMSSO........",
    ".......OMMSSO...OMMSSO........",
    ".......OKKKKO...OKKKKO........",
    "........OOOO.....OOOO........."
  ],
  squeal: [
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........OOOOOOOOBBBEBBBEBBO.",
    "..OOO...OOLLLLLLLLBBBEBBBEBMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMNNNMSO..",
    "......OMMMBBBBBBBBMMMMTTTMO...",
    "......OSMMMMMMMMMMMMSSSSSSO...",
    ".......OSSMMMMMMMMSSOOOOOO....",
    ".......OOOSSSSSSSSOOOO........",
    "......OMMOOSSOOOMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OMMOOSSO.OMMOOSSO.......",
    "......OKKOOKKO.OKKOOKKO.......",
    ".......OO..OO...OO..OO........"
  ],
  eatA: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "...................O........O.",
    "..........OOOOOOOOOLO......OBO",
    "..OOO...OOLLLLLLLLOBLOOOOOOBBO",
    ".OLLLO.OLLBBBBBBBBLBBLLLBBBBBO",
    ".OMOSLOLBBBBBBBBBBBBBBBBBBBBO.",
    ".OSSOOOBBBBBBBBBBBBBBBBBBBBBO.",
    "..OO.OLMBBBBBBBBBBBBBBBBBBBBBO",
    "......OMMMBBBBBBBBMMBBEBBBEBMO",
    "......OSMMMMMMMMMMMMBBEBBBEBMO",
    ".......OSSMMMMMMMMSSMMMDDDMMSO",
    ".......OOOSSSSSSSSOOMMDNDNDMO.",
    "......OMMOOSSOOMMOSSSSMDDDMSO.",
    "......OMMOOSSOOMMOSSOOSSSSOO..",
    "......OMMOOSSOOMMOSSO.OOOO....",
    "......OKKOOKKOOKKOKKO.........",
    ".......OO..OO..OO.OO.........."
  ],
  eatB: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..........OOOOOOOO.O........O.",
    "..OOO...OOLLLLLLLLOLO......OBO",
    ".OLLLO.OLLBBBBBBBBLBLOOOOOOBBO",
    ".OMOSLOLBBBBBBBBBBBBBLLLBBBBBO",
    ".OSSOOOBBBBBBBBBBBBBBBBBBBBBO.",
    "..OO.OLMBBBBBBBBBBBBBBBBBBBBO.",
    "......OMMMBBBBBBBBMBBBBBBBBBBO",
    "......OSMMMMMMMMMMMMBBBBBBBBMO",
    ".......OSSMMMMMMMMSMBZZBBBZZMO",
    ".......OOOSSSSSSSSOSMMMDDDMMSO",
    "......OMMOOSSOOMMOSSMMDNDNDMO.",
    "......OMMOOSSOOMMOSSSSMDDDMSO.",
    "......OMMOOSSOOMMOSSOOSSSSOO..",
    "......OKKOOKKOOKKOKKO.OOOO....",
    ".......OO..OO..OO.OO.........."
  ],
  rest: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    ".........OOOOOOOOOOBBBBBBBBO..",
    ".......OOLLLLLLLLLBBBBBBBBBBO.",
    ".OOO..OLLBBBBBBBBBBBBBBBBBBBO.",
    "OLLLOOLBBBBBBBBBBBBBBEBBBEBBO.",
    "OMOSLOBBBBBBBBBBBBBBBEBBBEBBO.",
    "OSSOOLBBBBBBBBBBBBBBBMDDDMBBO.",
    ".OO.OBBBBBBBBBBBBBBBBDNDNDBBO.",
    "....OMMMMMMMMMMMMMMMMMDDDMMMO.",
    "....OMMMMMMMMMMMMMMMMMMMMMMMO.",
    "....OSSSSSSSSSSSSSSSSSSSSSSSO.",
    ".....OOOOOOOOOOOOOOOOOOOOOOO.."
  ],
  sleepA: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    ".........OOOOOOOOOOBBBBBBBBO..",
    ".......OOLLLLLLLLLBBBBBBBBBBO.",
    ".OOO..OLLBBBBBBBBBBBBBBBBBBBO.",
    "OLLLOOLBBBBBBBBBBBBBBBBBBBBBO.",
    "OMOSLOBBBBBBBBBBBBBBZZBBBZZBO.",
    "OSSOOLBBBBBBBBBBBBBBBMDDDMBBO.",
    ".OO.OBBBBBBBBBBBBBBBBDNDNDBBO.",
    "....OMMMMMMMMMMMMMMMMMDDDMMMO.",
    "....OMMMMMMMMMMMMMMMMMMMMMMMO.",
    "....OSSSSSSSSSSSSSSSSSSSSSSSO.",
    ".....OOOOOOOOOOOOOOOOOOOOOOO.."
  ],
  sleepB: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    ".........OOOOOOOOOOBBBBBBBBO..",
    ".......OOLLLLLLLLLBBBBBBBBBO..",
    "......OLLBBBBBBBBBBBBBBBBBBBO.",
    ".OOO.OLBBBBBBBBBBBBBBBBBBBBBO.",
    "OLLLOOBBBBBBBBBBBBBBBBBBBBBBO.",
    "OMOSLLBBBBBBBBBBBBBBZZBBBZZBO.",
    "OSSOOBBBBBBBBBBBBBBBBMDDDMBBO.",
    ".OO.OBBBBBBBBBBBBBBBBDNDNDBBO.",
    "....OMMMMMMMMMMMMMMMMMDDDMMMO.",
    "....OMMMMMMMMMMMMMMMMMMMMMMMO.",
    "....OSSSSSSSSSSSSSSSSSSSSSSSO.",
    ".....OOOOOOOOOOOOOOOOOOOOOOO.."
  ],
  backA: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    ".......OO......OO.............",
    "......OKKOOO..OKKOOO..........",
    "......OMMOKKO.OMMOKKO.........",
    "......OMMOMMO.OMMOMMOOOOO.....",
    "......OMMOMMOOOMMOMMOLLLBOO...",
    ".......OOLLLLLLLLLOLLBBBBBBO..",
    "......OLLBBBBBBBBBLBBMDDDMBO..",
    ".....OLBBBBBBBBBBBBBBDNDNDBBO.",
    ".....OBBBBBBBBBBBBBBBMDDDMBBO.",
    "....OLBBBBBBBBBBBBBBBBBBBBBBO.",
    "....OBBBBBBBBBBBBBBBBZBBBZBBO.",
    "....OMMMMMMMMMMMMMMMZMZMZMZMO.",
    "....OMMMMMMMMMMMMMMMMMMMMMMMO.",
    "....OSSSSSSSSSSSSSSSSSSSSSSSO.",
    ".....OOOOOOOOOOOOOOOOOOOOOOO.."
  ],
  backB: [
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "...........OO....OO...........",
    "........OOOKKOOOOKKO..........",
    ".......OKKOMMOKKOMMO..........",
    ".......OMMOMMOMMOMMO.OOOO.....",
    ".......OMMOMMOMMOMMOOLLLBOO...",
    ".......OOLLLLLLLLLOLLBBBBBBO..",
    "......OLLBBBBBBBBBLBBMDDDMBO..",
    ".....OLBBBBBBBBBBBBBBDNDNDBBO.",
    ".....OBBBBBBBBBBBBBBBMDDDMBBO.",
    "....OLBBBBBBBBBBBBBBBBBBBBBBO.",
    "....OBBBBBBBBBBBBBBBBZBBBZBBO.",
    "....OMMMMMMMMMMMMMMMZMZMZMZMO.",
    "....OMMMMMMMMMMMMMMMMMMMMMMMO.",
    "....OSSSSSSSSSSSSSSSSSSSSSSSO.",
    ".....OOOOOOOOOOOOOOOOOOOOOOO.."
  ],
  flyUp: [
    "...UvwwUU.........O........O..",
    "..UvvwwwwUU......OLO......OBO.",
    "..UvwvwwvwwUU....OBLOOOOOOBBO.",
    "...UvwvwwvwwwU...OBBLLLLBBBBO.",
    "....UvwvwwvwwwU...OBBBBBBBBO..",
    ".....UUvvwwvwwwU..OBBBBBBBBO..",
    ".......UUvwwvwwwUOBBBBBBBBBBO.",
    ".........UOvwvwwOOBBBEBBBEBBO.",
    "..OOO...OOLLLLLLLLBBBEBBBEBMO.",
    ".OLLLO.OLLBBBBBBBBBBBMDDDMBMO.",
    ".OMOSLOLBBBBBBBBBBBBBDNDNDMSO.",
    ".OSSOOOBBBBBBBBBBBBBBMDDDMMO..",
    "..OO.OLMBBBBBBBBBBBBMMMMMSSO..",
    "......OMMMBBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    "........OOSSSSSSSSOOO.........",
    ".......OMMOSSOOOMMOSSO........",
    ".......OKKOKKO.OKKOKKO........",
    "........OO.OO...OO.OO.........",
    "..............................",
    ".............................."
  ],
  flyDown: [
    "..................O........O..",
    ".................OLO......OBO.",
    ".................OBLOOOOOOBBO.",
    ".................OBBLLLLBBBBO.",
    "..................OBBBBBBBBO..",
    "..................OBBBBBBBBO..",
    ".................OBBBBBBBBBBO.",
    "..........UUUUUUOOBBBEBBBEBBO.",
    "..OOO...UUvwwwwwLLBBBEBBBEBMO.",
    ".OLLLOUUvwwwwwwwBBBBBMDDDMBMO.",
    ".OMOSLvwvwwvwwvwBBBBBDNDNDMSO.",
    ".OSSOvwvwwvwwvwBBBBBBMDDDMMO..",
    "..OOUvvwwvwwvBBBBBBBMMMMMSSO..",
    ".....UvvvvvBBBBBBBMMMSSSSOO...",
    "......OSMMMMMMMMMMMMSOOOO.....",
    ".......OSSMMMMMMMMSSO.........",
    "........OOSSSSSSSSOOO.........",
    ".......OMMOSSOOOMMOSSO........",
    ".......OKKOKKO.OKKOKKO........",
    "........OO.OO...OO.OO.........",
    "..............................",
    ".............................."
  ]
};

const PALETTE: Record<string, string> = {
  O: "#2b1a22", U: "#7d6f99", B: "#f09693", L: "#f6b6b2", M: "#dc8885", S: "#b56b69",
  D: "#c47472", E: "#281717", N: "#3c2625", K: "#7a4443", T: "#f7dede", Z: "#3c2625",
  w: "#ffffff", v: "#ddd5f2",
  r: "#ff6d98", R: "#c93a6a", y: "#fff3b8", z: "#6b5a8e", x: "#ffffff",
};

const GLYPHS: Record<string, string[]> = {
  heart: [".RR.RR.", "RrrRrrR", "RrxrrrR", ".RrrrR.", "..RrR..", "...R..."],
  z: ["zzzz", "..z.", ".z..", "zzzz"],
  bang: ["RR", "RR", "RR", "..", "RR"],
  spark: [".y.", "yyy", ".y."],
};

const SPRITE_W = 30, SPRITE_H = 22, UP = 4; // UP: pre-upscale factor for smooth scaling

type Sprite = HTMLCanvasElement;
const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Bake a grid into a canvas, nearest-neighbour upscaled so it can be drawn
 *  smoothly at any size without jaggies. `tint` mixes toward a colour. */
type Recolor = (ch: string, x: number, y: number) => string | undefined;
function bake(grid: string[], tint?: { color: string; amount: number }, recolor?: Recolor): Sprite {
  const h = grid.length, w = grid[0].length;
  const c = document.createElement("canvas");
  c.width = w * UP; c.height = h * UP;
  const ctx = c.getContext("2d")!;
  const t = tint ? hex(tint.color) : null;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = (recolor && recolor(grid[y][x], x, y)) || PALETTE[grid[y][x]];
      if (!col) continue;
      let [r, g, b] = hex(col);
      if (t && tint) {
        r = Math.round(r * (1 - tint.amount) + t[0] * tint.amount);
        g = Math.round(g * (1 - tint.amount) + t[1] * tint.amount);
        b = Math.round(b * (1 - tint.amount) + t[2] * tint.amount);
      }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * UP, y * UP, UP, UP);
    }
  }
  return c;
}

type FrameSet = Record<string, Sprite>;
const cache = new Map<string, FrameSet>();
function frameSet(key: string, tint?: { color: string; amount: number }): FrameSet {
  let s = cache.get(key);
  if (!s) {
    s = {};
    for (const k of Object.keys(FRAMES)) s[k] = bake(FRAMES[k], tint);
    for (const k of Object.keys(GLYPHS)) s[k] = bake(GLYPHS[k]);
    cache.set(key, s);
  }
  return s;
}
const SKY = "#dce6f4", WATER = "#93a9c9";

/* Special flyer colourways. Body shades map B/L/M/S/D/K; wings stay white. */
const hsl = (h: number, s: number, l: number) => {
  s /= 100; l /= 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
const VARIANT_BODY: Record<"purple" | "gold", Record<string, string>> = {
  purple: { B: "#b98be8", L: "#d8bdf8", M: "#a275d6", S: "#8459b8", D: "#9466c9", K: "#5e3a8a", v: "#e6dafc" },
  gold: { B: "#f4c84e", L: "#fde59c", M: "#e2ac2e", S: "#c48b1c", D: "#d59a26", K: "#8f6012", v: "#fff0c2" },
};
const RAINBOW_SHADES: Record<string, [number, number]> = { B: [85, 76], L: [90, 86], M: [75, 68], S: [62, 58], D: [70, 64], K: [45, 40] };
export const TRAIL_COLORS: Record<Exclude<FlyerVariant, "normal">, string[]> = {
  purple: ["#c9a2ff", "#a974f0", "#e4d2ff"],
  gold: ["#ffd84a", "#ffe9a0", "#f5b82e"],
  rainbow: ["#ff7a9c", "#ffb35c", "#ffe25c", "#7fe08a", "#6ec4ff", "#b48cff"],
};
const variantCache = new Map<string, { flyUp: Sprite; flyDown: Sprite }>();
function flyerSprites(variant: FlyerVariant) {
  let s = variantCache.get(variant);
  if (!s) {
    const recolor: Recolor | undefined =
      variant === "normal" ? undefined
      : variant === "rainbow"
        ? (ch, _x, y) => (RAINBOW_SHADES[ch] ? hsl(Math.max(0, Math.min(1, (y - 2) / 16)) * 285, RAINBOW_SHADES[ch][0], RAINBOW_SHADES[ch][1]) : undefined)
        : (ch) => VARIANT_BODY[variant][ch];
    const tint = { color: SKY, amount: 0.06 };
    s = { flyUp: bake(FRAMES.flyUp, tint, recolor), flyDown: bake(FRAMES.flyDown, tint, recolor) };
    variantCache.set(variant, s);
  }
  return s;
}
const TRAIL_STAR = ["..c..", "..c..", "ccWcc", "..c..", "..c.."];
const trailCache = new Map<string, Sprite>();
function trailSprite(color: string): Sprite {
  let s = trailCache.get(color);
  if (!s) {
    s = bake(TRAIL_STAR, undefined, (ch) => (ch === "c" ? color : ch === "W" ? "#ffffff" : undefined));
    trailCache.set(color, s);
  }
  return s;
}
const landSprites = (haze: number) => frameSet("l" + Math.round(haze * 20), haze > 0 ? { color: SKY, amount: haze } : undefined);
const waterSprites = (haze: number) => frameSet("w" + Math.round(haze * 20), { color: WATER, amount: Math.min(0.75, 0.35 + haze) });

/* ----------------------------------------------------------------------- */
/* Defaults tuned to the cherry-blossom meadow video (1924 x 1076)          */
/* Every zone sits on open grass, clear of trees and water.                 */
/* ----------------------------------------------------------------------- */

export const DEFAULT_ZONES: PigletZone[] = [
  { from: [578, 446], to: [655, 459], scale: 0.72, haze: 0.26 }, // left hilltop, far
  { from: [500, 480], to: [640, 505], scale: 0.92, haze: 0.18 }, // left upper slope
  { from: [345, 536], to: [480, 549], scale: 1.18, haze: 0.1 },  // under the big tree
  { from: [565, 557], to: [790, 569], scale: 1.08, haze: 0.12 }, // left shore
  { from: [905, 568], to: [1040, 571], scale: 0.58, haze: 0.32 }, // far bank, tiny
  { from: [1230, 586], to: [1400, 590], scale: 1.08, haze: 0.12 }, // right shore
  { from: [1460, 560], to: [1620, 546], scale: 1.02, haze: 0.12 }, // right hill
  { from: [1655, 600], to: [1860, 588], scale: 1.42, haze: 0.05 }, // near meadow
];

export const DEFAULT_WATER: WaterConfig = {
  polygon: [
    [380, 620], [470, 606], [560, 594], [700, 590], [850, 586], [960, 579], [1080, 579],
    [1180, 583], [1240, 593], [1350, 599], [1500, 601], [1580, 604], [1650, 611],
    [1750, 626], [1830, 642], [1790, 700], [1700, 720], [1500, 765], [1200, 785],
    [900, 785], [600, 765], [460, 705], [390, 650],
  ],
  axis: [
    [300, 602], [450, 600], [600, 594], [800, 586], [1000, 580], [1200, 585],
    [1400, 591], [1500, 598], [1600, 606], [1800, 620], [1924, 626],
  ],
};

/* ----------------------------------------------------------------------- */
/* Engine                                                                   */
/* ----------------------------------------------------------------------- */

type State = "idle" | "walk" | "eat" | "rest" | "sleep" | "roll" | "hop" | "squeal" | "wake";

interface Pig {
  zone: PigletZone; len: number; u: number; facing: 1 | -1;
  state: State; t: number; dur: number; targetU: number;
  blink: number; hops: number; zTimer: number;
  box: [number, number, number, number] | null;
}
interface Flyer {
  variant: FlyerVariant; trailT: number; px: number; py: number;
  x: number; y0: number; dir: 1 | -1; t: number; speed: number;
  loopT: number; loopX: number; loopY: number;
  box: [number, number, number, number] | null;
}
interface Particle {
  kind: "heart" | "z" | "bang" | "spark" | "trail";
  color?: string;
  x: number; y: number; vx: number; vy: number; life: number; age: number; scale: number; wobble: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role=button],[data-piglet-ignore]";

function lerpAxis(axis: Vec[], x: number): number {
  if (x <= axis[0][0]) return axis[0][1];
  for (let i = 1; i < axis.length; i++) {
    if (x <= axis[i][0]) {
      const [x0, y0] = axis[i - 1], [x1, y1] = axis[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return axis[axis.length - 1][1];
}

export function createMeadowPiglets(opts: MeadowPigletsOptions): MeadowPiglets {
  const canvas = opts.canvas;
  const ctx = canvas.getContext("2d")!;
  const VW = opts.videoSize?.width ?? 1924;
  const VH = opts.videoSize?.height ?? 1076;
  const pos = opts.objectPosition ?? { x: 0.5, y: 0.5 };
  const zones = opts.zones ?? DEFAULT_ZONES;
  const water = opts.water === false ? null : opts.water ?? DEFAULT_WATER;
  const flyOn = opts.flyingPiglets ?? true;
  const flyEvery = opts.flyEvery ?? [75, 150];
  const eggN = opts.easterEggClicks ?? 7;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const napping = opts.mode === "nap";
  const eggCooldownMs = (opts.easterEggCooldown ?? 0) * 1000;

  const pigs: Pig[] = zones.map((zone) => ({
    zone, len: Math.hypot(zone.to[0] - zone.from[0], zone.to[1] - zone.from[1]),
    u: rand(0.1, 0.9), facing: Math.random() < 0.5 ? 1 : -1,
    state: "idle", t: 0, dur: rand(0.3, 2.5), targetU: 0.5,
    blink: rand(1, 4), hops: 0, zTimer: 0, box: null,
  }));
  // A couple of piglets start out napping or grazing so the scene feels lived-in.
  if (!reduced && pigs.length > 1) {
    const sleepy = pigs[Math.floor(Math.random() * pigs.length)];
    sleepy.state = "sleep"; sleepy.dur = rand(12, 25);
    const hungry = pigs[(pigs.indexOf(sleepy) + 3) % pigs.length];
    hungry.state = "eat"; hungry.dur = rand(5, 10);
  }
  if (napping) for (const p of pigs) { p.state = "sleep"; p.dur = rand(20, 45); }
  const flyers: Flyer[] = [];
  const particles: Particle[] = [];
  let nextFly = rand(40, 70);
  let clicks = 0, sinceEgg = 0, lastEgg = -Infinity;

  /* ---------------- screen mapping ---------------- */
  let dpr = 1, cssW = 0, cssH = 0, cs = 1, ox = 0, oy = 0;
  function measure() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = r.width; cssH = r.height;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    cs = Math.max(cssW / VW, cssH / VH);
    ox = (cssW - VW * cs) * pos.x;
    oy = (cssH - VH * cs) * pos.y;
  }
  const toX = (vx: number) => (ox + vx * cs) * dpr;
  const toY = (vy: number) => (oy + vy * cs) * dpr;
  /** device px per sprite px */
  const unit = (scale: number) => scale * cs * dpr;
  const visible = () => ({ x0: -ox / cs, x1: (cssW - ox) / cs, y0: -oy / cs, y1: (cssH - oy) / cs });

  const groundPos = (p: Pig): Vec => {
    const { from, to } = p.zone;
    return [from[0] + (to[0] - from[0]) * p.u, from[1] + (to[1] - from[1]) * p.u];
  };
  const forward = (p: Pig) => (p.zone.to[0] > p.zone.from[0] ? 1 : -1) * p.facing;

  /* ---------------- behaviour ---------------- */
  function go(p: Pig, state: State, dur: number) { p.state = state; p.t = 0; p.dur = dur; }

  function choose(p: Pig) {
    if (reduced) return go(p, "idle", rand(2, 5));
    const r = Math.random();
    if (napping) {
      if (r < 0.6) go(p, "sleep", rand(20, 45));
      else if (r < 0.8) go(p, "rest", rand(5, 10));
      else if (r < 0.92) go(p, "eat", rand(3, 6));
      else go(p, "roll", rand(1.8, 2.6));
      return;
    }
    if (r < 0.34) {
      p.targetU = Math.min(0.96, Math.max(0.04, p.u + rand(-0.55, 0.55)));
      p.facing = (p.targetU > p.u) === (p.zone.to[0] > p.zone.from[0]) ? 1 : -1;
      go(p, "walk", 99);
    } else if (r < 0.5) {
      if (Math.random() < 0.4) p.facing = (p.facing * -1) as 1 | -1;
      go(p, "idle", rand(1.5, 4));
    } else if (r < 0.7) go(p, "eat", rand(4, 10));
    else if (r < 0.8) go(p, "rest", rand(4, 9));
    else if (r < 0.9) go(p, "sleep", rand(14, 32));
    else go(p, "roll", rand(1.8, 3));
  }

  function emit(kind: Particle["kind"], x: number, y: number, scale: number) {
    const heart = kind === "heart";
    particles.push({
      kind, x, y, scale, age: 0, wobble: rand(0, 6),
      vx: (kind === "z" ? 4 : rand(-3, 3)) * scale,
      vy: (kind === "bang" ? -6 : heart ? -15 : kind === "z" ? -9 : rand(-10, 10)) * scale,
      life: heart ? 1.3 : kind === "z" ? 2.2 : kind === "bang" ? 0.8 : 0.6,
    });
  }

  function react(p: Pig) {
    const [gx, gy] = groundPos(p);
    const s = p.zone.scale;
    const asleep = p.state === "sleep";
    if (asleep || p.state === "rest") {
      emit("bang", gx + 6 * s * forward(p), gy - 26 * s, s);
      go(p, "wake", 0.9); // startled squeal + hop, then back to normal
    } else {
      const r = reduced ? 0 : Math.random();
      if (r < 0.45) go(p, "squeal", 0.75);
      else if (r < 0.7) go(p, "roll", 1.8);
      else { p.hops = 2; go(p, "hop", 0.34 * 2); }
      emit("heart", gx + 4 * s * forward(p), gy - 24 * s, s);
    }
    // Neighbours notice: an awake piglet nearby does a little hop.
    for (const q of pigs) {
      if (q === p || ["sleep", "rest", "roll"].includes(q.state)) continue;
      if (Math.abs(groundPos(q)[0] - gx) < 260 && Math.random() < 0.5) {
        q.hops = 1; go(q, "hop", 0.34); q.t = -rand(0.15, 0.4);
      }
    }
    return asleep;
  }

  function spawnFlyer(variant: FlyerVariant = "normal") {
    const v = visible();
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const special = variant !== "normal";
    const x = dir === 1 ? v.x0 - 50 : v.x1 + 50, y0 = v.y0 + (v.y1 - v.y0) * rand(0.14, 0.3);
    flyers.push({
      variant, trailT: 0, px: x, py: y0,
      x, y0, dir, t: 0, speed: special ? rand(80, 98) : rand(95, 125),
      loopT: -1, loopX: 0, loopY: 0, box: null,
    });
  }

  /** Sparkles shed behind a special flyer; each fades within ~0.7 s. */
  function emitTrail(f: Flyer) {
    if (f.variant === "normal") return;
    const colors = TRAIL_COLORS[f.variant];
    particles.push({
      kind: "trail", color: colors[Math.floor(Math.random() * colors.length)],
      x: f.px - f.dir * 15 + rand(-4, 4), y: f.py - 12 + rand(-8, 8),
      vx: -f.dir * rand(3, 10), vy: rand(-3, 8),
      life: rand(0.45, 0.75), age: 0, scale: rand(0.55, 0.95), wobble: 0,
    });
  }

  function update(dt: number) {
    for (const p of pigs) {
      p.t += dt;
      p.blink -= dt;
      if (p.blink < -0.14) p.blink = rand(2, 5);
      if (p.t < 0) continue;
      const s = p.zone.scale;
      switch (p.state) {
        case "walk": {
          const du = (6.5 * s * dt) / p.len;
          if (Math.abs(p.targetU - p.u) <= du) { p.u = p.targetU; go(p, "idle", rand(0.8, 3)); }
          else p.u += Math.sign(p.targetU - p.u) * du;
          break;
        }
        case "sleep": {
          p.zTimer -= dt;
          if (p.zTimer <= 0) {
            const [gx, gy] = groundPos(p);
            emit("z", gx + 7 * s * forward(p), gy - 16 * s, s * 0.9);
            p.zTimer = rand(1.1, 1.7);
          }
          if (p.t > p.dur) go(p, "idle", rand(1, 2)); // wakes up naturally
          break;
        }
        case "wake":
          if (p.t > p.dur) go(p, "idle", rand(0.8, 1.6));
          break;
        default:
          if (p.t > p.dur) {
            if (p.state === "idle") choose(p);
            else go(p, "idle", rand(0.8, 2.5));
          }
      }
    }

    if (flyOn && !reduced) {
      nextFly -= dt;
      if (nextFly <= 0) { spawnFlyer(); nextFly = rand(flyEvery[0], flyEvery[1]); }
    }
    const v = visible();
    for (let i = flyers.length - 1; i >= 0; i--) {
      const f = flyers[i];
      f.t += dt;
      if (f.loopT >= 0) {
        f.loopT += dt;
        if (Math.random() < dt * 12) emit("spark", f.loopX + rand(-20, 20), f.loopY - rand(10, 60), 1.4);
        if (f.loopT > 1.2) { f.loopT = -1; f.x = f.loopX; }
      } else f.x += f.dir * f.speed * dt;
      if (f.variant !== "normal" && !reduced) {
        f.trailT -= dt;
        while (f.trailT <= 0) { emitTrail(f); f.trailT += 0.035; }
      }
      if ((f.dir === 1 && f.x > v.x1 + 70) || (f.dir === -1 && f.x < v.x0 - 70)) flyers.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      q.age += dt;
      q.x += (q.vx + (q.kind === "z" ? Math.sin(q.age * 3 + q.wobble) * 6 * q.scale : 0)) * dt;
      q.y += q.vy * dt;
      if (q.age > q.life) particles.splice(i, 1);
    }
  }

  /* ---------------- pose ---------------- */
  interface Pose { img: string; lift: number; squash: number }
  function pose(p: Pig): Pose {
    const t = Math.max(0, p.t);
    const blink = p.blink < 0;
    switch (p.state) {
      case "walk": {
        const ph = Math.floor(t / 0.2) % 2;
        return { img: ph ? "walkA" : "walkB", lift: 0, squash: 0 };
      }
      case "eat": // nibble, look up now and then
        if (t % 4 > 3.3) return { img: blink ? "blink" : "stand", lift: 0, squash: 0 };
        return { img: Math.floor(t / 0.28) % 2 ? "eatA" : "eatB", lift: 0, squash: 0 };
      case "rest":
        return { img: blink ? "sleepA" : "rest", lift: 0, squash: 0 };
      case "sleep":
        return { img: Math.floor(t / 1.4) % 2 ? "sleepA" : "sleepB", lift: 0, squash: 0 };
      case "roll": {
        if (t < 0.15 || t > p.dur - 0.15) return { img: "rest", lift: 0, squash: 0 };
        return { img: Math.floor(t / 0.16) % 2 ? "backA" : "backB", lift: 0, squash: 0 };
      }
      case "hop": {
        const k = (t % 0.34) / 0.34;
        return { img: "walkA", lift: Math.sin(Math.PI * k) * 6, squash: k < 0.12 || k > 0.88 ? 0.08 : 0 };
      }
      case "squeal": {
        const k = Math.min(1, t / 0.34);
        return { img: "squeal", lift: t < 0.34 ? Math.sin(Math.PI * k) * 4 : 0, squash: 0 };
      }
      case "wake": {
        if (t < 0.18) return { img: "rest", lift: 0, squash: 0 };
        const k = Math.min(1, (t - 0.18) / 0.34);
        return { img: "squeal", lift: t < 0.52 ? Math.sin(Math.PI * k) * 7 : 0, squash: 0 };
      }
      default:
        return { img: blink ? "blink" : "stand", lift: 0, squash: 0 };
    }
  }

  /* ---------------- drawing ---------------- */
  /** Draw a sprite with its bottom-centre at (x, y) device px. */
  function blit(img: Sprite, x: number, y: number, u: number, facing: 1 | -1, opts2: { flipV?: boolean; alpha?: number; squash?: number; rot?: number } = {}) {
    const w = (img.width / UP) * u, h = (img.height / UP) * u;
    const sq = opts2.squash ?? 0;
    ctx.save();
    ctx.globalAlpha = opts2.alpha ?? 1;
    ctx.translate(x, y - (opts2.flipV ? -h / 2 : h / 2));
    if (opts2.rot) ctx.rotate(opts2.rot);
    ctx.scale(facing * (1 + sq), (opts2.flipV ? -1 : 1) * (1 - sq));
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function shadow(x: number, y: number, u: number, k: number) {
    ctx.save();
    ctx.fillStyle = "rgba(38, 66, 24, 0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y - 0.5 * u, 11 * u * k, 1.8 * u * k, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function waterPath() {
    if (!water) return;
    ctx.beginPath();
    water.polygon.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
    ctx.closePath();
  }

  let clock = 0;
  function drawReflection(p: Pig, ps: Pose) {
    if (!water) return;
    const [gx, gy] = groundPos(p);
    const axis = lerpAxis(water.axis, gx);
    const gap = axis - gy;
    // Only piglets near the shore show in the lake; the reflection fades out over the last
    // stretch instead of popping off when a piglet wanders uphill.
    const FADE_START = 28, FADE_END = 44;
    if (gap < -2 || gap >= FADE_END) return;
    const reach = gap <= FADE_START ? 1 : 1 - (gap - FADE_START) / (FADE_END - FADE_START);
    const S = waterSprites(p.zone.haze ?? 0.1);
    const img = S[ps.img];
    const u = unit(p.zone.scale);
    const x = toX(gx);
    const yMirror = toY(axis + gap - 0) + ps.lift * u; // feet mirror below the waterline
    const w = (img.width / UP) * u, h = (img.height / UP) * u;
    ctx.save();
    waterPath();
    ctx.clip();
    // Rippled: draw in thin horizontal bands, each nudged sideways.
    const bands = 14;
    for (let i = 0; i < bands; i++) {
      const sy = (img.height / bands) * i, sh = img.height / bands;
      const dy = (h / bands) * i;
      const shift = Math.sin(clock * 2.2 + i * 0.7 + gx * 0.05) * u * 0.35;
      const fade = (0.42 * (1 - i / bands) + 0.06) * reach;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(x + shift, yMirror + dy + h / bands / 2);
      ctx.scale(p.facing, -1);
      // source band counted from the sprite's bottom (feet touch the waterline)
      ctx.drawImage(img, 0, img.height - sy - sh, img.width, sh, -w / 2, -h / bands / 2, w, h / bands + 1);
      ctx.restore();
    }
    ctx.restore();
  }

  /** Where a flyer is this frame (feet position in video px), its loop rotation and wing frame. */
  function flyerPose(f: Flyer) {
    let fx = f.x, fy = f.y0 + Math.sin(f.t * 2.4) * 12, rot = 0;
    if (f.loopT >= 0) {
      if (!f.loopX) { f.loopX = fx; f.loopY = fy; }
      const a = (Math.min(f.loopT, 1.2) / 1.2) * Math.PI * 2;
      fx = f.loopX + Math.sin(a) * 44 * f.dir;
      fy = f.loopY - (1 - Math.cos(a)) * 44;
      rot = -a * f.dir;
    } else f.loopX = 0;
    const frame: "flyUp" | "flyDown" = Math.floor(f.t / 0.12) % 2 ? "flyUp" : "flyDown";
    return { fx, fy, rot, frame };
  }

  /**
   * A faint, rippling reflection of a flying piglet while it passes over the lake. A true mirror
   * image of something that high would land below the water, so its height above the waterline
   * is squashed (like distant clouds reflecting near the shore).
   */
  const SKY_REFLECT = 0.3;
  function drawFlyerReflection(f: Flyer) {
    if (!water) return;
    const { fx, fy, rot, frame } = flyerPose(f);
    const axis = lerpAxis(water.axis, fx);
    if (fy >= axis) return;
    const img = flyerSprites(f.variant)[frame];
    const u = unit(1.3);
    const w = (img.width / UP) * u, h = (img.height / UP) * u;
    const feetY = toY(axis + (axis - fy) * SKY_REFLECT);
    const bands = 14, bh = h / bands, sh = img.height / bands;
    ctx.save();
    waterPath();
    ctx.clip();
    // Mirrored about the waterline: hangs below its feet, and a loop turns the other way.
    ctx.translate(toX(fx), feetY + h / 2);
    ctx.rotate(-rot);
    for (let i = 0; i < bands; i++) {
      const shift = Math.sin(clock * 2.2 + i * 0.7 + fx * 0.05) * u * 0.35;
      ctx.save();
      ctx.globalAlpha = 0.34 * (1 - i / bands) + 0.04;
      ctx.translate(shift, -h / 2 + bh * i + bh / 2);
      ctx.scale(f.dir, -1);
      ctx.drawImage(img, 0, img.height - sh * (i + 1), img.width, sh, -w / 2, -bh / 2, w, bh + 1);
      ctx.restore();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const order = [...pigs].sort((a, b) => groundPos(a)[1] - groundPos(b)[1]); // far (higher) first
    const poses = new Map<Pig, Pose>();
    for (const p of order) poses.set(p, pose(p));

    for (const p of order) drawReflection(p, poses.get(p)!);
    for (const f of flyers) drawFlyerReflection(f);

    for (const p of order) {
      const S = landSprites(p.zone.haze ?? 0.1);
      const ps = poses.get(p)!;
      const u = unit(p.zone.scale);
      const [gx, gy] = groundPos(p);
      const x = toX(gx), y = toY(gy);
      const lift = ps.lift * u;
      shadow(x, y, u, lift > 2 * u ? 0.7 : 1);
      blit(S[ps.img], x, y - lift, u, p.facing, { squash: ps.squash });
      const w = (SPRITE_W * u) / dpr, h = (SPRITE_H * u) / dpr, pad = 7;
      p.box = [x / dpr - w / 2 - pad, (y - lift) / dpr - h - pad, x / dpr + w / 2 + pad, (y - lift) / dpr + pad];
    }

    for (const f of flyers) {
      const S = flyerSprites(f.variant);
      const u = unit(1.3);
      const { fx, fy, rot, frame } = flyerPose(f);
      f.px = fx; f.py = fy;
      const x = toX(fx), y = toY(fy);
      blit(S[frame], x, y, u, f.dir, { rot });
      const w = (SPRITE_W * u) / dpr, h = (SPRITE_H * u) / dpr, pad = 10;
      f.box = [x / dpr - w / 2 - pad, y / dpr - h - pad, x / dpr + w / 2 + pad, y / dpr + pad];
    }

    const G = landSprites(0);
    for (const q of particles) {
      const k = q.age / q.life;
      const alpha = k < 0.15 ? k / 0.15 : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      if (q.kind === "trail") {
        // twinkle in quickly, shrink and fade soon after
        const a = k < 0.1 ? k / 0.1 : Math.max(0, 1 - (k - 0.1) / 0.9);
        blit(trailSprite(q.color!), toX(q.x), toY(q.y), unit(q.scale) * (1 - 0.55 * k), 1, { alpha: a * 0.95 });
        continue;
      }
      const grow = q.kind === "z" ? 0.6 + 0.6 * k : 1;
      blit(G[q.kind], toX(q.x), toY(q.y), unit(q.scale) * 0.9 * grow, 1, { alpha });
    }

    if (opts.debug) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ff00aa";
      for (const z of zones) {
        ctx.beginPath(); ctx.moveTo(toX(z.from[0]), toY(z.from[1])); ctx.lineTo(toX(z.to[0]), toY(z.to[1])); ctx.stroke();
        for (const e of [z.from, z.to]) blit(landSprites(0).stand, toX(e[0]), toY(e[1]), unit(z.scale), 1, { alpha: 0.55 });
      }
      if (water) {
        ctx.strokeStyle = "#00e0ff"; waterPath(); ctx.stroke();
        ctx.strokeStyle = "#ffe600"; ctx.beginPath();
        water.axis.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
        ctx.stroke();
      }
    }
  }

  /* ---------------- input ---------------- */
  const inBox = (b: Pig["box"], x: number, y: number) => !!b && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];

  function onPointerDown(e: PointerEvent) {
    const target = e.target as Element | null;
    if (target?.closest?.(INTERACTIVE)) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) return;

    let hit = false;
    for (const f of flyers) {
      if (inBox(f.box, x, y) && f.loopT < 0) {
        f.loopT = 0; f.loopX = 0;
        emit("heart", f.x, f.y0 - 24, 1.3);
        opts.onPigletClick?.("flying", false);
        hit = true; break;
      }
    }
    if (!hit) {
      const nearestFirst = [...pigs].sort((a, b) => groundPos(b)[1] - groundPos(a)[1]);
      for (const p of nearestFirst) {
        if (inBox(p.box, x, y)) {
          const wasAsleep = react(p);
          opts.onPigletClick?.("ground", wasAsleep);
          hit = true; break;
        }
      }
    }
    if (hit) {
      clicks++; sinceEgg++;
      const now = performance.now();
      if (eggN > 0 && sinceEgg >= eggN && flyers.length === 0 && now - lastEgg >= eggCooldownMs) {
        sinceEgg = 0; lastEgg = now;
        spawnFlyer(); opts.onEasterEgg?.(clicks);
      }
      if (!running) frame(performance.now());
    }
  }

  /* ---------------- loop ---------------- */
  let raf = 0, last = 0, running = false, onScreen = true;
  function frame(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    clock += dt;
    update(dt);
    draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || document.hidden || !onScreen) return;
    running = true; last = 0; raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const ro = new ResizeObserver(() => { measure(); if (!running) draw(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) start(); else stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pointerdown", onPointerDown, { passive: true });

  measure();
  start();

  return {
    summonFlyer: (variant: FlyerVariant = "normal") => spawnFlyer(variant),
    hitBoxes: () => [...pigs, ...flyers].map((p) => p.box).filter((b): b is [number, number, number, number] => !!b),
    destroy() {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onPointerDown);
    },
  };
}
