// Faint outline icons in the backgrounds of the content sections, in the same style as the social
// icons (lucide's 24-unit grid, 1.75 strokes, round caps). Because the strokes scale with the icon,
// a 4-6rem doodle gets a soft, chunky line instead of a thin sketchy one. Purely decorative.
//
// Each section has a ready-made layer (ExperiencesDoodles, MusicDoodles, ...). Put it as the first
// child inside that section's <Section>. The section needs `isolate` (see Section.tsx) so the
// doodles can sit behind the content without disappearing behind the page background.
//
// Large screens (lg, 1024px+): each doodle is placed against the content column, in the open
// space beside the text. Smaller screens: there isn't room beside the text, so a section's doodles
// sit in a row to the right of its title instead: pass the matching *TitleDoodles component to
// <Section titleDoodles={...}>.
import type { ReactNode, SVGProps } from "react";
import { MessageCircleHeart, Music2, PartyPopper, Plane, Stethoscope } from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;
const stroke = 1.75;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: stroke,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

/* ----------------------------------------------------------------------- */
/* Custom icons (drawn on lucide's grid)                                    */
/* ----------------------------------------------------------------------- */

/**
 * lucide's grand piano, with a proper keyboard: one octave, C to B, seven white keys and five
 * black keys in their groups of two and three (12 notes). The keys use a finer line so they fit.
 */
