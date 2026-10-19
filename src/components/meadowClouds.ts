/**
 * Meadow Clouds — little animal-shaped clouds in the hero sky: a dragon, a donkey,
 * a deer, a dachshund and a dolphin.
 *
 * - One fades in right away. After each one leaves, the next appears 15–20 s later.
 *   One at a time by default, never over the cherry trees in the top corners (or each
 *   other, if more are allowed).
 * - Each stays in one place, swaying and billowing a little in the wind, and fades out
 *   after 15–20 s. Tap one and it goes "poof".
 * - Each shows a faint, rippling reflection in the lake.
 * - Place the canvas behind the piglets so flying piggies pass in front of the clouds.
 *
 * Sprites are drawn from soft blobs onto a pixel grid, then given puffy cloud edges.
 * Coordinates are in the video's own pixels (1924 x 1076), mapped with the same math
 * as `object-fit: cover`. No dependencies.
 */

import { DEFAULT_WATER } from "./meadowPiglets";
import { DEFAULT_POND } from "./meadowSwans";

export type Vec = [number, number];

export interface MeadowCloudsOptions {
  canvas: HTMLCanvasElement;
  videoSize?: { width: number; height: number };
  /** Must match the video's CSS object-position (default centered). */
  objectPosition?: { x: number; y: number };
  /** Open sky (between the trees, above the hills): clouds stay entirely inside it. */
  sky?: Vec[];
  /** Seconds before the first cloud (default 0.3). */
  firstAfter?: number;
  /** Seconds after a cloud leaves before the next one appears, [min, max] (default [15, 20]). */
  every?: [number, number];
  /** Seconds a cloud stays before fading out, [min, max] (default [15, 20]). */
  lifetime?: [number, number];
  /** At most this many clouds at once (default 1). */
  max?: number;
  /** Draw the sky outline and cloud boxes. */
  debug?: boolean;
}

export interface MeadowClouds {
  /** Bring a new cloud out now (if there's room). */
  spawnNow(): void;
  destroy(): void;
}

/* ----------------------------------------------------------------------- */
/* Defaults tuned to the cherry-blossom meadow video (1924 x 1076)          */
/* ----------------------------------------------------------------------- */

/** Open sky between the cherry branches in the top corners and above the hills. */
export const DEFAULT_SKY: Vec[] = [
  [480, 8], [1225, 8], [1330, 140], [1530, 170], [1560, 265], [1510, 330], [1470, 440],
  [800, 450], [620, 415], [440, 385], [340, 360], [250, 345], [175, 325], [160, 290],
  [215, 250], [215, 205], [330, 150], [465, 100],
];

/* ----------------------------------------------------------------------- */
/* Shapes (facing right) on a 54 x 34 grid                                  */
/* ----------------------------------------------------------------------- */

const GW = 54, GH = 34, OX = 2, OY = 2, UP = 4;

type Prim =
  | ["e", number, number, number, number] // ellipse: cx, cy, rx, ry
  | ["c", number, number, number, number, number, number] // capsule: ax, ay, ra, bx, by, rb
  | ["p", ...number[]]; // polygon: x0, y0, x1, y1, ...

interface Shape { name: string; prims: Prim[]; eye: Vec; nose?: Vec; noseColor?: string }

