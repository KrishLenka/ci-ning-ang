// Every word and photo on the site lives here, so it can be edited without touching layout code.
// (The page title, description and noindex flag live in ./meta.ts.)
//
// Photos: drop files into public/images/ and set `src` to e.g. "/images/photo_of_me.JPG"
// (file names are case-sensitive once the site is online). While `src` is empty, a soft
// placeholder showing the alt text is drawn instead.

export { meta } from "./meta";

/**
 * Photos always fill their frame without stretching; if the shapes differ, the edges are
 * trimmed. `focus` picks which part stays in view, as a CSS object-position:
 * "center" (default), "top", "bottom", or e.g. "50% 30%" (x then y; lower y keeps more of the top).
 */
export type Photo = { src: string; alt: string; focus?: string };


export const site = {
  firstName: "Ning",
  /** "·" separators are drawn in lilac. */
  roles: "Future Vet",
  intro: (
    <>
      I'm pursuing a double degree in{" "}
      <strong className="font-bold">Animal Sciences Pre-Vet</strong> and{" "}
      <strong className="font-bold">Music</strong> at Rutgers University-New Brunswick. I
      spend the rest of my time daydreaming, having fun, and getting to
      know every animal I meet. Welcome to my little corner of the
      internet!
    </>
  ),

  video: "/videos/meadow_bubbles.mp4",
  /** Shown instead of the video to visitors with reduced motion turned on (and while it loads). */
  videoStill: "/meadow_bubbles_static.jpg",
};

export type NavLink = { label: string; id: string };

export const navLinks: NavLink[] = [
  { label: "About", id: "about" },
  { label: "Experiences", id: "experiences" },
  { label: "Hobbies", id: "hobbies" },
  { label: "Leadership", id: "leadership" },
];

/**
 * The glass pill at the bottom of the hero. It hides everything over the video so the
 * meadow can be seen, then brings it back (scrolling down brings it back too).
 */
export const heroPill = {
  showScenery: "show scenery",
  showText: "show text",
};

/** About */
export const about = {
  eyebrow: "hello there",
  heading: "A little about me",
  portrait: { src: "/images/photo_of_me.JPG", alt: "me :)" } as Photo,
  polaroid: {
    src: "/images/me_and_button.jpg",
    alt: "Me and my pig Button with our show ribbons",
    // Keeps Ning and Button in frame (they're on the left of the photo).
    focus: "0% 50%",
    caption: "Me & Button!", // TODO
  },
  // TODO: rewrite in her own words.
  paragraphs: [
    "[description]"
  ],
  /** `piglet: true` puts a little napping piglet next to that fact (clickable, like the hero's). */
  facts: [
    { label: "Studying", value: "Animal Sciences & Music" },
    { label: "Hometown", value: "Princeton, NJ" },
    { label: "Pets", value: "Future dog" },
    { label: "Favorite animal", value: "Pigs", piglet: true },
    { label: "Drink order", value: "Rose Milk Tea, Lychee Jelly" },
    { label: "Favorite food", value: "Bak Chor Mee" },
  ],
};

/** Experience */
export type Experience = {
  role: string;
  place: string;
  dates: string;
  description: string;
  photo?: Photo;
};

export const experiences = {
  eyebrow: "my dream",
  heading: "Path to Vet School",
  // TODO
  intro:
    "[Description]",
  // Most recent first. TODO: descriptions, and any other experiences she wants to add.
  experiences: [
    {
      role: "Veterinary Assistant",
      place: "Central Jersey Animal Hospital",
      dates: "May 2026 – Present",
      description: "[description]",
      photo: { src: "/images/me_and_rocky.JPG", alt: "Me and Rocky", focus: "50% 40%" },
    },
    {
      role: "Veterinary Extern",
      place: "NorthStar VETS",
      dates: "Summer 2025",
      description: "[description]",
    },
  ] as Experience[],
};

/* ----------------------------------------------------------------------- */
/* Music                                                                    */
/* ----------------------------------------------------------------------- */

export type Song = {
  title: string;
  artist: string;
  /** Album art (or any photo) for this song, e.g. "/images/fine_on_the_outside.jpeg". */
  art: string;
  /** Exact Spotify link. If empty, the card opens a Spotify search for the song instead. */
  spotifyUrl?: string;
};

export const music = {
  eyebrow: "the other major",
  heading: "Music",
  playing: {
    title: "What I play",
    // TODO: her instrument and ensembles.
    text: "[Description]",
    // TODO: add her photos under public/images/music/. One photo shows large; more make a collage.
    photos: [
      { src: "", alt: "Ning performing on stage" }, // TODO
      { src: "", alt: "Ning practicing" }, // TODO
    ] as Photo[],
  },
  onRepeat: {
    title: "On repeat",
    // Songs without a title are skipped, so empty slots can wait here until she fills them in.
    songs: [
      { title: "My Everything", artist: "Ariana Grande", art: "/images/my_everything.jpeg" },
      { title: "Fever", artist: "Dua Lipa", art: "/images/fever.jpeg" },
      { title: "Over the Moon", artist: "The Marías", art: "/images/over_the_moon.jpg" },
      { title: "You'll Be in My Heart", artist: "NIKI", art: "/images/youll_be_in_my_heart.jpeg" },
      { title: "Purple", artist: "Olivia Rodrigo", art: "/images/purple.png" },
    ] as Song[],
  },
};

