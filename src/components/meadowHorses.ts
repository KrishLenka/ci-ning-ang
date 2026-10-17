/**
 * Meadow Horses — now and then a horse gallops down to the lake from behind the
 * trees on either side of the hero video, has a drink, and gallops back up.
 *
 * - Two routes (left and right of the pond), at most one horse on each.
 * - A horse starts hidden behind a tree's canopy and fades in as it comes out
 *   from behind it (the canopy shape masks it, so it never seems to appear
 *   from inside the tree). It leaves the same way.
 * - At the shore it drinks, sometimes lingering before or after (random lengths).
 * - Random coats: chestnut quarter horse, bay thoroughbred, black, palomino,
 *   dapple grey, buckskin, paint, blanket and leopard appaloosa, each with
 *   random face markings and socks.
 * - Horses near the shore show a soft, rippling reflection in the lake.
 * - Purely decorative (no clicks). Skipped entirely with reduced motion.
 *
 * Sprites are drawn from a little skeleton (body, neck, head, two-joint legs,
 * mane and tail) onto a pixel grid, in the same chunky style as the piglets.
 * Coordinates are in the video's own pixels (1924 x 1076) and mapped with the
 * same math as `object-fit: cover`. No dependencies.
 */

import { DEFAULT_WATER, type WaterConfig } from "./meadowPiglets";

export type Vec = [number, number];

export interface HorseRoute {
  /** Feet positions from the hidden start (behind a tree) down the hill to the drinking spot. */
  path: Vec[];
  /** Shapes in front of the start, e.g. the tree canopy. The horse is hidden inside them. */
  cover: Vec[][];
  /** Video px per sprite px at the start and at the drinking spot (farther = smaller). */
  scale: [number, number];
}

export interface MeadowHorsesOptions {
  canvas: HTMLCanvasElement;
  videoSize?: { width: number; height: number };
  /** Must match the video's CSS object-position (default centered). */
  objectPosition?: { x: number; y: number };
  routes?: HorseRoute[];
  /** Lake reflections; pass false to turn them off (default: the piglets' lake). */
  water?: WaterConfig | false;
  /** Seconds before the first horse, [min, max] (default [4, 10]). The other side follows later. */
  firstAfter?: [number, number];
  /** Seconds after a horse has left before the next one on that side, [min, max] (default [20, 30]). */
  every?: [number, number];
  /** Draw the routes and cover shapes. */
  debug?: boolean;
}

export interface MeadowHorses {
  /** Send a horse down a route now (if that side is free). */
  sendNow(route?: number): void;
  destroy(): void;
}

/* ----------------------------------------------------------------------- */
/* Defaults tuned to the cherry-blossom meadow video (1924 x 1076)          */
/* ----------------------------------------------------------------------- */

export const DEFAULT_ROUTES: HorseRoute[] = [
  {
    // Left: out from under the smaller cherry tree, down the sunlit slope to the left shore.
    path: [[350, 482], [404, 500], [455, 535], [490, 570], [512, 592]],
    cover: [[
      [262, 400], [412, 400], [414, 440], [410, 470], [400, 485], [386, 494], [362, 499],
      [336, 498], [324, 506], [300, 506], [298, 489], [274, 479], [260, 460],
    ]],
    scale: [1.3, 1.55],
  },
  {
    // Right: out from under the big tree's drooping lower branches, down to the right shore.
    path: [[1668, 500], [1640, 528], [1605, 558], [1575, 583], [1555, 597]],
    cover: [[
      [1590, 440], [1740, 430], [1738, 470], [1726, 486], [1708, 494], [1690, 500], [1672, 506],
      [1655, 512], [1640, 516], [1620, 516], [1600, 512], [1588, 498], [1585, 470],
    ]],
    scale: [1.35, 1.6],
  },
];

/* ----------------------------------------------------------------------- */
/* Coats                                                                    */
/* ----------------------------------------------------------------------- */

type Pattern = "pinto" | "blanket" | "leopard" | "dapple";

export interface HorseCoat {
  name: string;
  /** base, highlight, shade, outline */
  B: string; L: string; S: string; O: string;
  /** mane/tail and its darker strands */
  M: string; M2: string;
  /** lower legs ("points"); defaults to the body colours */
  P?: string; Pd?: string;
  /** hooves, muzzle */
  H: string; N: string;
  /** spots / dapples */
  D?: string;
  pattern?: Pattern;
}

const WHITE = "#f4efe7", WHITE_SHADE = "#d8d1c6";