// Each animal is built around the one feature that gives it away at a glance, kept thin enough
// to stay crisp: the dolphin's beak, fin and flukes; the dragon's bat wings and spade tail; the
// donkey's long ears; the deer's branching antlers; the dachshund's long, low body.
const SHAPES: Shape[] = [
  {
    name: "dolphin",
    prims: [
      // a leaping arc: tail stock, body, rounded melon and a slim beak
      ["c", 6, 24, 1.2, 12, 18, 2.8], ["c", 12, 18, 2.8, 21, 12.5, 4], ["c", 21, 12.5, 4, 32, 10.5, 4],
      ["c", 32, 10.5, 4, 39.5, 12.5, 3], ["e", 38.5, 11.2, 3.4, 2.9], ["c", 41.5, 13.2, 1.5, 47.5, 15.2, 0.8],
      // dorsal fin, swept back
      ["p", 22.5, 9.5, 28.5, 9, 24, 4.5, 19.5, 1.2, 21.2, 5],
      // pectoral fin
      ["c", 30, 14, 1.3, 26.8, 19, 0.6],
      // tail flukes
      ["c", 6, 24, 1, 1, 21.2, 0.7], ["c", 6, 24, 1, 2.8, 29, 0.7],
    ],
    eye: [39.2, 10.6],
  },
  {
    // A Chinese dragon: a long serpentine body with spines along its back, small clawed legs,
    // deer-like antlers, long curling whiskers, a flowing mane and a tufted tail. No wings.
    name: "dragon",
    prims: [
      ["c", 1.0, 7.5, 0.65, 1.52, 8.29, 0.73], ["c", 1.52, 8.29, 0.73, 2.25, 9.41, 0.8], ["c", 2.25, 9.41, 0.8, 3.11, 10.7, 0.88],
      ["c", 3.11, 10.7, 0.88, 4.0, 12.0, 0.95], ["c", 4.0, 12.0, 0.95, 4.91, 13.35, 1.03], ["c", 4.91, 13.35, 1.03, 5.88, 14.81, 1.1],
      ["c", 5.88, 14.81, 1.1, 6.91, 16.24, 1.18], ["c", 6.91, 16.24, 1.18, 8.0, 17.5, 1.25], ["c", 8.0, 17.5, 1.25, 9.17, 18.6, 1.33],
      ["c", 9.17, 18.6, 1.33, 10.41, 19.59, 1.41], ["c", 10.41, 19.59, 1.41, 11.69, 20.42, 1.48], ["c", 11.69, 20.42, 1.48, 13.0, 21.0, 1.56],
      ["c", 13.0, 21.0, 1.56, 14.38, 21.35, 1.63], ["c", 14.38, 21.35, 1.63, 15.81, 21.5, 1.71], ["c", 15.81, 21.5, 1.71, 17.22, 21.4, 1.78],
      ["c", 17.22, 21.4, 1.78, 18.5, 21.0, 1.86], ["c", 18.5, 21.0, 1.86, 19.62, 20.2, 1.93], ["c", 19.62, 20.2, 1.93, 20.62, 19.06, 2.01],
      ["c", 20.62, 19.06, 2.01, 21.57, 17.77, 2.08], ["c", 21.57, 17.77, 2.08, 22.5, 16.5, 2.1], ["c", 22.5, 16.5, 2.1, 23.4, 15.24, 2.1],
      ["c", 23.4, 15.24, 2.1, 24.25, 13.91, 2.1], ["c", 24.25, 13.91, 2.1, 25.1, 12.62, 2.1], ["c", 25.1, 12.62, 2.1, 26.0, 11.5, 2.1],
      ["c", 26.0, 11.5, 2.1, 26.96, 10.5, 2.1], ["c", 26.96, 10.5, 2.1, 27.97, 9.59, 2.1], ["c", 27.97, 9.59, 2.1, 28.99, 8.89, 2.1],
      ["c", 28.99, 8.89, 2.1, 30.0, 8.5, 2.1], ["c", 30.0, 8.5, 2.1, 31.01, 8.49, 2.1], ["c", 31.01, 8.49, 2.1, 32.03, 8.78, 2.1],
      ["c", 32.03, 8.78, 2.1, 33.04, 9.31, 2.1], ["c", 33.04, 9.31, 2.1, 34.0, 10.0, 2.1], ["c", 34.0, 10.0, 2.1, 34.91, 10.97, 2.1],
      ["c", 34.91, 10.97, 2.1, 35.78, 12.22, 2.1], ["c", 35.78, 12.22, 2.1, 36.64, 13.48, 2.1], ["c", 36.64, 13.48, 2.1, 37.5, 14.5, 2.1],
      ["c", 37.5, 14.5, 2.1, 38.4, 15.29, 2.1], ["c", 38.4, 15.29, 2.1, 39.31, 15.97, 2.1], ["c", 39.31, 15.97, 2.1, 40.19, 16.41, 2.08],
      ["c", 40.19, 16.41, 2.08, 41.0, 16.5, 2.04], ["c", 41.0, 16.5, 2.04, 41.76, 16.13, 2.01], ["c", 41.76, 16.13, 2.01, 42.48, 15.39, 1.97],
      ["c", 42.48, 15.39, 1.97, 43.11, 14.46, 1.93], ["c", 43.11, 14.46, 1.93, 43.6, 13.5, 1.9], ["c", 43.6, 13.5, 1.9, 43.9, 12.42, 1.86],
      ["c", 43.9, 12.42, 1.86, 44.06, 11.16, 1.82], ["c", 44.06, 11.16, 1.82, 44.14, 10.0, 1.79], ["c", 44.14, 10.0, 1.79, 44.2, 9.2, 1.75],
      ["p", 8.94, 17.03, 10.46, 15.44, 10.75, 18.61], ["p", 13.43, 19.83, 13.91, 17.68, 15.79, 20.25], ["p", 17.63, 19.8, 16.22, 18.11, 19.4, 18.19],
      ["p", 21.24, 15.23, 19.47, 13.91, 22.58, 13.24], ["p", 24.85, 10.05, 23.39, 8.4, 26.57, 8.38], ["p", 30.07, 6.54, 30.47, 4.38, 32.45, 6.87],
      ["p", 35.56, 8.91, 37.34, 7.61, 37.07, 10.78], ["p", 38.6, 13.14, 40.07, 11.5, 40.46, 14.65], ["p", 39.78, 15.48, 38.54, 13.66, 41.7, 14.05],
      ["e", 44.8, 6.2, 2.5, 2.0], ["c", 45.6, 6.9, 1.55, 49.2, 7.8, 1.05], ["c", 45.6, 8.2, 0.9, 48.4, 9.3, 0.6],
      ["c", 43.9, 4.5, 0.65, 41.6, 0.2, 0.45], ["c", 42.6, 2.2, 0.45, 44.2, 0.2, 0.4], ["c", 42.9, 5.2, 0.55, 39.6, 2.4, 0.45],
      ["c", 49, 6.9, 0.5, 50.6, 4.4, 0.48], ["c", 50.6, 4.4, 0.48, 49.6, 2, 0.42], ["c", 48.3, 9.6, 0.5, 50.2, 11.8, 0.48],
      ["c", 50.2, 11.8, 0.48, 49, 14.2, 0.42], ["p", 42.6, 5.2, 38.4, 5.2, 41.6, 7.6], ["p", 42.4, 8, 38.8, 9.4, 42, 10.2],
      ["c", 12.8, 22.2, 0.95, 11.6, 25.8, 0.7], ["c", 11.6, 25.8, 0.55, 9.8, 26.6, 0.42], ["c", 11.6, 25.8, 0.5, 12.6, 27.4, 0.42],
      ["c", 19.5, 22.2, 0.95, 20.6, 25.8, 0.7], ["c", 20.6, 25.8, 0.55, 22.4, 26.4, 0.42], ["c", 33.6, 11.6, 0.9, 34.2, 15.4, 0.68],
      ["c", 34.2, 15.4, 0.5, 35.9, 15.9, 0.42], ["c", 40.4, 18, 0.9, 40, 21.4, 0.68], ["c", 40, 21.4, 0.5, 41.8, 21.9, 0.42],
      ["c", 1, 7.5, 0.65, -1.2, 4, 0.48], ["c", 1, 7.5, 0.65, 1.4, 3.2, 0.48], ["c", 1, 7.5, 0.55, -1.7, 8.4, 0.42],
    ],
    eye: [45.4, 5.6],
  },
  {
    // A stocky little donkey: big long head, very long ears, thin legs and a tufted tail.
    name: "donkey",
    prims: [
      ["e", 21, 16, 8.8, 4.8], ["c", 28.5, 14.5, 3.3, 32, 8.6, 2.8], ["c", 32, 8.4, 3.2, 40, 12.4, 2.7],
      // long, leaf-shaped ears splayed in a V
      ["c", 30.8, 5.6, 0.9, 28.8, 1.8, 1.35], ["c", 28.8, 1.8, 1.35, 26.6, -1.8, 0.55],
      ["c", 33.2, 5.4, 0.9, 34.8, 1.6, 1.35], ["c", 34.8, 1.6, 1.35, 36, -2, 0.55],
      // legs mid-stride
      ["c", 15.2, 19, 1.4, 11.6, 27.2, 1], ["c", 19, 19.5, 1.3, 21, 27.5, 1],
      ["c", 25.2, 19.5, 1.3, 23.4, 27.5, 1], ["c", 28.6, 19, 1.4, 32.6, 27, 1],
      ["c", 12.8, 13.5, 0.75, 10.8, 21.5, 0.6], ["e", 10.6, 22.6, 1.3, 1.7],
    ],
    eye: [34.6, 8.6],
    nose: [40.6, 12.6],
  },
  {
    // A slender deer with wide, branching antlers and a white flag of a tail.
    name: "deer",
    prims: [
      ["e", 20.5, 15.5, 8, 3.4], ["e", 27, 15.2, 3, 3.3], ["c", 28.5, 13, 2.1, 32, 6.5, 1.6],
      ["c", 32, 6, 1.9, 37.6, 8.2, 1.1], ["c", 31, 5, 0.9, 28.2, 3.8, 0.55],
      // antlers: two beams, each with tines
      ["c", 32, 4, 0.75, 29.8, -1, 0.55], ["c", 30.6, 1, 0.55, 27.6, 0.6, 0.45], ["c", 29.9, -0.8, 0.5, 26.8, -1.8, 0.4],
      ["c", 33.4, 4, 0.75, 35.8, -1, 0.55], ["c", 34.7, 1.2, 0.55, 37.8, 0.8, 0.45], ["c", 35.6, -0.8, 0.5, 38.6, -1.8, 0.4],
      // long thin legs, mid-stride (the front one reaching out with a bent knee)
      ["c", 14.5, 17.5, 1.3, 10, 28, 0.8], ["c", 18, 18, 1.2, 20.6, 28.4, 0.8],
      ["c", 25.5, 18, 1.2, 23.2, 28.4, 0.8], ["c", 28.5, 17.5, 1.3, 32.6, 22.6, 1], ["c", 32.6, 22.6, 1, 33.4, 28, 0.8],
      ["c", 13, 13.5, 1, 11, 10.2, 0.8],
    ],
    eye: [33.6, 6.6],
    nose: [38.4, 8.4],
  },
  {
    // A sausage dog: long low body, very short legs, a long nose and a floppy ear.
    name: "dachshund",
    prims: [
      ["c", 11, 19.5, 3.4, 31, 19.5, 3.4], ["e", 31.5, 20, 3.3, 3.3], ["c", 32.5, 18, 2.4, 35.5, 13.5, 2.1],
      ["e", 37.2, 12, 3.1, 2.8], ["c", 39, 12.8, 1.9, 44.6, 14.4, 1.15],
      ["c", 35.6, 11.6, 1.5, 34.6, 17.6, 1.3],
      // short legs, trotting
      ["c", 12.5, 22, 1.5, 9.6, 26.4, 1.25], ["c", 16, 22, 1.5, 17.8, 26.5, 1.25],
      ["c", 29, 22, 1.5, 27.2, 26.5, 1.25], ["c", 32.5, 22, 1.5, 35.4, 26.2, 1.25],
      ["c", 8, 18, 1.1, 1.5, 14.5, 0.6],
    ],
    eye: [38.2, 11],
    nose: [45.2, 14.2],
  },
];

