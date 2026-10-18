/**
 * Meadow Swans — a pair of swans on the hero's pond, and later their cygnets.
 *
 * - A few seconds after load, two swans fade in at the far left and far right of the
 *   pond (level with the bottom of an element on the page, e.g. the intro bubble) and
 *   drift to the middle, where they meet beak to beak, their necks forming a heart.
 *   Little hearts float up for a while, then they swim off together to one side and
 *   fade out.
 * - A little later they come back from that side with four cygnets in tow, and the
 *   family roams the pond at random, now and then stopping to float. Each bird also stops on
 *   its own for a drink, sometimes upending to feed (just its tail above water). If the visitor
 *   scrolls away while they're gone, they come straight back on return.
 * - Tapping the pond always makes a ripple (clipped to the water, so never over the
 *   grass). Once the family is out, they swim over to the latest ripple.
 * - Soft reflections; small wakes while swimming. Swans skip reduced motion (ripples stay).
 *
 * Sprites are drawn from a little skeleton onto a pixel grid, like the horses.
 * Coordinates are in the video's own pixels (1924 x 1076), mapped with the same math
 * as `object-fit: cover`. No dependencies.
 */

export type Vec = [number, number];

export interface MeadowSwansOptions {
  canvas: HTMLCanvasElement;
  videoSize?: { width: number; height: number };
  /** Must match the video's CSS object-position (default centered). */
  objectPosition?: { x: number; y: number };
  /** Outline of the water surface; ripples are clipped to it. */
  pond?: Vec[];
  /** Where the birds may swim (their waterline), inset from the shore. */
  swim?: Vec[];
  /** CSS selector of an element whose bottom edge sets the height of the first swim-in. */
  alignWith?: string;
  /** Seconds before the pair appears (default 5). */
  introAfter?: number;
  /** Seconds for the pair to drift to the middle (default 10). */
  meetAfter?: number;
  /** Seconds they stay together in a heart (default 10). */
  heartFor?: number;
  /** Seconds before they return with the cygnets (default 10). */
  awayFor?: number;
  /** How many cygnets (default 4). */
  cygnets?: number;
  /** Draw the pond and swim outlines. */
  debug?: boolean;
}

export interface MeadowSwans {
  destroy(): void;
}

/* ----------------------------------------------------------------------- */
/* Defaults tuned to the cherry-blossom meadow video (1924 x 1076)          */
/* ----------------------------------------------------------------------- */

/** The water surface, traced tightly so ripples never reach the grass. */
export const DEFAULT_POND: Vec[] = [
  [398, 612], [470, 604], [560, 594], [700, 589], [850, 585], [960, 579], [1080, 579],
  [1180, 583], [1240, 592], [1350, 598], [1500, 601], [1600, 608], [1700, 622], [1758, 640],
  [1765, 652], [1720, 672], [1650, 688], [1550, 705], [1450, 725], [1400, 740], [1300, 749],
  [1200, 757], [1100, 764], [1000, 761], [900, 754], [800, 747], [700, 736], [600, 728],
  [530, 720], [470, 700], [430, 672], [400, 640],
];

/** Swimming area: kept off the banks (and the horses' drinking spots). */
export const DEFAULT_SWIM: Vec[] = [
  [470, 630], [560, 616], [700, 608], [850, 602], [1000, 597], [1150, 600], [1300, 610],
  [1450, 616], [1580, 624], [1680, 640], [1700, 656], [1640, 676], [1520, 698], [1400, 722],
  [1250, 738], [1100, 746], [950, 742], [800, 734], [650, 722], [540, 708], [480, 688], [455, 660],
];

/* ----------------------------------------------------------------------- */
/* Pixel rasteriser                                                         */
/* ----------------------------------------------------------------------- */

const UP = 4;
type Sprite = HTMLCanvasElement;

interface Grid {
  w: number; h: number; keys: (string | null)[];
  ellipse(cx: number, cy: number, rx: number, ry: number, key: string): void;
  capsule(a: Vec, ra: number, b: Vec, rb: number, key: string): void;
  path(pts: Vec[], radii: number[], key: string): void;
  dot(x: number, y: number, key: string): void;
}

