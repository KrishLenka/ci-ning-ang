/**
 * Meadow Bunnies — an occasional little bunny bounding through the
 * foreground flowers of the hero video. Purely decorative (no clicks).
 *
 * - One bunny at a time. After one dives back in, the next either pops out right
 *   away (sometimes) or comes 9–15 s later.
 * - It always travels on a ~45° diagonal: away from the viewer (we see its
 *   back and fluffy tail) or toward the viewer (we see its face), to the
 *   left or right. Never straight at/away from the camera or straight across.
 * - Each hop: it bursts out of the flowers, arcs, and dives back in; it then
 *   pops out again a little further along, so it "swims" through the field.
 * - Each exit and entry kicks up a faint spray of tiny flowers, grass
 *   blades and leaves (kept soft so it never pulls focus).
 * - Smaller when farther away, larger when closer, and never big.
 *
 * Coordinates are in the video's own pixels (1924 x 1076) and mapped with
 * the same math as `object-fit: cover`. No dependencies.
 */

export type Vec = [number, number];

export interface MeadowBunniesOptions {
  canvas: HTMLCanvasElement;
  videoSize?: { width: number; height: number };
  objectPosition?: { x: number; y: number };
  /** Outline of the foreground flower field (video px). Bunnies stay inside. */
  field?: Vec[];
  /** Depth range: feet y at the back and front of the field, with sizes (video px per sprite px). */
  depth?: { farY: number; nearY: number; farScale: number; nearScale: number };
  /** Seconds before the first bunny, [min, max] (default [9, 15]). */
  firstAfter?: [number, number];
  /** Seconds between bunnies, [min, max] (default [9, 15]). */
  every?: [number, number];
  /** Chance (0–1) that the next bunny pops out right after the last one instead (default 0.35). */
  againChance?: number;
  /** Draw the field outline. */
  debug?: boolean;
}

export interface MeadowBunnies {
  /** Start a bunny right away (if none is out). */
  hopNow(): void;
  destroy(): void;
}

/* ----------------------------------------------------------------------- */
/* Art (24 x 24 frames, same style as the piglets)                          */
/* back*: 3/4 from behind, heading up-right · front*: 3/4 from the front,   */
/* heading down-right. Mirrored for the left-hand diagonals.                */
/* ----------------------------------------------------------------------- */

const FRAMES: Record<string, string[]> = {
  backA: [
    "............OLLO.OLLO...",
    "...........OLFFOOLFFO...",
    "............OLFLOLFMO...",
    "............OLFFLFFSO...",
    "............OSFFFFFO....",
    ".............OLFFFFO....",
    "............OLFFFFFO....",
    "...........OLFFFFFFLO...",
    "...........OMFFFFFFMO...",
    ".........OOOMFFFFFMSO...",
    ".......OOLLLMFFMMMSO....",
    "......OLLFFFFMMSSSO.....",
    ".....OLFFFFFFFMOOO......",
    "....OLFFFFFFFFFO........",
    "....OLFFFFFFFFMO........",
    "...OWWFFFFFFFMSO........",
    "..OWWWWFFFFFMSO.........",
    "..OWWWWFFFMMSO..........",
    ".OLWWWWMMMSSO...........",
    ".OSMWWFSSSOO............",
    "..OSMMMOOO..............",
    "...OSSSLO...............",
    "....OOOO................",
    "........................"
  ],
  backB: [
    "..............OO....O...",
    ".............OLLO..OLO..",
    ".............OLFO.OLFO..",
    ".............OLFLOLFFO..",
    ".............OLFFOLFMO..",
    ".............OLFFLFMSO..",
    ".............OLFFFFSO...",
    ".............OLFFFFO....",
    "............OLFFFFFLO...",
    ".........OOOOMFFFFFFLO..",
    ".......OOLLLMMFFFFFFSO..",
    "......OLLFFFFMFFFFFFO...",
    ".....OLFFFFFFMMFMMMFO...",
    "....OLFFFFFFFFMMMSSFLO..",
    "...OWWFFFFFFFFFMOOOLFLO.",
    "..OWWWWFFFFFFFMSO.OSMFO.",
    "..OWWWWFFFFFFMSO...OSMO.",
    "..OWWWWFFFMMMSO.....OSO.",
    "...OWWMMMMSSSO.......O..",
    "....OSSSSSOOO...........",
    ".....OOOOO..............",
    "........................",
    "........................",
    "........................"
  ],
  frontA: [
    "........................",
    ".........O....O.........",
    "........OLO..OLO........",
    "........OLPOOLPO........",
    ".OOOO...OSPLOLPLO.......",
    "OLLLLOOOOOPPLFPFO.......",
    ".OSFFLLLLLFPFFPPO.......",
    "..OLFFFFFFFFPFPPLO......",
    "..OWWFFFFFFFFFFPSO......",
    ".OWWWFFFFFFFFFFFO.......",
    ".OWWWFFFFFFFFFFFO.......",
    "..OOOLFFFFFFFMMMLOO.....",
    "....OSMMFFFFMMFFFLLO....",
    ".....OSSMMFMMFFFFFFO....",
    "......OOSSMMFEFFFEFLO...",
    "........OOSMFEFFFEFMO...",
    "..........OOCFFNFFCSO...",
    "...........OSMWWWFSO....",
    "............OSSSFFOLO...",
    ".............OOOLFLMLO..",
    "...............OLMSSSO..",
    "...............OSSOOO...",
    "................OO......",
    "........................"
  ],
  frontB: [
    "..........O....O........",
    ".........OLO..OLO.......",
    ".........OLLOOLPLO......",
    ".........OLPLOLPFO......",
    ".........OSPPLFPFO......",
    "..........OLPFFPFO......",
    "......OOOOOLPFMPFO......",
    "...OOOLLLLLFFFSPMO......",
    "..OLLLFFFFFFFFOLSO......",
    "..OWWFFFFFFFFFLFO.......",
    "..OWWWFFFFFFFMMMLOO.....",
    "..OWWWFFFFFFMMFFFLLO....",
    "...OOLFFFFFMMFFFFFFLO...",
    "....OSMMFFFMFEFFFEFFO...",
    ".....OSSMMMMFEFFFEFMO...",
    "......OOSSSSCFFNFFCSO...",
    "........OOOOSMWWWMSO....",
    "............OSSSFSOLO...",
    ".............OOOLOLFO...",
    "..............OLMLSMO...",
    "..............OSSSOSO...",
    "...............OOO.O....",
    "........................",
    "........................"
  ]
};

