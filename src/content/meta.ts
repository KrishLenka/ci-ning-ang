// Page title, description and search-engine visibility. Kept in its own plain .ts file
// because vite.config.ts reads it at build time, before React or the "@/" alias exist.

export const meta = {
  title: "Ci-Ning Ang",
  description:
    "Ning — pre-vet student at Rutgers studying Animal Sciences and Music. Animals, music, travel and a little bit of everything else.",
  /** Keeps the site out of search results until she's ready. Set to false to go public. */
  noindex: true,
};