function grid(w: number, h: number, waterY: number): Grid {
  const keys: (string | null)[] = new Array(w * h).fill(null);
  const each = (x0: number, y0: number, x1: number, y1: number, test: (px: number, py: number) => boolean, key: string) => {
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(h - 1, Math.ceil(y1)); y++) {
      if (y + 0.5 > waterY) continue; // everything below the waterline is under water
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(w - 1, Math.ceil(x1)); x++) {
        if (test(x + 0.5, y + 0.5)) keys[y * w + x] = key;
      }
    }
  };
  const g: Grid = {
    w, h, keys,
    ellipse: (cx, cy, rx, ry, key) =>
      each(cx - rx, cy - ry, cx + rx, cy + ry, (px, py) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1, key),
    capsule: (a, ra, b, rb, key) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy || 1, R = Math.max(ra, rb);
      each(Math.min(a[0], b[0]) - R, Math.min(a[1], b[1]) - R, Math.max(a[0], b[0]) + R, Math.max(a[1], b[1]) + R, (px, py) => {
        const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / len2));
        const r = ra + (rb - ra) * t;
        return (px - a[0] - dx * t) ** 2 + (py - a[1] - dy * t) ** 2 <= r * r;
      }, key);
    },
    path: (pts, radii, key) => {
      for (let i = 0; i < pts.length - 1; i++) g.capsule(pts[i], radii[i], pts[i + 1], radii[i + 1], key);
    },
    dot: (x, y, key) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      if (xi >= 0 && yi >= 0 && xi < w && yi < h && keys[yi * w + xi]) keys[yi * w + xi] = key;
    },
  };
  return g;
}

/** Shade, outline and paint a grid into an upscaled sprite. */
function bake(g: Grid, palette: Record<string, string>, shadeBelow: number, outline: string): Sprite {
  const { w, h, keys } = g;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? null : keys[y * w + x]);
  const cv = document.createElement("canvas");
  cv.width = w * UP; cv.height = h * UP;
  const c = cv.getContext("2d")!;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let k = at(x, y);
      if (!k) {
        if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) {
          c.fillStyle = outline;
          c.fillRect(x * UP, y * UP, UP, UP);
        }
        continue;
      }
      // Body tones: a soft shade low on the body, and a feather line under the folded wing.
      if (k === "B" && y + 0.5 > shadeBelow) k = "S";
      if (k === "w") k = at(x, y + 1) === "B" || at(x, y + 1) === "S" ? "G" : "B";
      c.fillStyle = palette[k] ?? palette.B;
      c.fillRect(x * UP, y * UP, UP, UP);
    }
  }
  return cv;
}

/* ----------------------------------------------------------------------- */
/* Swans (facing right; waterline at WATER_Y)                               */
/* ----------------------------------------------------------------------- */

const SW = 28, SH = 20, S_WATER = 16, S_ANCHOR = 12;
/** Where the beak tip sits in the heart pose; two mirrored swans meet here. */
const KISS_X = 22.9;
const SWAN = { B: "#fbfbfd", S: "#dfe4ee", G: "#c7cedb", K: "#26252b", O: "#ee8a3a", E: "#121216" };
const SWAN_OUTLINE = "#6c7488";

type SwanPose = "swim" | "heart" | "drink" | "upend";

function bakeSwan(pose: "swim" | "heart" | "drink"): Sprite {
  const g = grid(SW, SH, S_WATER);
  g.capsule([5.2, 13.2], 1.9, [2.4, 10.8], 0.9, "B"); // tail
  g.ellipse(11.5, 14.2, 7.2, 3.4, "B"); // body
  g.ellipse(pose === "heart" ? 18.4 : 16.5, 13.8, pose === "heart" ? 3.3 : 3.0, 2.8, "B"); // chest
  g.ellipse(10.2, 12.2, 5.6, 2.5, "w"); // folded wing
  if (pose === "swim") {
    g.path([[17.4, 12.4], [18.6, 9.4], [17.8, 6.4], [18.4, 3.6]], [1.45, 1.25, 1.15, 1.1], "B");
    g.ellipse(19.4, 2.9, 1.9, 1.35, "B");
    g.capsule([20.9, 3.1], 0.75, [23.2, 3.9], 0.45, "O");
    g.dot(20.9, 2.6, "K"); g.dot(21.4, 2.9, "K");
    g.dot(19.7, 2.4, "E");
  } else if (pose === "heart") {
    // Neck rises from the chest, arches up and back, and curls over so the head bows to the
    // middle: with a mirrored partner, the two necks draw the lobes of a heart.
    g.path([[18.8, 12.2], [16.6, 9.0], [16.4, 5.6], [17.8, 3.0], [19.9, 2.6], [21.3, 4.2]], [1.45, 1.3, 1.2, 1.15, 1.1, 1.05], "B");
    g.ellipse(21.7, 5.4, 1.45, 1.8, "B");
    g.capsule([22.1, 6.9], 0.7, [22.5, 8.8], 0.45, "O");
    g.dot(22.0, 6.6, "K");
    g.dot(21.0, 5.0, "E");
  } else {
    // Drinking: neck stretched forward and down, beak dipped below the waterline.
    g.path([[17.4, 12.4], [19.6, 10.6], [22.0, 11.6], [23.4, 13.6]], [1.45, 1.3, 1.2, 1.1], "B");
    g.ellipse(23.8, 14.4, 1.7, 1.25, "B");
    g.capsule([25.2, 14.9], 0.7, [26.6, 16.2], 0.45, "O");
    g.dot(25.1, 14.4, "K");
    g.dot(23.9, 13.9, "E");
  }
  return bake(g, SWAN, 14.8, SWAN_OUTLINE);
}