const PALETTE: Record<string, string> = {
  O: "#2b1a22", F: "#e6d2bd", L: "#f7ebde", M: "#d4bba3", S: "#b0937b",
  W: "#fffaf3", P: "#f2a7a8", E: "#281717", N: "#e07f87", C: "#f4b9b4",
};
const UP = 4, SPR = 24;

type Sprite = HTMLCanvasElement;
function bake(grid: string[]): Sprite {
  const c = document.createElement("canvas");
  c.width = grid[0].length * UP; c.height = grid.length * UP;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const col = PALETTE[grid[y][x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * UP, y * UP, UP, UP);
    }
  }
  return c;
}
let sprites: Record<string, Sprite> | null = null;
const getSprites = () => (sprites ??= Object.fromEntries(Object.entries(FRAMES).map(([k, g]) => [k, bake(g)])));

/* ----------------------------------------------------------------------- */
/* Defaults tuned to the cherry-blossom meadow video (1924 x 1076)          */
/* ----------------------------------------------------------------------- */

// The strip of small flowers between the pond and the big close-up flowers (which start
// around y 880–900), so the bunnies never seem to hop *inside* the nearest blooms.
export const DEFAULT_FIELD: Vec[] = [
  [60, 772], [300, 785], [550, 795], [700, 797], [1250, 795], [1500, 785], [1860, 772],
  [1860, 862], [1500, 880], [400, 880], [60, 862],
];
export const DEFAULT_DEPTH = { farY: 790, nearY: 880, farScale: 1.25, nearScale: 1.7 };

/* ----------------------------------------------------------------------- */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const FLOWER_TOP = 9;        // sprite px of flowers the bunny hides behind
const PETAL_COLORS = ["#f7a6c1", "#fff2f5", "#f5c2d6", "#fbe3ec"];
const GREEN_COLORS = ["#8fc36a", "#74a957", "#a5d17e"];
const BIT_ALPHA = 0.7;       // peak opacity of the spray: present, never loud
function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }

function inside(poly: Vec[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

interface Hop { a: Vec; b: Vec; dur: number; gapAfter: number }
interface Bunny { hops: Hop[]; i: number; t: number; toward: boolean; side: 1 | -1; puffedOut: boolean; puffedIn: boolean }
type BitKind = "flower" | "blade" | "leaf";
/** One piece of the spray. Sizes are in video px; `bend` curls a grass blade. */
interface Bit { kind: BitKind; x: number; y: number; vx: number; vy: number; g: number; age: number; life: number; color: string; size: number; spin: number; rot: number; bend: number }

export function createMeadowBunnies(opts: MeadowBunniesOptions): MeadowBunnies {
  const canvas = opts.canvas;
  const ctx = canvas.getContext("2d")!;
  const VW = opts.videoSize?.width ?? 1924, VH = opts.videoSize?.height ?? 1076;
  const pos = opts.objectPosition ?? { x: 0.5, y: 0.5 };
  const field = opts.field ?? DEFAULT_FIELD;
  const depth = opts.depth ?? DEFAULT_DEPTH;
  const every = opts.every ?? [9, 15];
  const againChance = opts.againChance ?? 0.35;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  const scaleAt = (y: number) => {
    const k = Math.max(0, Math.min(1, (y - depth.farY) / (depth.nearY - depth.farY)));
    return depth.farScale + (depth.nearScale - depth.farScale) * k;
  };

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
  const visibleX = () => [-ox / cs, (cssW - ox) / cs] as const;

  let bunny: Bunny | null = null;
  const bits: Bit[] = [];
  let next = rand(...(opts.firstAfter ?? [9, 15]));

  /** Plan a 2–4 hop run on a diagonal that stays inside the field (and on screen). */
  function plan(): Bunny | null {
    const [vx0, vx1] = visibleX();
    for (let attempt = 0; attempt < 40; attempt++) {
      const toward = Math.random() < 0.5;
      const side: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const n = attempt < 20 ? 2 + Math.floor(Math.random() * 3) : 2;
      let p: Vec = [rand(Math.max(80, vx0 + 40), Math.min(1840, vx1 - 40)), rand(depth.farY + 6, depth.nearY - 10)];
      const hops: Hop[] = [];
      let ok = true;
      for (let i = 0; i < n && ok; i++) {
        const s = scaleAt(p[1]);
        // A diagonal on the ground, toward or away from the viewer. Depth looks compressed
        // on screen, and the flower strip is shallow, so dy is about a third of dx.
        const dx = side * 46 * s, dy = (toward ? 1 : -1) * 16 * s;
        const b: Vec = [p[0] + dx, p[1] + dy];
        hops.push({ a: p, b, dur: 0.92 + 0.18 * s, gapAfter: rand(0.35, 0.85) });
        p = [b[0] + dx * 0.4, b[1] + dy * 0.4]; // resurfaces a little further on
        for (const q of [hops[i].a, hops[i].b]) {
          if (!inside(field, q[0], q[1]) || q[1] < depth.farY || q[1] > depth.nearY || q[0] < vx0 + 20 || q[0] > vx1 - 20) ok = false;
        }
      }
      if (ok) return { hops, i: 0, t: 0, toward, side, puffedOut: false, puffedIn: false };
    }
    return null;
  }

  /** A spray of flowers, grass and leaves where the bunny breaks the surface. `dx` leans it along the hop. */
  function puff(x: number, y: number, s: number, dx: number, strength: number) {
    const n = Math.round(11 * strength);
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      const kind: BitKind = r < 0.35 ? "flower" : r < 0.75 ? "blade" : "leaf";
      bits.push({
        kind, x: x + rand(-7, 7) * s, y: y + rand(-2, 2) * s,
        vx: rand(-26, 26) * s + dx * 0.5, vy: rand(-85, -45) * s * strength, g: 150 * s,
        age: 0, life: rand(0.6, 0.95),
        color: kind === "flower" ? pick(PETAL_COLORS) : pick(GREEN_COLORS),
        size: (kind === "flower" ? rand(2.2, 3.2) : kind === "blade" ? rand(5, 7.5) : rand(3, 4.2)) * s,
        spin: rand(-7, 7), rot: rand(0, Math.PI * 2), bend: rand(-0.5, 0.5),
      });
    }
  }

  function drawBit(b: Bit) {
    const z = b.size * cs * dpr; // device px
    ctx.fillStyle = b.color;
    ctx.strokeStyle = b.color;
    if (b.kind === "flower") {
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * z * 0.55, Math.sin(a) * z * 0.55, z * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f6d77a";
      ctx.beginPath(); ctx.arc(0, 0, z * 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (b.kind === "blade") {
      ctx.lineWidth = Math.max(1, z * 0.16);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, z / 2);
      ctx.quadraticCurveTo(b.bend * z, 0, b.bend * z * 0.6, -z / 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, z * 0.6, z * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function update(dt: number) {
    if (!bunny) {
      if (reduced) return;
      next -= dt;
      if (next <= 0) { bunny = plan(); next = Math.random() < againChance ? 0 : rand(every[0], every[1]); }
    } else {
      const h = bunny.hops[bunny.i];
      bunny.t += dt;
      const k = bunny.t / h.dur;
      if (!bunny.puffedOut && k >= 0.1) { const s = scaleAt(h.a[1]); puff(h.a[0] + (h.b[0] - h.a[0]) * 0.1, h.a[1] + (h.b[1] - h.a[1]) * 0.1 - FLOWER_TOP * s, s, h.b[0] - h.a[0], 1); bunny.puffedOut = true; }
      if (!bunny.puffedIn && k >= 0.9) { const s = scaleAt(h.b[1]); puff(h.a[0] + (h.b[0] - h.a[0]) * 0.9, h.a[1] + (h.b[1] - h.a[1]) * 0.9 - FLOWER_TOP * s, s, h.b[0] - h.a[0], 0.7); bunny.puffedIn = true; }
      if (bunny.t > h.dur + h.gapAfter) {
        bunny.i++; bunny.t = 0; bunny.puffedOut = bunny.puffedIn = false;
        if (bunny.i >= bunny.hops.length) bunny = null;
      }
    }
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.age += dt; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.spin * dt;
      if (b.age > b.life) bits.splice(i, 1);
    }
  }

  // Scratch canvas for fading the bunny's lower body into the flowers.
  const tmp = document.createElement("canvas");
  const tctx = tmp.getContext("2d")!;

  function drawBunny(b: Bunny) {
    const h = b.hops[b.i];
    const k = b.t / h.dur;
    if (k >= 1) return; // underground between hops
    const S = getSprites();
    const gx = h.a[0] + (h.b[0] - h.a[0]) * k, gy = h.a[1] + (h.b[1] - h.a[1]) * k;
    const s = scaleAt(gy);
    const u = s * cs * dpr;                       // device px per sprite px
    const size = SPR * u;
    const sink = (SPR - FLOWER_TOP + 1) * u, peak = 19 * u; // higher arc to match the longer hang time
    const ground = toY(gy);
    const feet = ground + sink - (sink + peak) * Math.sin(Math.PI * k);
    const clipY = ground - FLOWER_TOP * u;         // flower tops
    const img = S[(b.toward ? "front" : "back") + (k < 0.5 ? "A" : "B")];

    const tw = Math.ceil(size) + 2, th = Math.ceil(size) + 2;
    if (tmp.width !== tw || tmp.height !== th) { tmp.width = tw; tmp.height = th; }
    tctx.clearRect(0, 0, tw, th);
    tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = "high";
    tctx.save();
    tctx.translate(tw / 2, 0); tctx.scale(b.side, 1);
    tctx.drawImage(img, -size / 2, 1, size, size);
    tctx.restore();
    // Soft fade where the body meets the flower tops.
    const top = feet - size - 1;
    const cl = clipY - top, fade = 3 * u;
    tctx.globalCompositeOperation = "destination-in";
    const g = tctx.createLinearGradient(0, cl - fade, 0, cl + fade * 0.4);
    g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
    tctx.fillStyle = g; tctx.fillRect(0, 0, tw, th);
    tctx.globalCompositeOperation = "source-over";
    ctx.drawImage(tmp, toX(gx) - tw / 2, top);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bunny) drawBunny(bunny);
    for (const b of bits) {
      const k = b.age / b.life;
      ctx.save();
      ctx.globalAlpha = BIT_ALPHA * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
      ctx.translate(toX(b.x), toY(b.y)); ctx.rotate(b.rot);
      drawBit(b);
      ctx.restore();
    }
    if (opts.debug) {
      ctx.strokeStyle = "#00ffaa"; ctx.lineWidth = 2; ctx.beginPath();
      field.forEach(([x, y], i) => (i ? ctx.lineTo(toX(x), toY(y)) : ctx.moveTo(toX(x), toY(y))));
      ctx.closePath(); ctx.stroke();
    }
  }

  let raf = 0, last = 0, running = false, onScreen = true;
  function frame(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;
    update(dt); draw();
    if (running) raf = requestAnimationFrame(frame);
  }
  function start() { if (running || document.hidden || !onScreen) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const ro = new ResizeObserver(() => { measure(); if (!running) draw(); });
  ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; if (onScreen) start(); else stop(); });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  measure(); start();

  return {
    hopNow() { if (!bunny && !reduced) bunny = plan(); },
    destroy() { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); },
  };
}
