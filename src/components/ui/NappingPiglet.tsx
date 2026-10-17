import MeadowPiglets from "@/components/MeadowPiglets.tsx";
import { useBoops } from "@/hooks/useBoops";

// One piglet in its own little 64x72 box. The canvas *is* the "video" here (same size, so
// the cover math maps 1:1), with headroom above the piglet for its z's and hearts.
const BOX = { width: 64, height: 72 };
const SPOT: [number, number] = [32, 66];

/** A single napping piglet that stays put but reacts to clicks like the hero's piglets. */
export function NappingPiglet() {
  const boop = useBoops();

  return (
    <span aria-hidden className="relative block" style={BOX}>
      <MeadowPiglets
        mode="nap"
        videoSize={BOX}
        zones={[{ from: SPOT, to: SPOT, scale: 1.3, haze: 0 }]}
        water={false}
        flyingPiglets={false}
        easterEggClicks={Number.POSITIVE_INFINITY}
        onPigletClick={boop}
      />
    </span>
  );
}