// Plain white, with a soft grey underside and rim so they still read against the video's clouds.
const CLOUD = { hi: "#ffffff", base: "#ffffff", mid: "#f0f2f7", shade: "#dde1ea", edge: "#c2c8d5", eye: "#6e7487" };

function mulberry(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Baked { frames: HTMLCanvasElement[]; mask: Uint8Array }

/** Three billowing frames for one animal, plus a mask (for taps) of the first. */
function bakeShape(shape: Shape, index: number): Baked {
  const frames: HTMLCanvasElement[] = [];
  let firstMask: Uint8Array | null = null;
  for (let f = 0; f < 3; f++) {
    const mask = new Uint8Array(GW * GH);
    const stamp = (test: (x: number, y: number) => boolean, x0: number, y0: number, x1: number, y1: number) => {
      for (let y = Math.max(0, Math.floor(y0 + OY)); y <= Math.min(GH - 1, Math.ceil(y1 + OY)); y++) {
        for (let x = Math.max(0, Math.floor(x0 + OX)); x <= Math.min(GW - 1, Math.ceil(x1 + OX)); x++) {
          if (test(x + 0.5 - OX, y + 0.5 - OY)) mask[y * GW + x] = 1;
        }
      }
    };
    for (const p of shape.prims) {
      if (p[0] === "e") {
        const [, cx, cy, rx, ry] = p;
        stamp((x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, cx - rx, cy - ry, cx + rx, cy + ry);
      } else if (p[0] === "p") {
        const pts: Vec[] = [];
        for (let k = 1; k < p.length; k += 2) pts.push([p[k] as number, p[k + 1] as number]);
        const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
        stamp((x, y) => inside(pts, x, y), Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
      } else {
        const [, ax, ay, ra, bx, by, rb] = p;
        const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1, R = Math.max(ra, rb);
        stamp((x, y) => {
          const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
          const r = ra + (rb - ra) * t;
          return (x - ax - dx * t) ** 2 + (y - ay - dy * t) ** 2 <= r * r;
        }, Math.min(ax, bx) - R, Math.min(ay, by) - R, Math.max(ax, bx) + R, Math.max(ay, by) + R);
      }
    }
    // Fatten everything by a pixel first, so thin legs, ears and antlers read as soft cloud too.
    const grown = mask.slice();
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      if (mask[y * GW + x]) continue;
      if ((x > 0 && mask[y * GW + x - 1]) || (x < GW - 1 && mask[y * GW + x + 1]) ||
          (y > 0 && mask[(y - 1) * GW + x]) || (y < GH - 1 && mask[(y + 1) * GW + x])) grown[y * GW + x] = 1;
    }
    mask.set(grown);
    // Puffy cloud edges: little round bumps along the outline, different in each frame, a little
    // smaller on the thinner parts so ears, fins and antlers still read.
    const depth = depthMap(mask);
    const thick = (i: number) => {
      const cx = i % GW, cy = Math.floor(i / GW);
      for (let y = Math.max(0, cy - 2); y <= Math.min(GH - 1, cy + 2); y++)
        for (let x = Math.max(0, cx - 2); x <= Math.min(GW - 1, cx + 2); x++) if (depth[y * GW + x] >= 3) return true;
      return false;
    };
    const rnd = mulberry(index * 97 + f * 13 + 5);
    const edge: number[] = [];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const i = y * GW + x;
      if (mask[i] && (!mask[i - 1] || !mask[i + 1] || !mask[i - GW] || !mask[i + GW])) edge.push(i);
    }
    for (const i of edge) {
      if (rnd() > 0.32) continue;
      const big = thick(i);
      const cx = (i % GW) + 0.5, cy = Math.floor(i / GW) + 0.5, r = big ? 1.1 + rnd() * 0.9 : 0.7 + rnd() * 0.4;
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(GH - 1, Math.ceil(cy + r)); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(GW - 1, Math.ceil(cx + r)); x++)
          if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) mask[y * GW + x] = 1;
    }
    firstMask ??= mask;

    // Shade: bright tops, soft grey undersides, a faint outline.
    const cv = document.createElement("canvas");
    cv.width = GW * UP; cv.height = GH * UP;
    const c = cv.getContext("2d")!;
    const on = (x: number, y: number) => x >= 0 && y >= 0 && x < GW && y < GH && mask[y * GW + x] === 1;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let col: string | null = null;
      if (on(x, y)) {
        if (!on(x, y - 1) || !on(x, y - 2)) col = CLOUD.hi;
        else if (!on(x, y + 1)) col = CLOUD.shade;
        else if (!on(x, y + 2)) col = CLOUD.mid;
        else col = CLOUD.base;
      } else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) col = CLOUD.edge;
      if (!col) continue;
      c.fillStyle = col;
      c.fillRect(x * UP, y * UP, UP, UP);
    }
    const dot = (p: Vec, col: string) => { c.fillStyle = col; c.fillRect(Math.floor(p[0] + OX) * UP, Math.floor(p[1] + OY) * UP, UP, UP); };
    dot(shape.eye, CLOUD.eye);
    if (shape.nose) dot(shape.nose, shape.noseColor ?? CLOUD.eye);
    frames.push(cv);
  }
  return { frames, mask: firstMask! };
}

