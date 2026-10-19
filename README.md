# ci-ning-ang

## Horses
- chestnut quarter horse
- bay thoroughbred
- black Friesian
- palomino
- dapple grey
- buckskin
- paint
- blanket Appaloosa
- leopard-spotted Appaloosa

**Note**: Does not show up for visitors with reduced motion

---

# Notes for working on this repo

## Running it

```bash
npm install        # once, after cloning
npm run dev        # local site at http://localhost:5173, reloads as you save
npm run typecheck  # catches mistakes without building
npm run build      # what the deploy runs: typecheck + production build into dist/
npm run preview    # serve the built dist/ locally, closest thing to the live site
```

Pushing to `main` deploys automatically (`.github/workflows/deploy.yml` → GitHub Pages →
ciningang.com). If a deploy fails, check the **Actions** tab on GitHub; it's almost always a
type error, so run `npm run build` locally before pushing.

## Where things live

```
public/                 files served as-is: photos (images/), the hero video, favicon, CNAME
src/
  content/
    site.tsx            ★ ALL the words, photos, links and lists on the page
    meta.ts             page title, description, search-engine (noindex) flag
  App.tsx               the page, top to bottom: Navbar, Hero, sections, Footer, toast, quokka
  index.css             global styles: liquid glass, glows, the toast's wave animation
  components/
    hero/               the top screen: video, swipeable stage, title copy, the pill
    sections/           one file per section (About, Experiences, Music, Travel, ...)
    layout/             Navbar and Footer
    ui/                 shared pieces: Section wrapper, Photo, Reveal, toast, doodles, icons
    meadowX.ts          the animal "engines" (piglets, horses, swans, bunnies, clouds)
    MeadowX.tsx         small React wrappers that put each engine on a <canvas>
    Quokka.tsx          the peeking quokka (plain React, not a canvas engine)
  hooks/
    useBoops.ts         the shared boop counter (piglets + quokka taps)
    useSceneryMode.ts   the "show scenery / show text" switch
  lib/                  small helpers: blur-in animation, smooth scrolling, asset paths
```

**Most day-to-day edits only touch `src/content/site.tsx` and `public/images/`.** Layout files
read everything from `site.tsx`, so changing text or swapping a photo never needs a layout change.

## Common tasks

- **Change text:** find it in `src/content/site.tsx`. Placeholders like `[description]` and
  comments marked `TODO` are things still waiting for real content.
- **Add or replace a photo:** drop it in `public/images/`, then set `src: "/images/name.jpg"` in
  `site.tsx`. File names are **case-sensitive** once deployed (`photo.JPG` ≠ `photo.jpg`), even
  though they work either way on a Mac. If a photo crops badly, set `focus` (e.g. `"50% 30%"`)
  to choose which part stays in view.
- **Add a song / postcard / event:** copy an existing entry in its list in `site.tsx` and edit it.
  Empty entries (like `title: ""`) are skipped, so you can leave blank slots.
- **Change an animal's timing:** most engines take props on their component in
  `src/components/hero/Hero.tsx` (e.g. `<MeadowHorses firstAfter={[4, 4]} />`). Defaults live at
  the top of each `meadowX.ts` file (search for `?? [` to find them).
- **Quokka timing:** the constants at the top of `src/components/Quokka.tsx`.
- **Background doodles:** `src/components/ui/Doodles.tsx`. Each section has a layer (big screens,
  placed with Tailwind classes in `at="..."`) and a `*TitleDoodles` set (small screens, beside
  the heading).
- **Turn the animal clouds back on:** add `<MeadowClouds className="-z-[31]" />` after
  `<BackgroundVideo />` in `Hero.tsx` (and import it). The code is kept but switched off.

## Things worth remembering

- **Styling is Tailwind**: classes like `mt-4 text-plum md:text-lg` right in the JSX. `md:` /
  `lg:` mean "from that screen width up" (md = 768px, lg = 1024px). The custom colours (`ink`,
  `plum`, `lilac`, `paper`, `cream`, ...) are defined in `tailwind.config.ts`.
- **Always check a phone width.** In Chrome: right-click → Inspect → the phone/tablet toggle at the
  top left of DevTools. Many layouts change below 1024px.
- **The hero video and the animals are linked.** Every animal engine maps its positions onto the
  video's own pixels (1924 × 1076). If you ever swap the video for a different scene, the
  piglet zones, horse routes, pond outline, swim area and flower field in the `meadowX.ts` files
  would all need retracing.
- **Layering in the hero** is set with `-z-[..]` classes in `Hero.tsx`. From back to front:
  video (-40), piglets (-30), horses (-29), swans (-28), bunnies (-27), then the text.
- **Reduced motion:** visitors who turned on "Reduce Motion" on their device get the still image
  instead of the video and no wandering animals. That's intentional (it's an accessibility
  setting), so if the site looks frozen on a phone, check that setting first.
- **Easter eggs:** every 50 boops (piglet or quokka taps, counted per visit) shows a note and a
  special flying pig: purple, gold at 100, rainbow at 200. The settings are `easterEggs` at the
  bottom of `site.tsx`. The unicorn is a rare horse coat (half as likely as the others).
- **The toast** (`showToast("…")` from `ui/BoopToast.tsx`) can show any short handwritten note;
  the email tile uses it for "copied to clipboard!".
- **Search engines:** `noindex: true` in `src/content/meta.ts` keeps the site out of Google.
  Set it to `false` when she's ready for the site to be found.

## Before you push

1. `npm run build` passes (no red errors).
2. You've looked at the page at a phone width and a desktop width.
3. New images are in `public/images/` and their names match `site.tsx` exactly (including case).
