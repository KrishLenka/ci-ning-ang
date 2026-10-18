/**
 * Turns a public-folder path like "/images/photo.jpg" into one that works
 * wherever the site is hosted. On GitHub Pages the site lives under
 * /ci-ning-ang/, so "/images/photo.jpg" becomes "/ci-ning-ang/images/photo.jpg".
 * On a custom domain (base "/") and in local dev, paths are left as they are.
 * Full URLs (https://…) pass through untouched.
 */
export function asset(path: string): string;
export function asset(path: string | undefined): string | undefined;
export function asset(path?: string): string | undefined {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return path;
  return import.meta.env.BASE_URL.replace(/\/$/, "") + path;
}