/** How far each filled cell is from the outside (1 on the outline), 4-connected. */
function depthMap(mask: Uint8Array): Uint8Array {
  const d = new Uint8Array(mask.length);
  let frontier: number[] = [];
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const x = i % GW, y = Math.floor(i / GW);
    const out = (xx: number, yy: number) => xx < 0 || yy < 0 || xx >= GW || yy >= GH || !mask[yy * GW + xx];
    if (out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1)) { d[i] = 1; frontier.push(i); }
  }
  for (let level = 2; frontier.length; level++) {
    const nextF: number[] = [];
    for (const i of frontier) {
      const x = i % GW, y = Math.floor(i / GW);
      for (const [xx, yy] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (xx < 0 || yy < 0 || xx >= GW || yy >= GH) continue;
        const j = yy * GW + xx;
        if (mask[j] && !d[j]) { d[j] = level; nextF.push(j); }
      }
    }
    frontier = nextF;
  }
  return d;
}

let baked: Baked[] | null = null;
const getBaked = () => (baked ??= SHAPES.map((s, i) => bakeShape(s, i)));

/** The animals' names and first frames, for previews. */
export const CLOUD_ANIMALS = SHAPES.map((s) => s.name);
export const cloudSprite = (i: number) => getBaked()[i].frames[0];

