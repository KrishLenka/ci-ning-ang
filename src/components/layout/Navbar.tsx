import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { navLinks } from "@/content/site";
import { handleAnchorClick } from "@/lib/scroll";
import { sceneryFade, useInert, useSceneryMode } from "@/hooks/useSceneryMode";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const close = () => setOpen(false);
  // Hidden (and closed) while the hero pill is showing the scenery.
  const scenery = useSceneryMode();
  useInert(navRef, scenery);
  useEffect(() => {
    if (scenery) setOpen(false);
  }, [scenery]);

  // Close the dropdown on Escape, on a click outside it, or if the window grows past 520px.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close();
    };
    const wide = window.matchMedia("(min-width: 520px)");
    const onWide = () => wide.matches && close();
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const linkClass =
    "rounded-full px-[13px] py-2 text-sm font-medium text-ink transition-colors hover:bg-white/50";

  return (
    <header
      aria-hidden={scenery}
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 ${sceneryFade(scenery)}`}
    >
      <nav ref={navRef} aria-label="Main" className="pointer-events-auto relative">
        <div className="liquid-glass flex items-center rounded-full p-1">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={handleAnchorClick(link.id)}
              className={`${linkClass} max-[519px]:hidden`}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="nav-menu"
            className={`${linkClass} min-[520px]:hidden`}
          >
            Menu
          </button>
          <a
            href="#contact"
            onClick={handleAnchorClick("contact", close)}
            className="ml-1 rounded-full bg-plum px-4 py-[7px] text-sm font-medium text-white transition-colors hover:bg-plum-dark"
          >
            Say hi
          </a>
        </div>

        <AnimatePresence>
          {open && (
            <motion.ul
              id="nav-menu"
              className="liquid-glass absolute left-0 right-0 top-full mt-2 flex flex-col gap-0.5 rounded-3xl p-2 min-[520px]:hidden"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={handleAnchorClick(link.id, close)}
                    className={`${linkClass} block`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
