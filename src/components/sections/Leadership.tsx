import { leadership, type LeadershipRole } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { LeadershipTitleDoodles, LeadershipDoodles } from "@/components/ui/Doodles";
import { Section } from "@/components/ui/Section";

/**
 * Roles with events (like RUPA) get a full-width spotlight with their event cards;
 * the rest sit side by side as smaller glass cards underneath.
 */
export function Leadership() {
  const spotlight = leadership.roles.filter((r) => r.events?.length);
  const others = leadership.roles.filter((r) => !r.events?.length);

  return (
    <Section id="leadership" eyebrow={leadership.eyebrow} heading={leadership.heading} titleDoodles={<LeadershipTitleDoodles />}>
      <LeadershipDoodles />
      <div className="space-y-16">
        {spotlight.map((role) => (
          <div key={role.title + role.org}>
            <Reveal className="max-w-2xl">
              <RoleHeader role={role} />
              <p className="mt-3 text-base leading-relaxed text-ink md:text-lg">{role.description}</p>
            </Reveal>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {role.events!.map((event, i) => (
                <Reveal key={event.name} delay={i * 0.08}>
                  <article className="liquid-glass h-full overflow-hidden rounded-3xl">
                    <Photo src={event.photo.src} alt={event.photo.alt} className="aspect-[4/3] w-full" />
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lilac">{event.date}</p>
                      <h4 className="mt-1 font-heading text-[1.75rem] italic leading-tight text-ink">{event.name}</h4>
                      <p className="mt-2 text-[15px] leading-relaxed text-ink">{event.blurb}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        ))}

        {others.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {others.map((role, i) => (
              <Reveal key={role.title + role.org} delay={i * 0.08}>
                <article className="liquid-glass h-full rounded-3xl p-6 md:p-7">
                  <RoleHeader role={role} />
                  <p className="mt-3 text-[15px] leading-relaxed text-ink">{role.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function RoleHeader({ role }: { role: LeadershipRole }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-lilac">{role.dates}</p>
      <h3 className="mt-1 font-heading text-3xl italic leading-tight text-ink md:text-4xl">{role.title}</h3>
      <p className="text-sm font-medium text-ink-soft">{role.org}</p>
    </>
  );
}