/* ----------------------------------------------------------------------- */
/* Engine                                                                   */
/* ----------------------------------------------------------------------- */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const FADE_IN = 1.8, FADE_OUT = 2.4, POOF = 0.35;
const SKY_REFLECT = 0.3; // squash a reflection's height above the waterline, like the flyers'
const INTERACTIVE = "a, button, input, textarea, select, label, summary, [role='button'], [data-piglet-ignore]";

function inside(poly: Vec[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
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

interface Cloud {
  shape: number; x: number; y: number; scale: number; facing: 1 | -1;
  age: number; life: number; phase: number;
  /** set when tapped: seconds into the poof */
  poof: number;
}
interface Puff { x: number; y: number; vx: number; vy: number; r: number; age: number; life: number }

export function createMeadowClouds(opts: MeadowCloudsOptions): MeadowClouds {
  const canvas = opts.canvas;
  const ctx = canvas.getContext("2d")!;
  const VW = opts.videoSize?.width ?? 1924, VH = opts.videoSize?.height ?? 1076;
  const pos = opts.objectPosition ?? { x: 0.5, y: 0.5 };
  const sky = opts.sky ?? DEFAULT_SKY;
  const every = opts.every ?? [15, 20];
  const lifetime = opts.lifetime ?? [15, 20];
  const max = opts.max ?? 1;
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

  const clouds: Cloud[] = [];
  const puffs: Puff[] = [];
  let clock = 0;
  let next = opts.firstAfter ?? 0.3;

  /** A cloud's box in video px (its sprite's full extent), optionally padded. */
  const box = (c: { x: number; y: number; scale: number }, pad = 0) => {
    const w = GW * c.scale, h = GH * c.scale;
    return { x0: c.x - w / 2 - pad, y0: c.y - h / 2 - pad, x1: c.x + w / 2 + pad, y1: c.y + h / 2 + pad };
  };

  /** The part of the video currently on screen (the hero can be swiped sideways on phones). */
  function visibleRange(): [number, number] {
    const r = canvas.getBoundingClientRect();
    const left = Math.max(0, -r.left), right = Math.min(r.width, window.innerWidth - r.left);
    return [(left - ox) / cs, (right - ox) / cs];
  }

  function fits(c: { x: number; y: number; scale: number }) {
    const b = box(c, 6);
    // every sample point of the cloud's box must be open sky (so never over the trees or hills)
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 3; j++) {
      if (!inside(sky, b.x0 + ((b.x1 - b.x0) * i) / 5, b.y0 + ((b.y1 - b.y0) * j) / 3)) return false;
    }
    for (const o of clouds) {
      const a = box(o, 22);
      if (b.x0 < a.x1 && b.x1 > a.x0 && b.y0 < a.y1 && b.y1 > a.y0) return false;
    }
    return true;
  }

  function spawn() {
    if (clouds.length >= max) return;
    const taken = new Set(clouds.map((c) => c.shape));
    const shapes = SHAPES.map((_, i) => i).filter((i) => !taken.has(i));
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const [v0, v1] = visibleRange();
    const xs = sky.map((p) => p[0]), ys = sky.map((p) => p[1]);
    for (let attempt = 0; attempt < 80; attempt++) {
      const scale = rand(3.5, 4.3);
      // Prefer the part of the sky that's on screen right now.
      const lo = attempt < 50 ? Math.max(Math.min(...xs), v0) : Math.min(...xs);
      const hi = attempt < 50 ? Math.min(Math.max(...xs), v1) : Math.max(...xs);
      if (hi <= lo) continue;
      const c = { x: rand(lo, hi), y: rand(Math.min(...ys), Math.max(...ys)), scale };
      if (!fits(c)) continue;
      clouds.push({ shape, ...c, facing: Math.random() < 0.5 ? 1 : -1, age: 0, life: rand(lifetime[0], lifetime[1]), phase: rand(0, 6), poof: -1 });
      return;
    }
  }

  function poof(c: Cloud) {
    c.poof = 0;
    const B = getBaked()[c.shape];
    const filled: number[] = [];
    for (let i = 0; i < B.mask.length; i++) if (B.mask[i]) filled.push(i);
    for (let k = 0; k < 16; k++) {
      const i = filled[Math.floor(Math.random() * filled.length)];
      const sx = ((i % GW) + 0.5 - GW / 2) * c.facing, sy = Math.floor(i / GW) + 0.5 - GH / 2;
      const x = c.x + sx * c.scale, y = c.y + sy * c.scale;
      const d = Math.hypot(sx, sy) || 1;
      const sp = rand(35, 85) * (c.scale / 3.3);
      puffs.push({ x, y, vx: (sx / d) * sp, vy: (sy / d) * sp - 8, r: rand(4, 8) * (c.scale / 3.3), age: 0, life: rand(0.5, 0.85) });
    }
  }

  function update(dt: number) {
    clock += dt;
    // The wait for the next cloud only runs while there's room, and restarts when one leaves.
    if (clouds.length < max) {
      next -= dt;
      if (next <= 0) { spawn(); next = rand(every[0], every[1]); }
    }
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i];
      c.age += dt;
      const gone = c.poof >= 0 ? (c.poof += dt) > POOF : c.age > c.life + FADE_OUT;
      if (gone) { clouds.splice(i, 1); next = rand(every[0], every[1]); }
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
      if (p.age > p.life) puffs.splice(i, 1);
    }
  }

  const alphaOf = (c: Cloud) => {
    if (c.poof >= 0) return 1 - c.poof / POOF;
    return Math.min(clamp01(c.age / FADE_IN), 1 - clamp01((c.age - c.life) / FADE_OUT));
  };

  /** Where a cloud is drawn this frame: swaying a little in the wind, gently bobbing. */
  function sway(c: Cloud) {
    if (reduced) return { x: c.x, y: c.y };
    return { x: c.x + Math.sin(clock * 0.35 + c.phase) * 5, y: c.y + Math.sin(clock * 0.6 + c.phase * 1.3) * 2.5 };
  }

  function drawCloud(c: Cloud, reflection: boolean) {
    const B = getBaked()[c.shape];
    const { x, y } = sway(c);
    const grow = c.poof >= 0 ? 1 + 0.25 * (c.poof / POOF) : 1;
    const u = c.scale * cs * dpr * grow;
    const w = GW * u, h = GH * u;
    const a = alphaOf(c);
    // billow: cross-fade through the three frames
    const ph = reduced ? 0 : clock / 1.1 + c.phase;
    const f0 = Math.floor(ph) % 3, f1 = (f0 + 1) % 3, mix = ph - Math.floor(ph);
    ctx.save();
    if (reflection) {
      // Mirrored at the waterline, squashed toward it, faint and clipped to the water.
      const axis = lerpAxis(DEFAULT_WATER.axis, x);
      const bottom = y + (GH * c.scale * grow) / 2;
      const top = axis + Math.max(0, axis - bottom) * SKY_REFLECT;
      ctx.beginPath();
      DEFAULT_POND.forEach(([px, py], i) => (i ? ctx.lineTo(toX(px), toY(py)) : ctx.moveTo(toX(px), toY(py))));
      ctx.closePath();
      ctx.clip();
      const bands = 12, bh = h / bands, sh = B.frames[0].height / bands;
      for (let i = 0; i < bands; i++) {
        const shift = Math.sin(clock * 2.2 + i * 0.7 + x * 0.05) * u * 0.6;
        for (const [fi, fa] of [[f0, 1 - mix], [f1, mix]] as const) {
          ctx.save();
          ctx.globalAlpha = a * fa * (0.28 * (1 - i / bands) + 0.05);
          ctx.translate(toX(x) + shift, toY(top) + bh * (i + 0.5));
          ctx.scale(c.facing, -1);
          const img = B.frames[fi];
          ctx.drawImage(img, 0, img.height - sh * (i + 1), img.width, sh, -w / 2, -bh / 2, w, bh + 1);
          ctx.restore();
        }
      }
    } else {
      ctx.translate(toX(x), toY(y));
      ctx.scale(c.facing, 1);
      ctx.globalAlpha = a * (1 - mix);
      ctx.drawImage(B.frames[f0], -w / 2, -h / 2, w, h);
      ctx.globalAlpha = a * mix;
      ctx.drawImage(B.frames[f1], -w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (const c of clouds) drawCloud(c, true);
    for (const c of clouds) drawCloud(c, false);
    for (const p of puffs) {
      const k = p.age / p.life;
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.fillStyle = CLOUD.base;
      ctx.strokeStyle = CLOUD.edge;
      ctx.lineWidth = Math.max(1, cs * dpr);
      ctx.beginPath();
      ctx.arc(toX(p.x), toY(p.y), p.r * (1 + k * 0.6) * cs * dpr, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    if (opts.debug) {
      ctx.lineWidth = 2; ctx.strokeStyle = "#ff00aa";
      ctx.beginPath();
      sky.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
      ctx.closePath(); ctx.stroke();
      for (const c of clouds) { const b = box(c); ctx.strokeRect(toX(b.x0), toY(b.y0), toX(b.x1) - toX(b.x0), toY(b.y1) - toY(b.y0)); }
    }
  }

  /* -------- taps -------- */
  let down: { x: number; y: number; time: number } | null = null;
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, time: performance.now() }; };
  function onUp(e: PointerEvent) {
    const d = down; down = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.time > 600) return;
    if ((e.target as Element | null)?.closest?.(INTERACTIVE)) return;
    const r = canvas.getBoundingClientRect();
    const vx = (e.clientX - r.left - ox) / cs, vy = (e.clientY - r.top - oy) / cs;
    // nearest (topmost) cloud whose shape is under the finger, with a little slack
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i];
      if (c.poof >= 0 || alphaOf(c) < 0.3) continue;
      const { x, y } = sway(c);
      const gx = Math.floor(((vx - x) / c.scale) * c.facing + GW / 2), gy = Math.floor((vy - y) / c.scale + GH / 2);
      const M = getBaked()[c.shape].mask;
      let hit = false;
      for (let yy = gy - 1; yy <= gy + 1 && !hit; yy++) for (let xx = gx - 1; xx <= gx + 1 && !hit; xx++)
        if (xx >= 0 && yy >= 0 && xx < GW && yy < GH && M[yy * GW + xx]) hit = true;
      if (hit) { poof(c); if (!running) frame(performance.now()); return; }
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
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); else stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  measure(); start();
  if (opts.debug) (window as unknown as { __clouds?: unknown }).__clouds = () => ({ clouds, next });

  return {
    spawnNow: spawn,
    destroy() {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    },
  };
}
