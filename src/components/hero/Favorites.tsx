import { motion } from "motion/react";
import { favorites, site } from "@/content/site";
import { blurIn } from "@/lib/motion";

/** "What I'm into" strip pinned to the bottom of the hero. */
export function Favorites() {
  return (
    <motion.div {...blurIn(1.3)} className="flex flex-col items-center gap-4 px-4 pb-8">
      <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
        A few of my favorite things
      </span>

      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 md:gap-x-14">
        {favorites.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-white/85 md:h-6 md:w-6" strokeWidth={1.5} aria-hidden />
            <span className="font-heading text-2xl italic text-white md:text-3xl">{label}</span>
          </li>
        ))}
      </ul>

      <p className="-rotate-[4deg] font-hand text-3xl text-white/90">{site.signature}</p>
    </motion.div>
  );
}