/** Upending to feed: head and neck under water, only the back end and tail showing. */
function bakeSwanUpend(frame: 0 | 1): Sprite {
  const g = grid(SW, SH, S_WATER);
  g.ellipse(11.2, 16.2, 5.6, 3.6, "B"); // a rounded rump, just breaking the surface
  g.ellipse(12.2, 14.4, 3.4, 1.5, "w"); // folded wing tips
  g.capsule([8.6, 13.4], 1.5, [frame ? 6.9 : 7.5, frame ? 10.6 : 10.3], 0.7, "B"); // short tail, tipped up
  // a webbed foot kicking at the surface behind
  g.capsule([6.2, 15.4], 0.5, frame ? [4.6, 14.4] : [4.9, 15.6], 0.45, "K");
  return bake(g, SWAN, 14.8, SWAN_OUTLINE);
}

/* Cygnets: small, grey and fluffy */
const CW = 16, CH = 12, C_WATER = 9.6, C_ANCHOR = 7;
const CYGNET = { B: "#aaa59f", S: "#8f8a84", G: "#8f8a84", K: "#4a4440", O: "#4a4440", E: "#1d1a19" };

function bakeCygnet(pose: "swim" | "drink"): Sprite {
  const g = grid(CW, CH, C_WATER);
  g.capsule([3.4, 8.0], 1.1, [2.2, 7.0], 0.6, "B");
  g.ellipse(7, 8.6, 4.2, 2.5, "B");
  const drinking = pose === "drink";
  const head: Vec = drinking ? [11.6, 8.4] : [10.4, 5.3];
  g.capsule([9.0, 7.8], 1.4, head, 1.3, "B");
  g.ellipse(head[0], head[1], 1.9, 1.75, "B");
  // beak pointing forward, or tipped down into the water while drinking
  if (drinking) g.capsule([head[0] + 1.3, head[1] + 0.6], 0.5, [head[0] + 2.1, head[1] + 1.6], 0.4, "O");
  else g.capsule([head[0] + 1.6, head[1] + 0.3], 0.5, [head[0] + 2.7, head[1] + 0.6], 0.4, "O");
  g.dot(head[0] + 0.5, head[1] - 0.4, "E");
  return bake(g, CYGNET, 9.0, "#4f4b48");
}

function bakeCygnetUpend(frame: 0 | 1): Sprite {
  const g = grid(CW, CH, C_WATER);
  g.ellipse(6.8, 10.2, 3.3, 2.4, "B"); // a fluffy round rump
  g.capsule([5.2, 8.6], 0.8, [frame ? 4.3 : 4.7, 7.2], 0.5, "B"); // tail nub, tipped up
  return bake(g, CYGNET, 9.0, "#4f4b48");
}

/* A little floating heart, like the piglets' */
const HEART = [".OO.OO.", "OPPOPPO", "OPPPPPO", ".OPPPO.", "..OPO..", "...O..."];
function bakeHeart(): Sprite {
  const cv = document.createElement("canvas");
  cv.width = 7 * UP; cv.height = 6 * UP;
  const c = cv.getContext("2d")!;
  HEART.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch === ".") return;
    c.fillStyle = ch === "O" ? "#c23f6c" : "#ff86ad";
    c.fillRect(x * UP, y * UP, UP, UP);
  }));
  return cv;
}

let sprites: {
  swim: Sprite; heart: Sprite; drink: Sprite; upend: [Sprite, Sprite];
  cygnet: Sprite; cygnetDrink: Sprite; cygnetUpend: [Sprite, Sprite]; heartIcon: Sprite;
} | null = null;
const getSprites = () =>
  (sprites ??= {
    swim: bakeSwan("swim"), heart: bakeSwan("heart"), drink: bakeSwan("drink"), upend: [bakeSwanUpend(0), bakeSwanUpend(1)],
    cygnet: bakeCygnet("swim"), cygnetDrink: bakeCygnet("drink"), cygnetUpend: [bakeCygnetUpend(0), bakeCygnetUpend(1)],
    heartIcon: bakeHeart(),
  });

