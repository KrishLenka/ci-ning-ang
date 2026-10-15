import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Menu, X } from "lucide-react";
import { navLinks, site } from "@/content/site";
import { handleAnchorClick } from "@/lib/scroll";

export function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock page scroll and allow Escape to close while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-4 z-50 px-8 lg:px-16">
        <nav className="flex items-center justify-between gap-4" aria-label="Main">
          <div className="flex flex-1">
            <a
              href="#top"
              onClick={handleAnchorClick("top")}
              aria-label="Back to top"
              className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full font-heading text-3xl italic text-white"
            >
              <span className="-ml-0.5 leading-none">{site.monogram}</span>
            </a>
          </div>

          <div className="liquid-glass hidden items-center rounded-full py-1 pl-2 pr-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleAnchorClick(link.id)}
                className="px-3 py-2 font-body text-sm font-medium text-foreground/90 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={handleAnchorClick("contact")}
              className="ml-1 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/85"
            >
              Say hi
              <Mail className="h-4 w-4" />
            </a>
          </div>

          <div className="flex flex-1 justify-end">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="liquid-glass-strong fixed inset-0 z-[60] flex flex-col bg-black/10 px-8 pb-10 pt-4 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-3xl italic text-white">{site.monogram}</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                autoFocus
                className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="mt-16 flex flex-1 flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
                >
                  <a
                    href={`#${link.id}`}
                    onClick={handleAnchorClick(link.id, close)}
                    className="block py-1 font-heading text-5xl italic text-white"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>

            <a
              href="#contact"
              onClick={handleAnchorClick("contact", close)}
              className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-black"
            >
              Say hi
              <Mail className="h-4 w-4" />
            </a>
            <p className="mt-6 text-center font-hand text-3xl text-white/90 -rotate-[4deg]">
              {site.signature}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
