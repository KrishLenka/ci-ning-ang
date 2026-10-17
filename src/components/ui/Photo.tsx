import { useState } from "react";
import { ImageIcon } from "lucide-react";

type PhotoProps = {
  src?: string;
  alt: string;
  className?: string;
  /** Show the alt text on the placeholder (off for small thumbnails). */
  showAlt?: boolean;
  /** Which part of the photo stays in view when it's cropped to fit (CSS object-position). */
  focus?: string;
};

/** An image that falls back to a soft lavender placeholder while no photo is set or it fails to load. */
export function Photo({ src, alt, className = "", showAlt = true, focus }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`photo-placeholder flex flex-col items-center justify-center gap-2 p-4 text-center ${className}`}
      >
        <ImageIcon className="h-6 w-6 text-lilac/70" strokeWidth={1.5} aria-hidden />
        {showAlt && <span className="max-w-[16rem] text-xs leading-snug text-ink-soft/80">{alt}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={focus ? { objectPosition: focus } : undefined}
      className={`object-cover ${className}`}
    />
  );
}