/* ----------------------------------------------------------------------- */
/* Geometry helpers                                                         */
/* ----------------------------------------------------------------------- */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function inside(poly: Vec[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Leftmost and rightmost x where a horizontal line crosses the polygon. */
function spanAt(poly: Vec[], y: number): [number, number] | null {
  const xs: number[] = [];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
  }
  return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : null;
}

/** The closest point inside the polygon (nudged a little inward). */
function clampInside(poly: Vec[], x: number, y: number): Vec {
  if (inside(poly, x, y)) return [x, y];
  let best: Vec = poly[0], bd = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    const px = ax + dx * t, py = ay + dy * t, d = (px - x) ** 2 + (py - y) ** 2;
    if (d < bd) { bd = d; best = [px, py]; }
  }
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  const len = Math.hypot(cx - best[0], cy - best[1]) || 1;
  return [best[0] + ((cx - best[0]) / len) * 8, best[1] + ((cy - best[1]) / len) * 8];
}

/* ----------------------------------------------------------------------- */
/* Engine                                                                   */
/* ----------------------------------------------------------------------- */

type Phase = "wait" | "intro" | "heart" | "leave" | "away" | "family";

interface Bird {
  kind: "adult" | "cygnet";
  x: number; y: number; facing: 1 | -1; alpha: number;
  pose: SwanPose; bob: number; wake: number;
  /** spawn point, for fading in as they swim out */
  sx: number; sy: number;
  vx: number; vy: number;
  /** drinking: seconds left in this drink, seconds until the next one, and the dip rhythm */
  drinkFor: number; nextDrink: number; sip: number; dipped: boolean;
  /** this stop is a full upend (feeding) rather than a sip */
  deep: boolean;
}

interface Ripple { x: number; y: number; age: number; size: number; strength: number }
interface Floater { x: number; y: number; age: number; life: number; scale: number }

const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [data-piglet-ignore]";