export const HORSE_COATS: HorseCoat[] = [
  { name: "Quarter Horse (chestnut)", B: "#b5622e", L: "#cf7e46", S: "#8c461f", O: "#3a1b0c", M: "#7a3514", M2: "#5e260c", H: "#3b2a20", N: "#7a4127" },
  { name: "Thoroughbred (bay)", B: "#8a4a27", L: "#a6613a", S: "#68341a", O: "#22120a", M: "#1d1512", M2: "#100b09", P: "#1f1714", Pd: "#140e0c", H: "#2a201b", N: "#3a2418" },
  { name: "Friesian (black)", B: "#2e2629", L: "#4a3f44", S: "#1d181a", O: "#0b0809", M: "#151012", M2: "#0a0708", H: "#1a1416", N: "#3d3236" },
  { name: "Palomino", B: "#dcae58", L: "#efca7c", S: "#b5883a", O: "#5a3b14", M: "#f8eed6", M2: "#e3d3ae", H: "#5a4632", N: "#9a7444" },
  { name: "Dapple grey", B: "#bdb9b5", L: "#dedbd7", S: "#96918d", O: "#3e3a38", M: "#d9d6d2", M2: "#a8a39f", P: "#85807c", Pd: "#6c6764", H: "#3d3836", N: "#6f6a67", D: "#d6d3cf", pattern: "dapple" },
  { name: "Buckskin", B: "#d2a867", L: "#e5c185", S: "#ab8244", O: "#3a2713", M: "#1d1613", M2: "#0f0b09", P: "#231a16", Pd: "#150f0d", H: "#2a201b", N: "#5c4430" },
  { name: "Paint", B: "#a85a2c", L: "#c3753f", S: "#82431f", O: "#33180a", M: "#6e3214", M2: "#4f220b", H: "#3b2a20", N: "#6d3a22", pattern: "pinto" },
  { name: "Appaloosa (blanket)", B: "#6e4a33", L: "#8a6249", S: "#523525", O: "#25160d", M: "#2b201a", M2: "#18110d", P: "#3a2a20", Pd: "#271b14", H: "#3a2d25", N: "#4c3427", D: "#4a3122", pattern: "blanket" },
  { name: "Appaloosa (leopard)", B: "#ece6dc", L: "#faf6f0", S: "#cbc2b5", O: "#3d3228", M: "#8c7c6c", M2: "#6a5c4f", H: "#4a3d33", N: "#8a7d72", D: "#4b3426", pattern: "leopard" },
];

/* ----------------------------------------------------------------------- */
/* Skeleton and poses (sprite px, facing right, hooves rest on y = FOOT_Y)  */
/* ----------------------------------------------------------------------- */

const GW = 50, GH = 38, UP = 4;
const OFF = 2; // left margin so a streaming tail isn't clipped
const ANCHOR_X = 24 + OFF, FOOT_Y = 36;

type Leg = [number, number]; // [upper, lower] angle in degrees from straight down; + swings forward
type HeadPose = "up" | "run" | "mid" | "down";
type TailPose = "hang" | "swish" | "stream";
interface Pose {
  lift: number; head: HeadPose; tail: TailPose;
  fn: Leg; ff: Leg; hn: Leg; hf: Leg; // front near/far, hind near/far
  sip?: number;
}

const HEADS: Record<HeadPose, { neck: [Vec, number, Vec, number]; head: [Vec, number, Vec, number] }> = {
  up:   { neck: [[33, 18], 3.8, [38.2, 10], 2.5], head: [[38.6, 9], 2.6, [43.6, 13.6], 1.7] },
  run:  { neck: [[33, 18], 3.8, [39.2, 11.5], 2.5], head: [[39.8, 10.6], 2.6, [44.8, 14.6], 1.7] },
  mid:  { neck: [[33, 18.5], 3.8, [39.5, 17.5], 2.5], head: [[40, 17], 2.5, [43.5, 22.5], 1.7] },
  down: { neck: [[33, 19], 3.8, [39, 26], 2.5], head: [[39.4, 26.5], 2.5, [41.4, 33.6], 1.7] },
};

const STAND: Omit<Pose, "tail" | "head"> = { lift: 0, fn: [2, 0], ff: [-6, 2], hn: [-12, 7], hf: [-3, 4] };
const DRINK_LEGS: Omit<Pose, "tail" | "head"> = { lift: 0, fn: [12, 0], ff: [-4, 2], hn: [-12, 7], hf: [-3, 4] };

