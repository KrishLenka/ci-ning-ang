import { PawPrint } from "lucide-react";
import { experiences } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Experiences() {
  return (
    <Section id="experiences" eyebrow={experiences.eyebrow} heading={experiences.heading}>
      <Reveal>
        <p className="max-w-2xl text-base leading-relaxed text-ink md:text-lg">{experiences.intro}</p>
      </Reveal>

      <ol className="relative mt-12 space-y-8 border-l-2 border-lilac/25 pl-7 md:ml-3 md:pl-10">
        {experiences.experiences.map((exp) => (
          <li key={`${exp.role}-${exp.dates}`} className="relative">
            <span
              aria-hidden
              className="liquid-glass absolute -left-[45px] top-5 flex h-8 w-8 items-center justify-center rounded-full md:-left-[59px]"
            >
              <PawPrint className="h-4 w-4 text-lilac" />
            </span>
            <Reveal>
              <article
                className={`liquid-glass grid gap-5 rounded-3xl p-5 md:p-6 ${
                  exp.photo ? "sm:grid-cols-[1fr_12rem]" : ""
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lilac">{exp.dates}</p>
                  <h3 className="mt-1 font-heading text-[1.75rem] italic leading-tight text-ink">{exp.role}</h3>
                  <p className="text-sm font-medium text-ink-soft">{exp.place}</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{exp.description}</p>
                </div>
                {exp.photo && (
                  <Photo
                    src={exp.photo.src}
                    alt={exp.photo.alt}
                    focus={exp.photo.focus}
                    className="aspect-[4/3] w-full rounded-2xl sm:aspect-square"
                  />
                )}
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