export function createMeadowSwans(opts: MeadowSwansOptions): MeadowSwans {
  const canvas = opts.canvas;
  const ctx = canvas.getContext("2d")!;
  const VW = opts.videoSize?.width ?? 1924, VH = opts.videoSize?.height ?? 1076;
  const pos = opts.objectPosition ?? { x: 0.5, y: 0.5 };
  const pond = opts.pond ?? DEFAULT_POND;
  const swim = opts.swim ?? DEFAULT_SWIM;
  const T = {
    intro: opts.introAfter ?? 5, meet: opts.meetAfter ?? 10, heart: opts.heartFor ?? 10, away: opts.awayFor ?? 10,
  };
  const nCygnets = opts.cygnets ?? 4;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  let dpr = 1, cssW = 0, cssH = 0, cs = 1, ox = 0, oy = 0;
  function measure() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = r.width; cssH = r.height;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    cs = Math.max(cssW / VW, cssH / VH);
    ox = (cssW - VW * cs) * pos.x; oy = (cssH - VH * cs) * pos.y;
  }
  const toX = (v: number) => (ox + v * cs) * dpr;
  const toY = (v: number) => (oy + v * cs) * dpr;

  /** Size by depth: smaller toward the far end of the lake, larger near the sides and front. */
  const scaleAt = (x: number, y: number) => {
    const ky = clamp01((y - 585) / 180), kx = clamp01(Math.abs(x - 1010) / 750);
    return 0.9 + 2.2 * Math.max(ky, 0.6 * kx);
  };

  let phase: Phase = "wait";
  let t = 0;
  let birds: Bird[] = [];
  let side: 1 | -1 = 1; // which side they left toward (and come back from)
  let leftView = false;
  const ripples: Ripple[] = [];
  const floaters: Floater[] = [];
  let heartTimer = 0;
  let leaveFrom = 0;

  // Intro geometry, worked out when the pair appears.
  let meet = { x: 962, y: 666, off: 0 };
  let starts: [Vec, Vec] = [[470, 666], [1700, 666]];

  function introLine(): number {
    let y = 666;
    const el = opts.alignWith ? document.querySelector(opts.alignWith) : null;
    if (el) {
      const r = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
      y = (r.bottom - c.top - oy) / cs;
    }
    // Keep it on open water in the middle of the lake.
    return Math.max(612, Math.min(735, y));
  }

  const bird = (kind: Bird["kind"], x: number, y: number, facing: 1 | -1): Bird => ({
    kind, x, y, facing, alpha: 0, pose: "swim", bob: Math.random() * 6, wake: 0, sx: x, sy: y, vx: 0, vy: 0,
    drinkFor: 0, nextDrink: rand(6, 26), sip: 0, dipped: false, deep: false,
  });

  function startIntro() {
    const y = introLine();
    const span = spanAt(swim, y) ?? [480, 1690];
    meet = { x: VW / 2, y, off: (KISS_X - S_ANCHOR) * scaleAt(VW / 2, y) };
    // Start the same distance out on both sides, so they swim at the same speed: as far as
    // the nearer shore allows (the other one fades in a little way out on the water).
    const reach = Math.min(meet.x - (span[0] + 6), span[1] - 6 - meet.x);
    starts = [[meet.x - reach, y], [meet.x + reach, y]];
    birds = [bird("adult", starts[0][0], y, 1), bird("adult", starts[1][0], y, -1)];
    phase = "intro"; t = 0;
  }

  function startFamily() {
    const y = Math.max(625, Math.min(730, meet.y + rand(-20, 20)));
    const span = spanAt(swim, y) ?? [480, 1690];
    const x = side === 1 ? span[1] - 6 : span[0] + 6;
    const facing = (side === 1 ? -1 : 1) as 1 | -1;
    birds = [bird("adult", x, y, facing), bird("adult", x, y, facing)];
    for (let i = 0; i < nCygnets; i++) birds.push(bird("cygnet", x, y, facing));
    phase = "family"; t = 0;
    roam = { target: pickTarget(x, y), mode: "go", until: 0 };
    for (const b of birds) b.nextDrink = rand(6, 26);
  }

  /* -------- family roaming -------- */
  let roam = { target: [962, 680] as Vec, mode: "go" as "go" | "sit" | "pause", until: 0 };

  function pickTarget(fx: number, fy: number): Vec {
    for (let i = 0; i < 40; i++) {
      const p: Vec = [rand(470, 1700), rand(600, 745)];
      if (inside(swim, p[0], p[1]) && Math.hypot(p[0] - fx, p[1] - fy) > 160) return p;
    }
    return clampInside(swim, 962, 680);
  }

  /** Move toward a point at a capped speed, staying on the water. */
  function steer(b: Bird, tx: number, ty: number, speed: number, dt: number, settle = 1.5) {
    const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy);
    // Close enough: stay put (tiny corrections would read as still swimming).
    if (d < settle) { b.vx = b.vy = 0; return d; }
    const s = Math.min(d, speed * dt);
    const nx = d ? b.x + (dx / d) * s : b.x, ny = d ? b.y + (dy / d) * s : b.y;
    // (A bird that's somehow off the swim area may always head back onto it.)
    if (inside(swim, nx, ny) || !inside(swim, b.x, b.y)) { b.x = nx; b.y = ny; }
    else if (inside(swim, nx, b.y)) b.x = nx;
    else if (inside(swim, b.x, ny)) b.y = ny;
    b.vx = d ? ((dx / d) * s) / (dt || 1) : 0;
    b.vy = d ? ((dy / d) * s) / (dt || 1) : 0;
    if (Math.abs(b.vx) > 2.5) b.facing = b.vx > 0 ? 1 : -1;
    return d;
  }

  function updateFamily(dt: number) {
    const [mom, dad, ...kids] = birds;
    const base = 26 * (scaleAt(mom.x, mom.y) / 1.3);
    const chasing = roam.mode === "go" && roam.until < 0; // heading to a ripple

    // Drinking is up to each bird: now and then (never while chasing a ripple) it stops
    // wherever it is, dips its beak a few times, then carries on and catches up.
    for (const b of birds) {
      if (chasing) { b.drinkFor = 0; continue; }
      if (b.drinkFor > 0) { b.drinkFor -= dt; continue; }
      b.nextDrink -= dt;
      if (b.nextDrink <= 0) {
        b.deep = Math.random() < 0.5; // half the time they tip right over to feed
        b.drinkFor = b.deep ? rand(4, 7) : rand(2.5, 5); b.nextDrink = rand(14, 32);
        b.dipped = false; b.sip = rand(0.1, 0.5);
      }
    }
    const drinking = (b: Bird) => b.drinkFor > 0;
    const hold = (b: Bird) => { b.vx = b.vy = 0; };

    if (roam.mode === "go") {
      if (drinking(mom)) hold(mom);
      else {
        const d = steer(mom, roam.target[0], roam.target[1], base * (chasing ? 1.5 : 1), dt);
        if (d < 4) {
          // At a ripple: gather round and float there for a bit. Otherwise sometimes a stop
          // to float still, sometimes just a breather before the next spot.
          if (chasing) { roam.mode = "sit"; roam.until = rand(4, 8); }
          else if (Math.random() < 0.4) { roam.mode = "sit"; roam.until = rand(5, 12); }
          else { roam.mode = "pause"; roam.until = rand(0.6, 2); }
        }
      }
    } else {
      hold(mom);
      roam.until -= dt;
      if (roam.until <= 0) { roam.mode = "go"; roam.target = pickTarget(mom.x, mom.y); }
    }
    const sitting = roam.mode === "sit";

    // Mom leads, the cygnets follow in a line, and dad brings up the rear. While mom stops,
    // the cygnets gather around her and dad settles alongside.
    const s = scaleAt(mom.x, mom.y);
    const follow = (b: Bird, lead: Bird, gap: number, speed: number) => {
      const d = Math.hypot(lead.x - b.x, lead.y - b.y);
      if (d <= gap) { hold(b); return; }
      const f = (d - gap) / d; // aim for the point `gap` short of the bird ahead
      steer(b, ...clampInside(swim, b.x + (lead.x - b.x) * f, b.y + (lead.y - b.y) * f), speed, dt);
    };

    if (drinking(dad)) hold(dad);
    else if (sitting) {
      steer(dad, ...clampInside(swim, mom.x - mom.facing * 26 * s, mom.y + 9 * s), base * 1.4, dt, 5);
      if (Math.abs(dad.vx) < 2.5) dad.facing = mom.facing;
    } else {
      follow(dad, kids[kids.length - 1] ?? mom, (kids.length ? 19 : 22) * s, base * 1.5);
    }

    kids.forEach((k, i) => {
      if (drinking(k)) { hold(k); return; }
      if (sitting) {
        // a loose half-ring in front of and beside mom (depth squashed)
        const a = -Math.PI * 0.15 + (i / Math.max(1, kids.length - 1)) * Math.PI * 1.3;
        steer(k, ...clampInside(swim, mom.x + mom.facing * Math.cos(a) * 24 * s, mom.y + Math.sin(a) * 9 * s), base * 1.6, dt, 5);
      } else {
        follow(k, i === 0 ? mom : kids[i - 1], (i === 0 ? 18 : 11) * scaleAt(k.x, k.y), base * 1.6);
      }
    });

    // While drinking: dip, come up, dip again, each bird in its own rhythm, with a ripple
    // each time. A deep one tips right over (tail up) and stays under a little longer.
    for (const b of birds) {
      if (!drinking(b)) { b.pose = "swim"; b.dipped = false; continue; }
      b.sip -= dt;
      if (b.sip <= 0) {
        b.dipped = !b.dipped;
        b.sip = b.dipped ? (b.deep ? rand(1.6, 2.6) : rand(0.9, 1.4)) : rand(0.6, 1.4);
        if (b.dipped) {
          const sb = scaleAt(b.x, b.y), adult = b.kind === "adult";
          const reachOut = b.deep ? (adult ? 6 : 2.5) : adult ? 14 : 5.5;
          const size = (adult ? 0.22 : 0.14) * (b.deep ? 1.6 : 1);
          ripples.push({ x: b.x + b.facing * reachOut * sb, y: b.y, age: 0, size, strength: 0.6 });
        }
      }
      b.pose = b.dipped ? (b.deep ? "upend" : "drink") : "swim";
    }

    separate();
  }

  /** Nudge birds apart so their sprites don't sit on top of each other. */
  function separate() {
    for (let i = 0; i < birds.length; i++) {
      for (let j = i + 1; j < birds.length; j++) {
        const a = birds[i], b = birds[j];
        if (!a.vx && !a.vy && !b.vx && !b.vy) continue; // both settled: leave them be
        const s = scaleAt(a.x, a.y);
        const reach = ((a.kind === "adult" ? 10 : 5.5) + (b.kind === "adult" ? 10 : 5.5)) * s;
        const dx = b.x - a.x, dy = (b.y - a.y) * 2.4; // depth looks compressed: count it more
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < reach) {
          const push = (reach - d) * 0.2;
          const ux = dx / d, uy = dy / d / 2.4;
          for (const [bb, sgn] of [[a, -1], [b, 1]] as const) {
            const nx = bb.x + ux * push * sgn, ny = bb.y + uy * push * sgn;
            if (inside(swim, nx, ny)) { bb.x = nx; bb.y = ny; }
          }
        }
      }
    }
  }

  /* -------- main update -------- */
  function update(dt: number) {
    t += dt;
    for (let i = ripples.length - 1; i >= 0; i--) if ((ripples[i].age += dt) > 2.2) ripples.splice(i, 1);
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.age += dt; f.y -= 16 * dt; f.x += Math.sin(f.age * 3 + i) * 4 * dt;
      if (f.age > f.life) floaters.splice(i, 1);
    }
    if (reduced) return;

    if (phase === "wait") {
      if (t >= T.intro) startIntro();
    } else if (phase === "intro") {
      const k = clamp01(t / T.meet), e = 1 - (1 - k) ** 2; // ease out as they arrive
      const [a, b] = birds;
      a.x = starts[0][0] + (meet.x - meet.off - starts[0][0]) * e;
      b.x = starts[1][0] + (meet.x + meet.off - starts[1][0]) * e;
      a.vx = b.vx = 30 * (1 - k);
      for (const bd of birds) bd.alpha = clamp01(t / 1.8);
      if (k >= 1) {
        phase = "heart"; t = 0; heartTimer = 0;
        a.pose = b.pose = "heart";
        a.vx = b.vx = 0;
      }
    } else if (phase === "heart") {
      heartTimer -= dt;
      if (heartTimer <= 0 && t < T.heart - 0.8) {
        heartTimer = rand(0.5, 0.9);
        const s = scaleAt(meet.x, meet.y);
        floaters.push({ x: meet.x + rand(-6, 6) * s, y: meet.y - 18 * s, age: 0, life: rand(1.5, 2.1), scale: s * rand(0.85, 1.15) });
      }
      if (t >= T.heart) {
        phase = "leave"; t = 0;
        side = Math.random() < 0.5 ? 1 : -1;
        birds.forEach((b) => { b.pose = "swim"; b.facing = side; });
        // Whoever is on the leaving side goes first; the other snuggles up right beside it.
        birds.sort((a, b) => (b.x - a.x) * side);
        leaveFrom = birds[0].x;
      }
    } else if (phase === "leave") {
      // Takes as long as the swim in (meetAfter), easing in instead of out.
      const span = spanAt(swim, meet.y) ?? [480, 1690];
      const edge = side === 1 ? span[1] - 6 : span[0] + 6;
      const [lead, follow] = birds;
      const k = clamp01(t / T.meet), e = k * k;
      const prev = lead.x;
      lead.x = leaveFrom + (edge - leaveFrom) * e;
      const s = scaleAt(lead.x, lead.y);
      // Hugged up together: the partner swims almost on top of the leader, just nearer the
      // viewer (so it's drawn in front) and only slightly behind.
      // (It moves with the leader and closes any gap, so it never trails as they speed up.)
      follow.x += lead.x - prev + (lead.x - side * 3.5 * s - follow.x) * Math.min(1, dt * 3);
      follow.y += (meet.y + 2.6 * s - follow.y) * Math.min(1, dt * 3);
      lead.vx = follow.vx = dt ? (lead.x - prev) / dt : 0;
      for (const b of birds) b.alpha = Math.min(b.alpha, clamp01(((edge - lead.x) * side) / 70));
      if (k >= 1) { phase = "away"; t = 0; birds = []; leftView = false; }
    } else if (phase === "away") {
      if (t >= T.away) startFamily();
    } else if (phase === "family") {
      updateFamily(dt);
      for (const b of birds) {
        b.alpha = Math.max(b.alpha, clamp01(Math.hypot(b.x - b.sx, b.y - b.sy) / 26));
        if (t > 20) b.alpha = 1;
      }
    }

    // Bobbing and wakes.
    for (const b of birds) {
      b.bob += dt;
      const moving = Math.hypot(b.vx, b.vy) > 6;
      b.wake -= dt;
      if (moving && b.wake <= 0 && b.alpha > 0.3) {
        b.wake = b.kind === "adult" ? 0.55 : 0.45;
        const s = scaleAt(b.x, b.y);
        ripples.push({ x: b.x - b.facing * (b.kind === "adult" ? 6 : 3) * s, y: b.y + 0.5, age: 0, size: (b.kind === "adult" ? 0.32 : 0.2), strength: 0.45 * b.alpha });
        if (ripples.length > 60) ripples.shift();
      }
    }
  }

  /* -------- taps on the pond -------- */
  let down: { x: number; y: number; time: number } | null = null;
  function onDown(e: PointerEvent) {
    down = { x: e.clientX, y: e.clientY, time: performance.now() };
  }
  function onUp(e: PointerEvent) {
    const d = down; down = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.time > 600) return; // a swipe, not a tap
    const target = e.target as Element | null;
    if (target?.closest?.(INTERACTIVE)) return;
    const r = canvas.getBoundingClientRect();
    const vx = (e.clientX - r.left - ox) / cs, vy = (e.clientY - r.top - oy) / cs;
    if (!inside(pond, vx, vy)) return;
    ripples.push({ x: vx, y: vy, age: 0, size: 1, strength: 1 });
    if (phase === "family" && birds.length) {
      roam.target = clampInside(swim, vx, vy);
      roam.mode = "go";
      roam.until = -1; // marks "heading to a ripple"
    }
    if (!running) frame(performance.now());
  }

  /* -------- drawing -------- */
  function pondPath() {
    ctx.beginPath();
    pond.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
    ctx.closePath();
  }

  function spriteFor(b: Bird) {
    const S = getSprites();
    const wiggle = (Math.floor(b.bob * 4) % 2) as 0 | 1; // tail wiggle / paddling while upended
    if (b.kind === "cygnet") {
      const img = b.pose === "upend" ? S.cygnetUpend[wiggle] : b.pose === "drink" ? S.cygnetDrink : S.cygnet;
      return { img, w: CW, h: CH, ax: C_ANCHOR, wy: C_WATER };
    }
    return { img: b.pose === "upend" ? S.upend[wiggle] : S[b.pose], w: SW, h: SH, ax: S_ANCHOR, wy: S_WATER };
  }

  function drawRipples() {
    if (!ripples.length) return;
    ctx.save();
    pondPath();
    ctx.clip();
    for (const r of ripples) {
      const s = scaleAt(r.x, r.y);
      const squash = 0.2 + 0.16 * clamp01((r.y - 585) / 180); // flatter toward the far end
      {
        const p = clamp01(r.age / 2.2);
        const rad = (4 + 40 * r.size * (1 - (1 - p) ** 2.2)) * s * cs * dpr;
        const a = r.strength * 0.55 * (1 - p) ** 1.5;
        if (a <= 0.01) continue;
        ctx.lineWidth = Math.max(1, 1.3 * s * dpr * cs);
        ctx.strokeStyle = `rgba(40,62,96,${a * 0.35})`;
        ctx.beginPath(); ctx.ellipse(toX(r.x), toY(r.y) + 1.2 * dpr, rad, rad * squash, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.ellipse(toX(r.x), toY(r.y), rad, rad * squash, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBird(b: Bird, reflection: boolean) {
    const { img, w, h, ax, wy } = spriteFor(b);
    const s = scaleAt(b.x, b.y);
    const u = s * cs * dpr;
    const bob = Math.sin(b.bob * 2.1) * 0.25 * u;
    const x = toX(b.x), y = toY(b.y) + bob;
    ctx.save();
    if (reflection) {
      // Mirrored at the waterline, faint and rippled.
      pondPath();
      ctx.clip();
      const bands = 10, sh = (wy * UP) / bands;
      for (let i = 0; i < bands; i++) {
        const shift = Math.sin(t * 2.4 + i * 0.8 + b.x * 0.05) * u * 0.3;
        ctx.save();
        ctx.globalAlpha = b.alpha * (0.3 * (1 - i / bands) + 0.04);
        ctx.translate(x + shift, y + (wy * u / bands) * (i + 0.5));
        ctx.scale(b.facing, -1);
        ctx.drawImage(img, 0, wy * UP - sh * (i + 1), img.width, sh, -ax * u, -(wy * u) / bands / 2, w * u, (wy * u) / bands + 1);
        ctx.restore();
      }
    } else {
      ctx.globalAlpha = b.alpha;
      ctx.translate(x, y);
      ctx.scale(b.facing, 1);
      ctx.drawImage(img, -ax * u, -wy * u, w * u, h * u);
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawRipples();
    const order = [...birds].sort((a, b) => a.y - b.y);
    for (const b of order) if (b.alpha > 0) drawBird(b, true);
    for (const b of order) if (b.alpha > 0) drawBird(b, false);
    const H = getSprites().heartIcon;
    for (const f of floaters) {
      const k = f.age / f.life;
      const u = f.scale * 0.75 * cs * dpr;
      ctx.save();
      ctx.globalAlpha = (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8) * 0.95;
      ctx.drawImage(H, toX(f.x) - 3.5 * u, toY(f.y) - 6 * u, 7 * u, 6 * u);
      ctx.restore();
    }
    if (opts.debug) {
      ctx.lineWidth = 2;
      for (const [poly, col] of [[pond, "#00e5ff"], [swim, "#ffee00"]] as const) {
        ctx.strokeStyle = col; ctx.beginPath();
        poly.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
        ctx.closePath(); ctx.stroke();
      }
    }
  }

  let raf = 0, last = 0, running = false, visible = true;
  function frame(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    update(dt); draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (running || document.hidden || !visible) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const ro = new ResizeObserver(() => { measure(); if (!running) draw(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (!visible) {
      if (phase === "away") leftView = true;
      stop();
    } else {
      // Scrolled away while they were gone and came back: bring the family out right away.
      if (phase === "away" && leftView) startFamily();
      start();
    }
  });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  measure(); start();
  if (opts.debug) (window as unknown as { __swans?: unknown }).__swans = () => ({ phase, t, roam, birds });

  return {
    destroy() {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    },
  };
}
