import { about } from "@/content/site";
import { NappingPiglet } from "@/components/ui/NappingPiglet";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" eyebrow={about.eyebrow} heading={about.heading}>
      <div className="grid items-start gap-14 md:grid-cols-[5fr_7fr] md:gap-16">
        <Reveal className="relative mx-auto w-full max-w-sm pb-10 pr-6 md:max-w-none md:pr-10">
          <Photo
            src={about.portrait.src}
            alt={about.portrait.alt}
            focus={about.portrait.focus}
            className="aspect-[4/5] w-full rounded-[2rem] shadow-[0_20px_50px_rgba(70,36,110,0.18)]"
          />
          <figure className="absolute bottom-0 right-0 w-32 rotate-[6deg] bg-white p-2 pb-1 shadow-[0_12px_30px_rgba(70,36,110,0.22)] transition-transform duration-300 hover:rotate-[2deg] sm:w-40">
            <Photo
              src={about.polaroid.src}
              alt={about.polaroid.alt}
              focus={about.polaroid.focus}
              showAlt={false}
              className="aspect-[3/4] w-full"
            />
            <figcaption className="py-1 text-center font-hand text-lg leading-tight text-ink-soft">
              {about.polaroid.caption}
            </figcaption>
          </figure>
        </Reveal>

        <div>
          <Reveal className="space-y-4 text-base leading-relaxed text-ink md:text-lg">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <h3 className="font-heading text-3xl italic text-ink">Quick facts</h3>
            <dl className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {about.facts.map((fact) => (
                <div key={fact.label} className="liquid-glass rounded-2xl px-4 py-3.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lilac">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium leading-snug text-ink">{fact.value}</dd>
                  {"piglet" in fact && fact.piglet && (
                    <span className="absolute bottom-1 right-2">
                      <NappingPiglet />
                    </span>
                  )}
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