const POSES: Record<string, Pose> = {
  // Four-beat gallop: reach, land, push off, gathered in the air.
  g0: { lift: 0, head: "run", tail: "stream", fn: [45, 72], ff: [30, 42], hn: [16, 0], hf: [6, -6] },
  g1: { lift: 0, head: "run", tail: "stream", fn: [22, 6], ff: [36, 26], hn: [-16, -6], hf: [0, 0] },
  g2: { lift: 0.5, head: "run", tail: "stream", fn: [-6, 0], ff: [10, 0], hn: [-36, -58], hf: [-26, -38] },
  g3: { lift: 1.5, head: "run", tail: "stream", fn: [-24, -72], ff: [-14, -62], hn: [26, -36], hf: [36, -16] },
  standA: { ...STAND, head: "up", tail: "hang" },
  standB: { ...STAND, head: "up", tail: "swish" },
  mid: { ...DRINK_LEGS, head: "mid", tail: "hang" },
  drinkA: { ...DRINK_LEGS, head: "down", tail: "hang" },
  drinkB: { ...DRINK_LEGS, head: "down", tail: "swish", sip: 0.6 },
};
const GALLOP = ["g0", "g1", "g2", "g3"];

/* ----------------------------------------------------------------------- */
/* Pixel rasteriser                                                         */
/* ----------------------------------------------------------------------- */

// Parts, in drawing order (later ones cover earlier ones).
const enum Part { None, FarLeg, Tail, Body, Neck, Head, Mane, Leg, Ear }

interface Cell { part: Part; lower?: boolean; hoof?: boolean }
interface Raster {
  cells: Cell[];
  /** Head axis (poll to muzzle) and its "up" direction, for the eye, nostril and face markings. */
  headA: Vec; headB: Vec; hup: Vec;
  feet: Record<"fn" | "ff" | "hn" | "hf", Vec>;
}

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Per-horse extras: face marking, socks and pattern spots (stable across frames). */
interface Markings {
  face: "none" | "star" | "blaze" | "snip";
  socks: [number, number, number, number]; // fn, ff, hn, hf: px of white above the hoof
  blobs: Array<[number, number, number]>; // pattern circles (x, y, r) in body space
}

function makeMarkings(coat: HorseCoat, seed: number): Markings {
  const r = mulberry(seed);
  const faces: Markings["face"][] = ["none", "none", "star", "blaze", "snip", "blaze"];
  const sock = () => (r() < 0.3 ? 1.5 + r() * 3 : 0);
  const blobs: Markings["blobs"] = [];
  if (coat.pattern === "pinto") {
    const n = 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) blobs.push([10 + r() * 26, 14 + r() * 11, 1.8 + r() * 2.4]);
    blobs.push([34 + r() * 3, 13 + r() * 4, 1.8 + r() * 1.5]); // a patch on the neck
  } else if (coat.pattern === "blanket" || coat.pattern === "leopard") {
    const n = coat.pattern === "leopard" ? 26 : 12;
    for (let i = 0; i < n; i++) {
      const x = coat.pattern === "leopard" ? 9 + r() * 32 : 9 + r() * 13;
      blobs.push([x, 13 + r() * 13, 0.55 + r() * 0.5]);
    }
  } else if (coat.pattern === "dapple") {
    for (let x = 10; x < 36; x += 3.4) for (let y = 15; y < 25; y += 3.2) blobs.push([x + r() * 1.6, y + r() * 1.4, 0.9 + r() * 0.4]);
  }
  return {
    face: faces[Math.floor(r() * faces.length)],
    socks: coat.pattern === "leopard" ? [0, 0, 0, 0] : [sock(), sock(), sock(), sock()],
    blobs,
  };
}

const deg = (a: number) => (a * Math.PI) / 180;

