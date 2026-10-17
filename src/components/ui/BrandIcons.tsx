// lucide-react v1 no longer ships brand logos, so these are drawn to match its outline style.
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function SpotifyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.2 9.4c3.2-1 6.7-.7 9.6 1M7.7 12.5c2.6-.8 5.4-.5 7.7.8M8.3 15.5c2-.6 4-.4 5.7.6" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
      <path d="M7.75 10.5v6M7.75 7.5v.01M11.75 16.5v-6M11.75 13.25a2.5 2.5 0 0 1 5 0v3.25" />
    </svg>
  );
}
