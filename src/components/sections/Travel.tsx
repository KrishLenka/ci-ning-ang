import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { travel, type Postcard } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SubHeading } from "@/components/ui/Section";

const TILTS = [-1.5, 1, -0.5, 1.5, -1, 0.5];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function Travel() {
  return (
    <Section
      id="travel"
      eyebrow={travel.eyebrow}
      heading={travel.heading}
    >
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        {travel.postcards.map((card, i) => (
          <Reveal key={`${card.place}-${card.date}`} delay={(i % 2) * 0.08}>
            <PostcardCard card={card} tilt={TILTS[i % TILTS.length]} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16">
        <SubHeading>{travel.wishlistTitle}</SubHeading>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {travel.wishlist.filter((place) => place.trim()).map((place) => (
            <li
              key={place}
              className="liquid-glass flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-ink"
            >
              <MapPin className="h-4 w-4 text-lilac" aria-hidden />
              {place}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

function PostcardCard({ card, tilt }: { card: Postcard; tilt: number }) {
  const [year, month] = card.date.split("-");

  return (
    <article
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      className="relative rotate-[var(--tilt)] rounded-[1.25rem] bg-white p-3 shadow-[0_16px_40px_rgba(70,36,110,0.14)] transition-transform duration-300 ease-out hover:rotate-0 hover:scale-[1.01] sm:p-4"
    >
      <Photo src={card.photo} alt={card.alt} className="aspect-[3/2] w-full rounded-xl" />

      <div className="stamp absolute right-6 top-6 rotate-[4deg] sm:right-7 sm:top-7" aria-label={`Visited ${MONTHS[+month - 1]} ${year}`}>
        <div className="flex h-[3.6rem] w-[3rem] flex-col items-center justify-center bg-white leading-none text-plum">
          <span className="text-[11px] font-semibold tracking-[0.1em]">{MONTHS[+month - 1]}</span>
          <span className="mt-1 font-heading text-lg italic">{year}</span>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="font-heading text-[1.85rem] italic leading-none text-ink">{card.place}</h3>
          {card.country !== card.place && (
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{card.country}</span>
          )}
        </div>
        <p className="mt-2 font-hand text-[1.35rem] leading-snug text-ink-soft">{card.note}</p>
      </div>
    </article>
  );
}
