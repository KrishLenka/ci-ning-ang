import type { ComponentType, SVGProps } from "react";
import { Mail } from "lucide-react";
import { contact } from "@/content/site";
import { InstagramIcon, LinkedInIcon, SpotifyIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

type Tile = { label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const { links } = contact;
const tiles: Tile[] = [
  { label: "Instagram", href: links.instagram, Icon: InstagramIcon },
  { label: "Spotify", href: links.spotify, Icon: SpotifyIcon },
  { label: "LinkedIn", href: links.linkedin, Icon: LinkedInIcon },
  { label: "Email", href: links.email && `mailto:${links.email}`, Icon: Mail },
];

const square =
  "liquid-glass flex aspect-square w-full items-center justify-center rounded-2xl text-plum shadow-[0_10px_30px_rgba(70,36,110,0.15)]";

export function Contact() {
  return (
    <Section id="contact" eyebrow={contact.eyebrow} heading={contact.heading}>
      <div className="max-w-2xl">
        <Reveal>
          <p className="text-lg leading-relaxed text-ink md:text-xl">{contact.invitation}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {tiles.map(({ label, href, Icon }) => (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    className="group block"
                  >
                    <span className={`${square} transition-transform duration-300 group-hover:-translate-y-1`}>
                      <Icon className="h-10 w-10" />
                    </span>
                    <span className="mt-3 block font-medium text-ink group-hover:text-plum">{label}</span>
                  </a>
                ) : (
                  // No link yet: shown dimmed and not clickable.
                  <div aria-disabled="true" title="Link coming soon" className="opacity-45">
                    <span className={square}>
                      <Icon className="h-10 w-10" />
                    </span>
                    <span className="mt-3 block font-medium text-ink">{label}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
