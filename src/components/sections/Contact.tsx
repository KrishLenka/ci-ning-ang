import type { ComponentType, SVGProps } from "react";
import { Mail } from "lucide-react";
import { contact } from "@/content/site";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { ContactDoodles } from "@/components/ui/Doodles";
import { Section } from "@/components/ui/Section";
import { showToast } from "@/components/ui/BoopToast";

/** A link tile, or (with `copy`) a tile that copies that text to the clipboard instead. */
type Tile = { label: string; href?: string; copy?: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const { links } = contact;
const tiles: Tile[] = [
  { label: "Instagram", href: links.instagram, Icon: InstagramIcon },
  { label: "LinkedIn", href: links.linkedin, Icon: LinkedInIcon },
  { label: "Email", copy: links.email, Icon: Mail },
];

/** Copy text to the clipboard, with an older fallback for browsers that block the modern way. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

async function copyEmail(address: string) {
  const ok = await copyText(address);
  // Stays up a couple of seconds longer than the boop notes, so there's time to read it.
  showToast(ok ? `${address} copied to clipboard!` : address, 2.6);
}

const square =
  "liquid-glass flex aspect-square w-full items-center justify-center rounded-2xl text-plum shadow-[0_10px_30px_rgba(70,36,110,0.15)]";

export function Contact() {
  return (
    <Section id="contact" eyebrow={contact.eyebrow} heading={contact.heading}>
      <ContactDoodles />
      <div className="max-w-2xl">
        <Reveal>
          <p className="text-lg leading-relaxed text-ink md:text-xl">{contact.invitation}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-8 grid grid-cols-3 gap-4 sm:max-w-[31rem] sm:gap-5">
            {tiles.map(({ label, href, copy, Icon }) => (
              <li key={label}>
                {copy ? (
                  <button
                    type="button"
                    onClick={() => copyEmail(copy)}
                    aria-label={`${label}: copy ${copy}`}
                    title={copy}
                    className="group block w-full text-left"
                  >
                    <span className={`${square} transition-transform duration-300 group-hover:-translate-y-1`}>
                      <Icon className="h-10 w-10" />
                    </span>
                    <span className="mt-3 block font-medium text-ink group-hover:text-plum">{label}</span>
                  </button>
                ) : href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
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