function rasterise(pose: Pose): Raster {
  const cells: Cell[] = Array.from({ length: GW * GH }, () => ({ part: Part.None }));
  const lift = pose.lift;
  const put = (x: number, y: number, c: Cell) => {
    if (x < 0 || y < 0 || x >= GW || y >= GH) return;
    cells[y * GW + x] = c;
  };
  const each = (x0: number, y0: number, x1: number, y1: number, test: (px: number, py: number) => Cell | null) => {
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0 + OFF)); x <= Math.min(GW - 1, Math.ceil(x1 + OFF)); x++) {
        const c = test(x + 0.5 - OFF, y + 0.5);
        if (c) put(x, y, c);
      }
    }
  };
  const ellipse = (cx: number, cy: number, rx: number, ry: number, part: Part) =>
    each(cx - rx, cy - ry, cx + rx, cy + ry, (px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1 ? { part } : null);
  /** Tapered capsule from a (radius ra) to b (radius rb). `meta(t)` can tag cells along it. */
  const capsule = (a: Vec, ra: number, b: Vec, rb: number, part: Part, meta?: (t: number) => Partial<Cell>) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy || 1;
    const R = Math.max(ra, rb);
    each(Math.min(a[0], b[0]) - R, Math.min(a[1], b[1]) - R, Math.max(a[0], b[0]) + R, Math.max(a[1], b[1]) + R, (px, py) => {
      const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / len2));
      const qx = a[0] + dx * t, qy = a[1] + dy * t, r = ra + (rb - ra) * t;
      return (px - qx) ** 2 + (py - qy) ** 2 <= r * r ? { part, ...meta?.(t) } : null;
    });
  };
  const leg = (joint: Vec, [ua, la]: Leg, upper: [number, number], part: Part, hind: boolean) => {
    const UL = hind ? 5.6 : 5.4, LL = 6.6;
    const knee: Vec = [joint[0] + Math.sin(deg(ua)) * UL, joint[1] + Math.cos(deg(ua)) * UL];
    const foot: Vec = [knee[0] + Math.sin(deg(la)) * LL, knee[1] + Math.cos(deg(la)) * LL];
    capsule(joint, upper[0], knee, upper[1], part);
    capsule(knee, 0.95, foot, 0.9, part, (t) => ({ lower: true, hoof: t > 1 - 1.3 / LL }));
    return foot;
  };
  const shift = (p: Vec): Vec => [p[0], p[1] - lift];

  // Far legs first (drawn darker), then tail, body, neck, head, mane, near legs, ears.
  const legs = {
    ff: leg(shift([30.5, 24.5]), pose.ff, [1.6, 1.2], Part.FarLeg, false),
    hf: leg(shift([16.5, 23.5]), pose.hf, [2.2, 1.3], Part.FarLeg, true),
  };

  const tailPts: Vec[] =
    pose.tail === "stream" ? [[9.6, 16], [6, 16.8], [3, 18.6], [1, 21.4]]
    : pose.tail === "swish" ? [[9.6, 16], [7.2, 20], [5.8, 25], [5.4, 29]]
    : [[9.6, 16], [7.6, 20], [7, 25], [7.4, 29.2]];
  for (let i = 0; i < tailPts.length - 1; i++) {
    const r0 = 1.7 - i * 0.22, r1 = 1.7 - (i + 1) * 0.22;
    capsule(shift(tailPts[i]), r0, shift(tailPts[i + 1]), r1, Part.Tail);
  }

  ellipse(15, 20 - lift, 6, 5.8, Part.Body);      // hindquarters
  ellipse(24, 21 - lift, 10.5, 5.2, Part.Body);   // barrel
  ellipse(31.5, 21 - lift, 5, 5.6, Part.Body);    // chest and shoulder

  const H = HEADS[pose.head];
  const sip = pose.sip ?? 0;
  const neckEnd = shift([H.neck[2][0], H.neck[2][1] + sip]);
  capsule(shift(H.neck[0]), H.neck[1], neckEnd, H.neck[3], Part.Neck);
  const headA = shift([H.head[0][0], H.head[0][1] + sip]), headB = shift([H.head[2][0], H.head[2][1] + sip]);
  capsule(headA, H.head[1], headB, H.head[3], Part.Head);

  // Mane along the top of the neck, plus a forelock.
  const nx = neckEnd[0] - (33), ny = neckEnd[1] - (18 - lift);
  const nl = Math.hypot(nx, ny) || 1;
  const up: Vec = [ny / nl, -nx / nl]; // perpendicular, toward the top of the neck
  const maneA: Vec = [33 + up[0] * 3.2 - 1.2, 18 - lift + up[1] * 3.2];
  const maneB: Vec = [neckEnd[0] + up[0] * 2.1, neckEnd[1] + up[1] * 2.1];
  capsule(maneA, 1.3, maneB, 1.1, Part.Mane);
  capsule([headA[0] + up[0] * 1.6 + 0.6, headA[1] + up[1] * 1.6], 0.9, [headA[0] + up[0] * 0.8 + 1.2, headA[1] + up[1] * 0.8 + 0.6], 0.6, Part.Mane);

  const near = {
    fn: leg(shift([32, 25]), pose.fn, [1.7, 1.3], Part.Leg, false),
    hn: leg(shift([14.6, 23]), pose.hn, [2.5, 1.4], Part.Leg, true),
  };

  // Ears at the poll, pointing away from the muzzle.
  const hx = headB[0] - headA[0], hy = headB[1] - headA[1], hl = Math.hypot(hx, hy) || 1;
  const back: Vec = [-hx / hl, -hy / hl], hup: Vec = [hy / hl, -hx / hl];
  const earBase: Vec = [headA[0] + hup[0] * 1.6, headA[1] + hup[1] * 1.6];
  const earTip: Vec = [earBase[0] + hup[0] * 2.4 + back[0] * 0.6, earBase[1] + hup[1] * 2.4 + back[1] * 0.6];
  capsule(earBase, 0.85, earTip, 0.5, Part.Ear);
  capsule([earBase[0] + back[0] * 1.2, earBase[1] + back[1] * 1.2], 0.8, [earTip[0] + back[0] * 1.2, earTip[1] + back[1] * 1.2], 0.45, Part.Ear);

  // Hand back grid coordinates (skeleton + left margin).
  const g = (p: Vec): Vec => [p[0] + OFF, p[1]];
  const f = { ...legs, ...near };
  return { cells, headA: g(headA), headB: g(headB), hup, feet: { fn: g(f.fn), ff: g(f.ff), hn: g(f.hn), hf: g(f.hf) } };
}

