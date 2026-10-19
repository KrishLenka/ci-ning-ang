import { music, type Photo as PhotoData, type Song } from "@/content/site";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { MusicDoodles } from "@/components/ui/Doodles";
import { Section, SubHeading } from "@/components/ui/Section";

const spotifySearch = (s: Song) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${s.title} ${s.artist}`)}`;

export function Music() {
  const { playing, onRepeat } = music;
  const songs = onRepeat.songs.filter((s) => s.title.trim());

  return (
    <Section id="music" eyebrow={music.eyebrow} heading={music.heading}>
      <MusicDoodles />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <SubHeading>{playing.title}</SubHeading>
          <p className="mt-4 text-base leading-relaxed text-ink md:text-lg">{playing.text}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <PhotoCollage photos={playing.photos} />
        </Reveal>
      </div>

      <Reveal className="mt-16 md:mt-20">
        <SubHeading>{onRepeat.title}</SubHeading>
        {/* Scrolls sideways with snap on phones; a plain grid from md up. */}
        <ul className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {songs.map((song) => (
            <li key={song.title} className="w-[58%] shrink-0 snap-start min-[480px]:w-[40%] md:w-auto">
              <a
                href={song.spotifyUrl || spotifySearch(song)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                aria-label={`${song.title} by ${song.artist} on Spotify`}
              >
                <Photo
                  src={song.art}
                  alt={`Album art for ${song.title}`}
                  showAlt={false}
                  className="aspect-square w-full rounded-2xl shadow-[0_10px_30px_rgba(70,36,110,0.15)] transition-transform duration-300 group-hover:-translate-y-1"
                />
                <p className="mt-3 truncate font-medium text-ink group-hover:text-plum">{song.title}</p>
                <p className="truncate text-sm text-ink-soft">{song.artist}</p>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

/** One photo shows large; two sit side by side; three or more get a feature photo plus a row. */
function PhotoCollage({ photos }: { photos: PhotoData[] }) {
  if (photos.length === 0) return null;
  const rounded = "rounded-3xl shadow-[0_16px_40px_rgba(70,36,110,0.14)]";

  if (photos.length === 1) {
    return <Photo src={photos[0].src} alt={photos[0].alt} className={`aspect-[4/3] w-full ${rounded}`} />;
  }

  if (photos.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {photos.map((p, i) => (
          <Photo
            key={p.alt + i}
            src={p.src}
            alt={p.alt}
            className={`aspect-[3/4] w-full ${rounded} ${i === 1 ? "mt-8" : ""}`}
          />
        ))}
      </div>
    );
  }

  const [first, ...rest] = photos;
  return (
    <div className="grid gap-4">
      <Photo src={first.src} alt={first.alt} className={`aspect-[16/10] w-full ${rounded}`} />
      <div className="grid grid-cols-3 gap-4">
        {rest.slice(0, 3).map((p, i) => (
          <Photo key={p.alt + i} src={p.src} alt={p.alt} showAlt={false} className={`aspect-square w-full ${rounded}`} />
        ))}
      </div>
    </div>
  );
}
