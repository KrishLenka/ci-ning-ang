import { motion } from "motion/react";
import { ArrowDown, BookOpen } from "lucide-react";
import { BlurText } from "@/components/ui/BlurText";
import { BackgroundVideo } from "@/components/hero/BackgroundVideo";
import { Favorites } from "@/components/hero/Favorites";
import { site } from "@/content/site";
import { blurIn } from "@/lib/motion";
import { scrollToId } from "@/lib/scroll";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <BackgroundVideo src={site.video} />

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <motion.div
            {...blurIn(0)}
            className="liquid-glass mb-6 flex items-center gap-2 rounded-full px-1 py-1"
          >
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
              Now
            </span>
            <span className="pr-3 text-sm text-foreground/90">{site.status}</span>
          </motion.div>

          <BlurText
            as="h1"
            text={`Hi, I'm ${site.firstName}`}
            delay={100}
            className="justify-center font-heading text-6xl italic leading-[0.85] tracking-[-3px] text-foreground md:text-7xl lg:text-[6rem]"
          />

          <motion.p
            {...blurIn(0.8)}
            className="mt-4 font-body text-base font-light tracking-wide text-white/95 md:text-lg"
          >
            {site.roles}
          </motion.p>

          <motion.p
            {...blurIn(0.95)}
            className="mt-2 max-w-xl text-sm font-light leading-snug text-white md:text-base"
          >
            {site.intro}
          </motion.p>

          <motion.div {...blurIn(1.1)} className="mt-5 flex items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToId("about")}
              className="liquid-glass-strong flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Get to know me
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToId("journal")}
              className="flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Read my journal
            </button>
          </motion.div>
        </div>

        <Favorites />
      </div>
    </section>
  );
}