type Sprite = HTMLCanvasElement;

function bakeFrame(pose: Pose, coat: HorseCoat, mk: Markings): Sprite {
  const { cells, headA, headB, hup, feet } = rasterise(pose);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= GW || y >= GH ? undefined : cells[y * GW + x]);
  const filled = (x: number, y: number) => (at(x, y)?.part ?? Part.None) !== Part.None;
  const colors: (string | null)[] = new Array(GW * GH).fill(null);
  const lift = pose.lift;
  const inBlob = (x: number, y: number) => mk.blobs.some(([bx, by, r]) => (x - bx) ** 2 + (y - by) ** 2 <= r * r);

  // Socks: which leg a lower-leg cell belongs to (nearest foot).
  const legKeys = ["fn", "ff", "hn", "hf"] as const;
  const sockOf = (x: number, y: number) => {
    let best = 0, bd = Infinity;
    legKeys.forEach((k, i) => {
      const f = feet[k], d = (x - f[0]) ** 2 + (y - f[1]) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    const f = feet[legKeys[best]];
    return Math.hypot(x - f[0], y - f[1]) <= mk.socks[best] + 1.3;
  };

  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const c = cells[y * GW + x];
      const px = x + 0.5, py = y + 0.5;
      let col: string | null = null;
      switch (c.part) {
        case Part.None:
          break;
        case Part.Tail:
        case Part.Mane:
          col = (x + y * 2) % 5 === 0 ? coat.M2 : coat.M;
          break;
        case Part.Ear:
          col = coat.pattern === "leopard" ? coat.S : coat.B;
          break;
        case Part.FarLeg:
          col = c.hoof ? coat.H : c.lower ? (sockOf(px, py) ? WHITE_SHADE : coat.Pd ?? coat.S) : coat.S;
          break;
        case Part.Leg:
          col = c.hoof ? coat.H : c.lower ? (sockOf(px, py) ? WHITE : coat.P ?? coat.B) : coat.B;
          break;
        default: {
          // Body, neck, head: rim light on top, shade underneath.
          const aboveEmpty = !filled(x, y - 1) || at(x, y - 1)?.part === Part.Mane;
          const belowEmpty = !filled(x, y + 1);
          let tone: "B" | "L" | "S" = "B";
          if (aboveEmpty) tone = "L";
          else if (c.part === Part.Body && py - (21 - lift) > 2.6) tone = "S";
          else if (c.part !== Part.Body && belowEmpty) tone = "S";
          col = coat[tone];
          // Coat patterns live in body space, so they stay put while the legs move.
          const bx = px - OFF, by = py + lift;
          if (coat.pattern === "pinto" && c.part !== Part.Head && inBlob(bx, by)) col = tone === "S" ? WHITE_SHADE : WHITE;
          if (coat.pattern === "blanket" && c.part === Part.Body) {
            const wob = Math.sin(bx * 1.7) * 0.8;
            if (bx < 22 + wob && by < 22.5 + Math.sin(bx) * 0.7) col = inBlob(bx, by) ? coat.D! : tone === "S" ? WHITE_SHADE : WHITE;
          }
          if (coat.pattern === "leopard" && inBlob(bx, by)) col = coat.D!;
          if (coat.pattern === "dapple" && c.part === Part.Body && tone !== "L" && inBlob(bx, by)) col = coat.D!;
        }
      }
      colors[y * GW + x] = col;
    }
  }

  // Face: eye, nostril and white markings along the front of the face.
  const along = (t: number, off: number): [number, number] => [
    Math.floor(headA[0] + (headB[0] - headA[0]) * t + hup[0] * off),
    Math.floor(headA[1] + (headB[1] - headA[1]) * t + hup[1] * off),
  ];
  const paint = (p: [number, number], col: string) => {
    const [x, y] = p;
    if (x >= 0 && y >= 0 && x < GW && y < GH && cells[y * GW + x].part === Part.Head) colors[y * GW + x] = col;
  };
  if (mk.face === "star") paint(along(0.22, 1.2), WHITE);
  if (mk.face === "blaze") for (let t = 0.2; t <= 0.98; t += 0.08) paint(along(t, 1.3), WHITE);
  if (mk.face === "snip") { paint(along(0.86, 1.0), WHITE); paint(along(0.94, 0.8), WHITE); }
  for (let t = 0.82; t <= 1.0; t += 0.06) paint(along(t, -0.4), coat.N);
  paint(along(0.97, 0.2), coat.N);
  paint(along(0.3, 0.3), "#140c09"); // eye

  // Outline: empty cells touching the horse.
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      if (filled(x, y)) continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) colors[y * GW + x] = coat.O;
    }
  }

  const cv = document.createElement("canvas");
  cv.width = GW * UP; cv.height = GH * UP;
  const g = cv.getContext("2d")!;
  for (let i = 0; i < colors.length; i++) {
    const col = colors[i];
    if (!col) continue;
    g.fillStyle = col;
    g.fillRect((i % GW) * UP, Math.floor(i / GW) * UP, UP, UP);
  }
  return cv;
}

