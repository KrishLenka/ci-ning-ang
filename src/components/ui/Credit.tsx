import { footer } from "@/content/site";

/** Krish's handwritten credit, ending in a small pen-drawn heart that matches the Caveat lettering. */
export function Credit({ className = "" }: { className?: string }) {
  return (
    <p className={`font-hand ${className}`}>
      {footer.credit}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="love"
        role="img"
        className="ml-[0.3em] inline-block h-[0.62em] w-[0.62em] -rotate-[8deg] align-[-0.02em]"
      >
        {/* One loose stroke that overshoots where it starts, like a quick pen heart. */}
        <path d="M12.4 20.2C9 17.6 3.6 13.6 3.2 9.2 2.9 6.2 5 4.1 7.6 4.3c2 .2 3.6 1.7 4.3 3.6.7-2 2.4-3.6 4.6-3.7 2.7-.1 4.7 2.2 4.2 5.1-.6 3.9-5 7.6-8.9 11.4l-1.3-1" />
      </svg>
    </p>
  );
}
