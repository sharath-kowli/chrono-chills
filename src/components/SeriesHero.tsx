import { useEffect, useState } from 'react';
import type { Series } from '@/data/episodes';
import seriesBanner from '@/assets/series-banner.png';
import stillHereLogo from '@/assets/still-here-logo.png';

interface SeriesHeroProps {
  series: Series;
  /** Optional extra series to rotate through in the banner. */
  rotation?: Series[];
}

const ROTATE_MS = 7000;

export function SeriesHero({ series, rotation }: SeriesHeroProps) {
  const slides = rotation && rotation.length > 0 ? rotation : [series];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[active];
  const isStillHere = current.id === series.id;
  const comingSoon = current.episodes.length === 0;

  return (
    <section className="relative overflow-hidden pt-16">
      <div className="relative h-[280px] sm:h-[340px] md:h-[400px] w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={i !== active}
          >
            {s.id === series.id ? (
              <img src={seriesBanner} alt={s.title} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/40 via-background to-accent/30" />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        <div className="static-noise absolute inset-0 opacity-30" />
      </div>

      <div className="container relative -mt-32 px-4 pb-6 z-10">
        <div className="max-w-2xl min-h-[11rem]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              {comingSoon ? 'Coming Soon' : 'Now Streaming'}
            </span>
          </div>

          {isStillHere ? (
            <img src={stillHereLogo} alt={current.title} className="h-16 sm:h-20 md:h-24 w-auto invert brightness-200" />
          ) : (
            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-wider text-foreground">
              {current.title}
            </h2>
          )}

          <p className="mt-4 text-lg text-muted-foreground md:text-xl">{current.tagline}</p>

          <div className="mt-6 flex items-center gap-6">
            {!comingSoon && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-display text-3xl text-foreground">{current.episodes.length}</span>
                  <span className="text-sm uppercase tracking-widest text-muted-foreground">Episodes</span>
                </div>
                <div className="h-6 w-px bg-border" />
              </>
            )}
            <div className="text-sm uppercase tracking-widest text-muted-foreground">Horror • Sci-Fi • Thriller</div>
          </div>

          {slides.length > 1 && (
            <div className="mt-5 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${s.title}`}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-primary' : 'w-3 bg-muted-foreground/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