export function GrandPianoIcon(props: IconProps) {
  const x = (k: number) => 2 + (20 / 7) * k; // white key dividers: seven keys across 20 units
  const blacks = [1, 2, 4, 5, 6]; // C#, D#, F#, G#, A# sit on these dividers
  return (
    <svg {...base} {...props}>
      <path d="M22 11.5A3.5 3.5 0 0018.5 8a3.52 3.52 0 01-3.173-2A7 7 0 002 9v10a2 2 0 002 2h16a2 2 0 002-2z" />
      {/* the keyboard sits a little higher than lucide's so there's room for proper black keys */}
      <path d="M2 11.5h20" />
      <g strokeWidth={1.1}>
        {[1, 2, 3, 4, 5, 6].map((k) => (
          <path key={k} d={`M${x(k)} ${blacks.includes(k) ? 17.3 : 11.5}V21`} />
        ))}
      </g>
      {blacks.map((k) => (
        <rect key={k} x={x(k) - 0.85} y="11.5" width="1.7" height="5.8" rx="0.35" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

/** Two beamed sixteenth notes (lucide's music-4) with filled note heads. */
export function SixteenthNotesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18V5l12-2v13" />
      <path d="m9 9 12-2" />
      <circle cx="6" cy="18" r="3" fill="currentColor" />
      <circle cx="18" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

/** A paw print on the 24 grid, toes up. */
function PawShape() {
  return (
    <>
      <path d="M6.6 18.4c0-3.4 2.4-6.2 5.4-6.2s5.4 2.8 5.4 6.2c0 2.2-2.3 3.4-5.4 3.4s-5.4-1.2-5.4-3.4z" />
      <ellipse cx="3.2" cy="10" rx="2" ry="2.5" transform="rotate(-28 3.2 10)" />
      <ellipse cx="8.1" cy="4.1" rx="2.1" ry="2.7" transform="rotate(-10 8.1 4.1)" />
      <ellipse cx="15.9" cy="4.1" rx="2.1" ry="2.7" transform="rotate(10 15.9 4.1)" />
      <ellipse cx="20.8" cy="10" rx="2" ry="2.5" transform="rotate(28 20.8 10)" />
    </>
  );
}

/**
 * A trail of paw prints walking up and to the right, the way a real trail looks: evenly spaced,
 * stepping alternately left and right of the line, every print pointing the way it's walking.
 */
export function PawTrailIcon(props: IconProps) {
  const from = [14, 70], to = [110, 16];
  const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy);
  const turn = (Math.atan2(dx, -dy) * 180) / Math.PI; // from "toes up" to the walking direction
  const side = [-dy / len, dx / len]; // perpendicular to the walking line
  const prints = [0, 1, 2, 3].map((i) => {
    const t = i / 3, off = i % 2 ? 6 : -6;
    return [from[0] + dx * t + side[0] * off, from[1] + dy * t + side[1] * off];
  });
  return (
    <svg {...base} viewBox="0 0 124 86" strokeWidth={2.4} {...props}>
      {prints.map(([px, py], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${turn}) translate(-12 -12)`}>
          <PawShape />
        </g>
      ))}
    </svg>
  );
}

/** A folded treasure map with a dashed trail to X marks the spot. */
export function TreasureMapIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="0 0 32 24" {...props}>
      <path d="M2 5.5 10 3l12 2.5L30 3v15.5L22 21l-12-2.5L2 21z" />
      <path d="M10 3v15.5M22 5.5V21" opacity={0.55} />
      <path d="M5 16.5c2.5-.5 3-3.5 6-4s5 1.5 8 .5 2.5-2 4-2.5" strokeDasharray="0.1 2.6" />
      <path d="M24.6 8.6l2.8 2.8M27.4 8.6l-2.8 2.8" />
    </svg>
  );
}

/**
 * The RUPA (Rutgers University Programming Association) logo, redrawn in the doodle style: the
 * letters r-u-p-a as strokes, the r and p in tilted cut-out frames like the original, and the
 * name running round in a ring.
 */
export function RupaLogoIcon(props: IconProps) {
  const ring = { fill: "currentColor", stroke: "none", fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 3.7, letterSpacing: 0.3 };
  return (
    <svg {...base} viewBox="0 0 64 60" strokeWidth={2.6} {...props}>
      <defs>
        <path id="rupa-top" d="M8.5 30a23.5 23.5 0 0 1 47 0" />
        <path id="rupa-bottom" d="M5.5 30a26.5 26.5 0 0 0 53 0" />
      </defs>
      <text {...ring}><textPath href="#rupa-top" startOffset="50%" textAnchor="middle">RUTGERS UNIVERSITY</textPath></text>
      <text {...ring}><textPath href="#rupa-bottom" startOffset="50%" textAnchor="middle">PROGRAMMING ASSOCIATION</textPath></text>
      <g transform="translate(2 2)">
      {/* r, in a frame tilted left */}
      <path d="M3.6 19.2 17.4 17.8 18.4 35.6 4.6 36.8z" strokeWidth={2} />
      <path d="M9.5 23.2v9M9.5 26.6c0-2.4 2-3.8 5-3.4" />
      {/* u */}
      <path d="M21.2 23.2v5a3.4 3.4 0 0 0 6.8 0v-5M28 28.2v4" />
      {/* p, in a taller frame tilted right */}
      <path d="M31.6 15 42.6 16.4 41 41.2 30 39.8z" strokeWidth={2} />
      <path d="M34.4 23.2v14.4" />
      <ellipse cx="37.4" cy="27.6" rx="3" ry="4.4" />
      {/* a */}
      <circle cx="48.4" cy="28.4" r="3.6" />
      <path d="M52 24.4v7.8" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Layout helpers                                                           */
/* ----------------------------------------------------------------------- */

/** The layer behind a section's content. Faded as a whole (not per line) so crossing lines don't darken. */
function Layer({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none text-plum opacity-[0.15]">
      {children}
    </div>
  );
}

/**
 * Large screens only: a box exactly over the section's content column (same padding and max
 * width as <Section>), so doodles can be placed relative to the text they sit beside.
 */
function Wide({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 hidden px-5 py-20 sm:px-8 md:py-28 lg:block">
      <div className="relative mx-auto h-full max-w-6xl">{children}</div>
    </div>
  );
}

/** One doodle: `at` places and sizes it (Tailwind classes), `tilt` turns it a little. */
function Spot({ at, tilt = 0, children }: { at: string; tilt?: number; children: ReactNode }) {
  return (
    <div className={`absolute ${at}`} style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}>
      {children}
    </div>
  );
}

/**
 * One doodle beside a section title (smaller screens). A fixed size, so it never gets tiny;
 * wide ones (the paw trail, the map) take a wider box at the same height. `tilt` turns it in
 * place (the spacing is unaffected); the sets below alternate left and right.
 */
function TitleBit({ wide = false, tilt = 0, children }: { wide?: boolean; tilt?: number; children: ReactNode }) {
  return (
    <div
      className={`h-10 shrink-0 md:h-14 ${wide ? "w-12 md:w-20" : "w-10 md:w-14"}`}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      {children}
    </div>
  );
}

const LEFT = -30, RIGHT = 30; // degrees, for the title doodles

const fill = "block h-full w-full";

/* ----------------------------------------------------------------------- */
/* One layer per section                                                    */
/* ----------------------------------------------------------------------- */

/** Path to vet school: a paw trail walking up and away from the heading, a stethoscope beyond it. */
export function ExperiencesDoodles() {
  return (
    <Layer>
      <Wide>
        {/* starting just right of the heading and walking up and away from it */}
        <Spot at="left-[27rem] -top-[6.5rem] h-[15.5rem] w-[22.5rem]">
          <PawTrailIcon className={fill} />
        </Spot>
        <Spot at="right-0 top-[4.5rem] h-32 w-32" tilt={14}>
          <Stethoscope strokeWidth={stroke} className={fill} />
        </Spot>
      </Wide>
    </Layer>
  );
}

/** Music: big sixteenth notes by the heading, the grand piano at the left edge above "On repeat"
 *  (the eighth note is MusicNoteAccent). */
export function MusicDoodles() {
  return (
    <Layer>
      <Wide>
        <Spot at="right-[3%] -top-10 h-40 w-40" tilt={8}>
          <SixteenthNotesIcon className={fill} />
        </Spot>
      </Wide>
      {/* where it was before: against the left edge of the screen, just above "On repeat" */}
      <Spot at="hidden lg:block left-[0.5%] top-[48%] h-36 w-36 xl:left-[3%]" tilt={-8}>
        <GrandPianoIcon className={fill} />
      </Spot>
    </Layer>
  );
}

/** A single eighth note for just below "What I play" on large screens. Put it in the text column. */
export function MusicNoteAccent() {
  return (
    <div aria-hidden className="pointer-events-none mt-10 hidden h-24 w-24 select-none text-plum opacity-[0.15] lg:ml-[38%] lg:block" style={{ transform: "rotate(-10deg)" }}>
      <Music2 strokeWidth={stroke} className={fill} />
    </div>
  );
}

/** Postcards: a paper plane up top, a treasure map beside the wishlist. */
export function TravelDoodles() {
  return (
    <Layer>
      <Wide>
        <Spot at="right-[3%] -top-8 h-32 w-32" tilt={-6}>
          <Plane strokeWidth={stroke} className={fill} />
        </Spot>
        <Spot at="right-[8%] -bottom-4 h-40 w-56" tilt={-4}>
          <TreasureMapIcon className={fill} />
        </Spot>
      </Wide>
    </Layer>
  );
}

/** Leadership: the RUPA logo beside the role, a party popper in the space below the cards. */
export function LeadershipDoodles() {
  return (
    <Layer>
      <Wide>
        <Spot at="right-0 -top-4 h-48 w-52 xl:right-[3%]" tilt={-6}>
          <RupaLogoIcon className={fill} />
        </Spot>
        {/* well below the cards, toward the bottom of the gap before the next section */}
        <Spot at="left-0 -bottom-[8.5rem] h-24 w-24" tilt={-8}>
          <PartyPopper strokeWidth={stroke} className={fill} />
        </Spot>
      </Wide>
    </Layer>
  );
}

/** Let's talk: a chat bubble with a heart beside the invitation. */
export function ContactDoodles() {
  return (
    <Layer>
      <Spot at="right-[3%] top-10 h-28 w-28 md:right-[12%] md:top-14 md:h-48 md:w-48" tilt={8}>
        <MessageCircleHeart strokeWidth={stroke} className={fill} />
      </Spot>
    </Layer>
  );
}

/* ----------------------------------------------------------------------- */
/* Beside the section titles (smaller screens)                              */
/* ----------------------------------------------------------------------- */

export function ExperiencesTitleDoodles() {
  return (
    <>
      <TitleBit wide tilt={LEFT}><PawTrailIcon className={fill} /></TitleBit>
      <TitleBit tilt={RIGHT}><Stethoscope strokeWidth={stroke} className={fill} /></TitleBit>
    </>
  );
}

export function MusicTitleDoodles() {
  return (
    <>
      <TitleBit tilt={LEFT}><Music2 strokeWidth={stroke} className={fill} /></TitleBit>
      <TitleBit tilt={RIGHT}><GrandPianoIcon className={fill} /></TitleBit>
      <TitleBit tilt={LEFT}><SixteenthNotesIcon className={fill} /></TitleBit>
    </>
  );
}

export function TravelTitleDoodles() {
  return (
    <>
      {/* turned well left, so its nose points up-left, away from the way the map leans */}
      <TitleBit tilt={-75}><Plane strokeWidth={stroke} className={fill} /></TitleBit>
      <TitleBit wide tilt={RIGHT}><TreasureMapIcon className={fill} /></TitleBit>
    </>
  );
}

export function LeadershipTitleDoodles() {
  return (
    <>
      <TitleBit tilt={LEFT}><RupaLogoIcon className={fill} /></TitleBit>
      <TitleBit><PartyPopper strokeWidth={stroke} className={fill} /></TitleBit>
    </>
  );
}