/* ----------------------------------------------------------------------- */
/* Travel                                                                   */
/* ----------------------------------------------------------------------- */

export type Postcard = {
  place: string;
  country: string;
  /** "YYYY-MM", shown on the stamp as e.g. "APR 2024". */
  date: string;
  photo: string;
  alt: string;
  note: string;
};

export const travel = {
  eyebrow: "where I've been",
  heading: "Postcards",
  // Most recent first. TODO: photos (public/images/travel/) and her notes.
  postcards: [
    {
      place: "Nova Scotia & PEI",
      country: "Canada",
      date: "2026-07",
      photo: "",
      alt: "Photo from Nova Scotia and Prince Edward Island",
      note: "[note]",
    },
    {
      place: "Bermuda",
      country: "",
      date: "2026-01",
      photo: "",
      alt: "Photo from Bermuda",
      note: "[note]",
    },
    {
      place: "Cape Cod",
      country: "USA",
      date: "2025-07",
      photo: "",
      alt: "Photo from Cape Cod",
      note: "[note]",
    },
    {
      place: "Greece",
      country: "Greece",
      date: "2025-01",
      photo: "",
      alt: "Photo from Greece",
      note: "[note]",
    },
    {
      place: "Iceland",
      country: "Iceland",
      date: "2024-08",
      photo: "",
      alt: "Photo from Iceland",
      note: "[note]",
    },
  ] as Postcard[],
  wishlistTitle: "Next on my list",
  wishlist: ["Switzerland", "Japan"],
};

/* ----------------------------------------------------------------------- */
/* Leadership                                                               */
/* ----------------------------------------------------------------------- */

export type ClubEvent = { name: string; date: string; photo: Photo; blurb: string };
export type LeadershipRole = {
  title: string;
  org: string;
  dates: string;
  description: string;
  /** Roles with events get a full-width spotlight with event cards; the rest sit side by side. */
  events?: ClubEvent[];
};

export const leadership = {
  eyebrow: "behind the scenes",
  heading: "Leadership",
  roles: [
    {
      title: "Director", // TODO: e.g. "Director of Special Events"
      org: "RUPA · Rutgers University Programming Association",
      dates: "[dates]", // TODO
      // TODO
      description:
        "[Description]",
      // TODO: her real events.
      events: [
        {
          name: "Beats on the Banks",
          date: "Apr 2026",
          photo: { src: "", alt: "" },
          blurb: "[Description]",
        },
        {
          name: "Winter Wonderland Coffeehouse",
          date: "Nov 2025",
          photo: { src: "", alt: "" },
          blurb: "[Description]",
        },
        {
          name: "Spookeasy",
          date: "Oct 2026",
          photo: { src: "", alt: "" },
          blurb: "[Description]",
        },
      ],
    },
    {
      title: "Assistant House Director",
      org: "Princeton Symphony Orchestra",
      dates: "[dates]", // TODO
      description: "[description]", // TODO
    },
    {
      // TODO: optional; confirm she wants this one, and the organization.
      title: "Mounted Patrol",
      org: "[Organization]",
      dates: "[dates]",
      description: "[description]",
    },
  ] as LeadershipRole[],
};

/* ----------------------------------------------------------------------- */
/* Contact & footer                                                         */
/* ----------------------------------------------------------------------- */

export const contact = {
  eyebrow: "say hi",
  heading: "Let's talk",
  invitation: "Whether it's about animals, music, or life, I'd love to hear from you.", // TODO
  /**
   * Square link tiles. A tile whose link is empty shows dimmed and isn't clickable.
   * The email tile copies `email` to the clipboard and says so in a little handwritten note.
   */
  links: {
    instagram: "https://www.instagram.com/cicia3/",
    linkedin: "https://www.linkedin.com/in/ci-ning-ang-045116347",
    email: "ciningang333@gmail.com",
  },
};

export const footer = {
  copyright: "© 2026 Ci-Ning Ang",
  /** Shown in handwriting in the footer and under the hero's glass pill, followed by a drawn heart. */
  credit: "made with love - Krish",
};

/* ----------------------------------------------------------------------- */
/* Easter eggs (secret: no hint or counter is shown on the page)            */
/* ----------------------------------------------------------------------- */

/** Piglet clicks ("boops") are counted for this visit; a reload starts again from 0. */
export const easterEggs = {
  boopEvery: 50,
  boopMessage: (n: number) => `${n} boops! 🐷`,
  // 50 → purple, 100 → gold, 200 → rainbow; beyond that the pattern repeats
  // (150 purple, 300 gold, 400 rainbow, 450 purple, …)
  milestoneFlyer: (n: number): "purple" | "gold" | "rainbow" =>
    n % 200 === 0 ? "rainbow" : n % 100 === 0 ? "gold" : "purple",
};
