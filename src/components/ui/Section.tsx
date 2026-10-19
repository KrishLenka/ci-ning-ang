import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  heading: ReactNode;
  children: ReactNode;
  className?: string;
};

/** A page section: handwritten eyebrow, big serif heading with a faint lavender glow, then content. */
export function Section({ id, eyebrow, heading, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`relative isolate overflow-x-clip px-5 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <Reveal className="relative isolate mb-10 md:mb-14">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-16 top-1/2 -z-10 h-64 w-[34rem] -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(138,92,196,0.16), rgba(138,92,196,0.06) 55%, rgba(138,92,196,0))",
            }}
          />
          <p className="font-hand text-2xl text-lilac md:text-[1.7rem]">{eyebrow}</p>
          <h2 className="font-heading text-[clamp(2.6rem,7vw,4.5rem)] italic leading-[0.95] tracking-[-0.02em] text-ink">
            {heading}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/** Smaller serif subheading used inside sections. */
export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="font-heading text-3xl italic text-ink md:text-4xl">{children}</h3>;
}
