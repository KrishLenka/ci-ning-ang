// All of the hero's words live here so they can be edited without touching layout code.
import { CalendarHeart, Music, PawPrint, Sparkles, type LucideIcon } from "lucide-react";

export const site = {
  firstName: "Ning",
  monogram: "CA",
  signature: "Ning",
  status: "Applying to vet school · Class of 2027",
  roles: "Future veterinarian · Musician · Dancer",
  intro:
    "I'm studying animal science and music at Rutgers, and I spend the rest of my time dancing, planning campus events, and getting to know every dog I meet. This is my little corner of the internet.",
  video: "/videos/angster.mp4",
};

export type NavLink = { label: string; id: string };

export const navLinks: NavLink[] = [
  { label: "About", id: "about" },
  { label: "Animals", id: "animals" },
  { label: "Music", id: "music" },
  { label: "Dance", id: "dance" },
  { label: "Journal", id: "journal" },
];

export type Favorite = { label: string; icon: LucideIcon };

export const favorites: Favorite[] = [
  { label: "Animals", icon: PawPrint },
  { label: "Music", icon: Music },
  { label: "Dance", icon: Sparkles },
  { label: "RUPA", icon: CalendarHeart },
];
