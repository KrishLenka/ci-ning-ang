// Faint outline icons in the backgrounds of the content sections, in the same style as the social
// icons (lucide's 24-unit grid, 1.75 strokes, round caps). Because the strokes scale with the icon,
// a 4-6rem doodle gets a soft, chunky line instead of a thin sketchy one. Purely decorative.
//
// Each section has a ready-made layer (ExperiencesDoodles, MusicDoodles, ...). Put it as the first
// child inside that section's <Section>. The section needs `isolate` (see Section.tsx) so the
// doodles can sit behind the content without disappearing behind the page background.
import type { ReactNode, SVGProps } from "react";
import {
  Compass, MessageCircleHeart, Music, Music4, PartyPopper, PawPrint, Piano, Plane, Stethoscope, Ticket,
} from "lucide-react";

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

/** One doodle: `at` places and sizes it (Tailwind classes), `tilt` turns it a little. */
function Spot({ at, tilt = 0, children }: { at: string; tilt?: number; children: ReactNode }) {
  return (
    <div className={`absolute ${at}`} style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}>
      {children}
    </div>
  );
}

const fill = "block h-full w-full";

/** Three paw prints walking upward: toes turned ~45 degrees left, then right, then left. */
function PawTrail({ at }: { at: string }) {
  // lucide's paw already points ~45 degrees right, so "right" is 0 and "left" is -90
  const steps: [number, number, number][] = [[4, 66, -90], [46, 34, 0], [4, 2, -90]]; // x %, y %, turn
  return (
    <div className={`absolute ${at}`}>
      {steps.map(([x, y, turn], i) => (
        <PawPrint
          key={i}
          strokeWidth={stroke}
          className="absolute h-[32%] w-[50%]"
          style={{ left: `${x}%`, top: `${y}%`, transform: `rotate(${turn}deg)` }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* One layer per section                                                    */
/* ----------------------------------------------------------------------- */

/** Path to vet school: paw tracks beside the heading, a stethoscope lower down. */
export function ExperiencesDoodles() {
  return (
    <Layer>
      <PawTrail at="right-[2%] top-0 h-32 w-24 md:right-[7%] md:top-6 md:h-80 md:w-56" />
      <Spot at="hidden md:block left-[1%] top-[44%] h-36 w-36 xl:left-[3%]" tilt={-12}>
        <Stethoscope strokeWidth={stroke} className={fill} />
      </Spot>
    </Layer>
  );
}

/** Music: notes beside the heading, a little piano and a stray note further down. */
export function MusicDoodles() {
  return (
    <Layer>
      <Spot at="right-[3%] top-8 h-28 w-28 md:right-[9%] md:top-12 md:h-44 md:w-44" tilt={8}>
        <Music strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="hidden md:block right-[2%] top-60 h-16 w-16" tilt={-10}>
        <Music4 strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="hidden md:block left-[0.5%] top-[48%] h-36 w-36 xl:left-[3%]" tilt={-8}>
        <Piano strokeWidth={stroke} className={fill} />
      </Spot>
    </Layer>
  );
}

/** Postcards: a paper plane up top, a treasure map filling the space beside the wishlist. */
export function TravelDoodles() {
  return (
    <Layer>
      <Spot at="right-[3%] top-8 h-24 w-24 md:right-[9%] md:top-12 md:h-36 md:w-36" tilt={-6}>
        <Plane strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="hidden lg:block left-[0.5%] top-[38%] h-28 w-28 xl:left-[3%]" tilt={12}>
        <Compass strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="right-[2%] bottom-2 h-32 w-44 md:left-[44%] md:right-auto md:bottom-4 md:h-52 md:w-72" tilt={-4}>
        <TreasureMapIcon className={fill} />
      </Spot>
    </Layer>
  );
}

/** Leadership: the RUPA logo beside the role (desktop), a party popper and a ticket. */
export function LeadershipDoodles() {
  return (
    <Layer>
      {/* phones: the party popper takes the top corner; from md up the RUPA logo does */}
      <Spot at="right-[3%] top-8 h-28 w-28 md:hidden" tilt={-8}>
        <PartyPopper strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="hidden md:block right-[3%] top-20 h-52 w-56 xl:right-[7%]" tilt={-6}>
        <RupaLogoIcon className={fill} />
      </Spot>
      <Spot at="hidden md:block left-[0.5%] top-[34%] h-28 w-28 xl:left-[3%]" tilt={-18}>
        <Ticket strokeWidth={stroke} className={fill} />
      </Spot>
      <Spot at="hidden md:block left-[0.5%] bottom-6 h-32 w-32 xl:left-[3%]" tilt={-8}>
        <PartyPopper strokeWidth={stroke} className={fill} />
      </Spot>
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
