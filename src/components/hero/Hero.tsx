import { Fragment, useRef } from "react";
import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import MeadowPiglets from "@/components/MeadowPiglets.tsx";
import MeadowBunnies from "@/components/MeadowBunnies.tsx";
import MeadowHorses from "@/components/MeadowHorses.tsx";
import {
  DEFAULT_ZONES,
  type MeadowPiglets as PigletsApi,
  type PigletZone,
} from "@/components/meadowPiglets";
import { useBoops } from "@/hooks/useBoops";
import { BlurText } from "@/components/ui/BlurText";
import { BackgroundVideo } from "@/components/hero/BackgroundVideo";
import { HeroPill } from "@/components/hero/HeroPill";
import { easterEggs, site } from "@/content/site";
import { blurIn } from "@/lib/motion";
import { scrollToId } from "@/lib/scroll";

const tint =
  "linear-gradient(180deg, rgba(120,90,170,0.12), transparent 30%, transparent 70%, rgba(90,60,140,0.16))";

// The default far-left hilltop line runs along the skyline, so that piglet looked like it
// was floating. Drop it ~15 video px down the slope so it stands on the grass.
const pigletZones: PigletZone[] = DEFAULT_ZONES.map((zone, i) =>
  i === 0 ? { ...zone, from: [555, 466], to: [630, 478] } : zone,
);

export function Hero() {
  const roles = site.roles.split("·").map((r) => r.trim());
  const pigletsApi = useRef<PigletsApi | null>(null);
  // Every 50th boop (from any piglet on the page) sends a special piggy across the sky.
  const boop = useBoops((total) => pigletsApi.current?.summonFlyer(easterEggs.milestoneFlyer(total)));

  return (
    <section
      id="top"
      className="relative isolate flex h-[100svh] min-h-[600px] flex-col overflow-hidden"
    >
      {/* Background layers. Only real links and buttons above the video take pointer events,
          so clicks on the meadow reach the piglets. */}
      <BackgroundVideo src={site.video} still={site.videoStill} className="-z-40" />
      <MeadowHorses className="-z-30" />
      <MeadowPiglets
        className="-z-30"
        apiRef={pigletsApi}
        zones={pigletZones}
        easterEggClicks={22}
        easterEggCooldown={60}
        onPigletClick={boop}
      />
      <MeadowBunnies className="-z-30" />
      <div className="pointer-events-none absolute inset-0 -z-20" style={{ background: tint }} />

      <div className="pointer-events-none flex flex-1 items-center justify-center px-4 pt-20 text-center">
        <div className="text-halo relative isolate flex max-w-[40rem] flex-col items-center gap-3.5">
          <BlurText
            as="h1"
            text={`Hi, I'm ${site.firstName}`}
            delay={100}
            className="glow-heading justify-center font-heading text-[clamp(3.4rem,9vw,6.4rem)] italic leading-[0.9] tracking-[-0.035em] text-ink"
          />

          <motion.p
            {...blurIn(0.8)}
            className="glow-soft font-body text-base font-medium tracking-[0.06em] text-ink-soft md:text-lg"
          >
            {roles.map((role, i) => (
              <Fragment key={role}>
                {i > 0 && <span className="text-lilac"> · </span>}
                {role}
              </Fragment>
            ))}
          </motion.p>

          <motion.p
            {...blurIn(0.95)}
            className="text-backdrop glow-soft max-w-[34rem] rounded-[26px] px-5 py-3 text-sm font-light leading-snug text-ink md:text-base"
          >
            {site.intro}
          </motion.p>

          <motion.div {...blurIn(1.1)} data-boop-above className="flex justify-center">
            <button
              type="button"
              onClick={() => scrollToId("about")}
              className="liquid-glass-strong pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.03]"
            >
              Get to know me
              <ArrowDown className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>

      <HeroPill />
    </section>
  );
}