/** Every frame for one horse. Exported for previews. */
export function bakeHorse(coat: HorseCoat, seed = 1): Record<string, Sprite> {
  const mk = makeMarkings(coat, seed);
  return Object.fromEntries(Object.entries(POSES).map(([k, p]) => [k, bakeFrame(p, coat, mk)]));
}

/* ----------------------------------------------------------------------- */
/* Engine                                                                   */
/* ----------------------------------------------------------------------- */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const SPEED = 112;        // video px/s at full gallop
const STRIDE = 44;        // video px per gallop cycle at scale 1
const FADE_DIST = 46;     // video px over which a horse fades in/out at the tree
const REFLECT_FADE = [26, 58]; // gap above the waterline where the reflection fades out

type Step =
  | { kind: "run"; dir: 1 | -1 }
  | { kind: "stand"; dur: number }
  | { kind: "drink"; dur: number }
  | { kind: "turn" };

interface Horse {
  route: number; sprites: Record<string, Sprite>; coat: number;
  steps: Step[]; t: number; d: number; stride: number; facing: 1 | -1; frame: string;
}

/** A route's path, smoothed (Catmull-Rom) and measured. */
interface Track { pts: Vec[]; cum: number[]; len: number }
function makeTrack(path: Vec[]): Track {
  const pts: Vec[] = [];
  const P = (i: number) => path[Math.max(0, Math.min(path.length - 1, i))];
  for (let i = 0; i < path.length - 1; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let s = 0; s < 12; s++) {
      const t = s / 12, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  pts.push(path[path.length - 1]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}
function trackAt(tr: Track, d: number): { p: Vec; dir: Vec } {
  d = Math.max(0, Math.min(tr.len, d));
  let i = 1;
  while (i < tr.cum.length - 1 && tr.cum[i] < d) i++;
  const a = tr.pts[i - 1], b = tr.pts[i];
  const seg = tr.cum[i] - tr.cum[i - 1] || 1, k = (d - tr.cum[i - 1]) / seg;
  return { p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], dir: [(b[0] - a[0]) / seg, (b[1] - a[1]) / seg] };
}

function lerpAxis(axis: Vec[], x: number) {
  if (x <= axis[0][0]) return axis[0][1];
  for (let i = 1; i < axis.length; i++) {
    if (x <= axis[i][0]) {
      const [x0, y0] = axis[i - 1], [x1, y1] = axis[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return axis[axis.length - 1][1];
}

export function createMeadowHorses(opts: MeadowHorsesOptions): MeadowHorses {
  const canvas = opts.canvas;
  const ctx = canvas.getContext("2d")!;
  const VW = opts.videoSize?.width ?? 1924, VH = opts.videoSize?.height ?? 1076;
  const pos = opts.objectPosition ?? { x: 0.5, y: 0.5 };
  const routes = opts.routes ?? DEFAULT_ROUTES;
  const water = opts.water === false ? null : opts.water ?? DEFAULT_WATER;
  const every = opts.every ?? [20, 30];
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const tracks = routes.map((r) => makeTrack(r.path));

  let dpr = 1, cssW = 0, cssH = 0, cs = 1, ox = 0, oy = 0;
  function measure() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cssW = r.width; cssH = r.height;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    cs = Math.max(cssW / VW, cssH / VH);
    ox = (cssW - VW * cs) * pos.x; oy = (cssH - VH * cs) * pos.y;
  }
  const toX = (v: number) => (ox + v * cs) * dpr;
  const toY = (v: number) => (oy + v * cs) * dpr;

  const horses: (Horse | null)[] = routes.map(() => null);
  const lastCoat: number[] = routes.map(() => -1);
  // The first horse comes quickly; the other side's first one a little later.
  const first = rand(...(opts.firstAfter ?? [4, 10]));
  const firstSide = Math.floor(Math.random() * routes.length);
  const next: number[] = routes.map((_, i) => (i === firstSide ? first : first + rand(8, 18)));

  function onScreen(route: number) {
    const end = routes[route].path[routes[route].path.length - 1][0];
    const v0 = -ox / cs, v1 = (cssW - ox) / cs;
    return end > v0 + 30 && end < v1 - 30;
  }

  function spawn(route: number) {
    const taken = new Set([lastCoat[route], ...horses.filter(Boolean).map((h) => h!.coat)]);
    const choices = HORSE_COATS.map((_, i) => i).filter((i) => !taken.has(i));
    const coat = choices[Math.floor(Math.random() * choices.length)];
    lastCoat[route] = coat;
    const settle: Step = { kind: "stand", dur: rand(0.5, 1.1) };
    const linger = (): Step => ({ kind: "stand", dur: rand(3, 10) });
    const drink: Step = { kind: "drink", dur: rand(3, 6.5) };
    const r = Math.random();
    const middle: Step[] = r < 0.34 ? [settle, drink] : r < 0.67 ? [linger(), drink] : [settle, drink, linger()];
    horses[route] = {
      route, coat, sprites: bakeHorse(HORSE_COATS[coat], Math.floor(Math.random() * 1e9)),
      steps: [{ kind: "run", dir: 1 }, ...middle, { kind: "stand", dur: 0.4 }, { kind: "turn" }, { kind: "stand", dur: 0.3 }, { kind: "run", dir: -1 }],
      t: 0, d: 0, stride: 0, facing: 1, frame: "g0",
    };
  }

  function update(dt: number) {
    for (let i = 0; i < routes.length; i++) {
      const h = horses[i];
      if (!h) {
        if (reduced) continue;
        next[i] -= dt;
        if (next[i] <= 0) {
          if (onScreen(i)) spawn(i);
          else next[i] = rand(every[0], every[1]);
        }
        continue;
      }
      const tr = tracks[i];
      const step = h.steps[0];
      h.t += dt;
      if (step.kind === "run") {
        // Ease in from the tree, ease out at the shore (and the reverse on the way back).
        const done = step.dir === 1 ? h.d : tr.len - h.d;
        const left = tr.len - done;
        const v = SPEED * Math.max(0.14, Math.min(1, (done + 10) / 34, (left + 3) / 48));
        const move = Math.min(left, v * dt);
        h.d += move * step.dir;
        const { dir } = trackAt(tr, h.d);
        h.facing = (dir[0] * step.dir >= 0 ? 1 : -1);
        h.stride += move / (STRIDE * scaleAt(i, h.d));
        h.frame = v < SPEED * 0.2 ? "standA" : GALLOP[Math.floor(h.stride * 4) % 4];
        if (left - move <= 0.01) {
          h.steps.shift(); h.t = 0;
          if (step.dir === -1) { horses[i] = null; next[i] = rand(every[0], every[1]); }
          else h.frame = "standA";
        }
      } else if (step.kind === "stand") {
        h.frame = Math.floor(h.t / 1.6) % 3 === 2 ? "standB" : "standA"; // tail swish now and then
        if (h.t >= step.dur) { h.steps.shift(); h.t = 0; }
      } else if (step.kind === "drink") {
        const LOWER = 0.45;
        if (h.t < LOWER || h.t > step.dur - LOWER) h.frame = "mid";
        else h.frame = Math.floor((h.t - LOWER) / 0.55) % 3 === 1 ? "drinkB" : "drinkA";
        if (h.t >= step.dur) { h.steps.shift(); h.t = 0; }
      } else {
        h.facing = (h.facing * -1) as 1 | -1;
        h.frame = "standA";
        h.steps.shift(); h.t = 0;
      }
    }
  }

  const scaleAt = (i: number, d: number) => {
    const [s0, s1] = routes[i].scale;
    return s0 + (s1 - s0) * clamp01(d / tracks[i].len);
  };
  /** Fade near the tree end of the route (in on the way down, out on the way back). */
  const alphaAt = (d: number) => clamp01((d - 4) / FADE_DIST);

  function blit(img: Sprite, x: number, y: number, u: number, facing: number, rot = 0, flipY = false) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(facing, flipY ? -1 : 1);
    ctx.drawImage(img, -ANCHOR_X * u, -FOOT_Y * u, GW * u, GH * u);
    ctx.restore();
  }

  function tiltAt(h: Horse) {
    if (h.steps[0]?.kind !== "run") return 0;
    const { dir } = trackAt(tracks[h.route], h.d);
    const slope = Math.atan2(dir[1] * (h.steps[0].dir), Math.abs(dir[0]) + 1e-3);
    return Math.max(-0.16, Math.min(0.16, slope * 0.35)) * h.facing;
  }

  function waterPath() {
    if (!water) return;
    ctx.beginPath();
    water.polygon.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
    ctx.closePath();
  }

  let clock = 0;
  function drawReflection(h: Horse) {
    if (!water) return;
    const { p: [gx, gy] } = trackAt(tracks[h.route], h.d);
    const axis = lerpAxis(water.axis, gx);
    const gap = axis - gy;
    if (gap < -2 || gap >= REFLECT_FADE[1]) return;
    const reach = gap <= REFLECT_FADE[0] ? 1 : 1 - (gap - REFLECT_FADE[0]) / (REFLECT_FADE[1] - REFLECT_FADE[0]);
    const img = h.sprites[h.frame];
    const u = scaleAt(h.route, h.d) * cs * dpr;
    const w = GW * u, hh = GH * u;
    const x = toX(gx), yMirror = toY(axis + gap);
    const bands = 16;
    ctx.save();
    waterPath();
    ctx.clip();
    for (let i = 0; i < bands; i++) {
      const sh = img.height / bands;
      const shift = Math.sin(clock * 2.2 + i * 0.7 + gx * 0.05) * u * 0.35;
      ctx.save();
      ctx.globalAlpha = ((0.4 * (1 - i / bands) + 0.05) * reach) * alphaAt(h.d);
      ctx.translate(x + shift, yMirror + (hh / bands) * i + hh / bands / 2);
      ctx.scale(h.facing, -1);
      // Bands counted up from the hooves (rows above FOOT_Y are blank margin).
      const srcY = (FOOT_Y * UP) - sh * (i + 1);
      if (srcY + sh > 0) ctx.drawImage(img, 0, srcY, img.width, sh, -ANCHOR_X * u, -hh / bands / 2, w, hh / bands + 1);
      ctx.restore();
    }
    ctx.restore();
  }

  function coverClip(route: number) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    for (const poly of routes[route].cover) {
      poly.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
      ctx.closePath();
    }
    ctx.clip("evenodd");
  }

  function drawHorse(h: Horse) {
    const { p: [gx, gy] } = trackAt(tracks[h.route], h.d);
    const s = scaleAt(h.route, h.d);
    const u = s * cs * dpr;
    const x = toX(gx), y = toY(gy);
    const a = alphaAt(h.d);
    if (a <= 0) return;
    ctx.save();
    coverClip(h.route);
    ctx.globalAlpha = a;
    // soft contact shadow
    ctx.save();
    ctx.globalAlpha = 0.16 * a;
    ctx.fillStyle = "#1e2a12";
    ctx.beginPath();
    ctx.ellipse(x, y - 0.4 * u, 15 * u, 2 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    blit(h.sprites[h.frame], x, y, u, h.facing, tiltAt(h));
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (const h of horses) if (h) drawReflection(h);
    for (const h of horses) if (h) drawHorse(h);
    if (opts.debug) {
      ctx.lineWidth = 2;
      routes.forEach((r, i) => {
        ctx.strokeStyle = "#ffee00"; ctx.beginPath();
        tracks[i].pts.forEach(([x, y], k) => (k ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
        ctx.stroke();
        ctx.strokeStyle = "#ff00ff";
        for (const poly of r.cover) {
          ctx.beginPath();
          poly.forEach(([x, y], k) => (k ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
          ctx.closePath(); ctx.stroke();
        }
      });
    }
  }

  let raf = 0, last = 0, running = false, visible = true;
  function frame(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now; clock += dt;
    update(dt); draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (running || document.hidden || !visible) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const ro = new ResizeObserver(() => { measure(); if (!running) draw(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); else stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  measure(); start();

  return {
    sendNow(route = Math.floor(Math.random() * routes.length)) {
      if (!reduced && !horses[route]) spawn(route);
    },
    destroy() { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); },
  };
}
