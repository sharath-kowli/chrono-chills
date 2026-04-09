import type { Series } from '@/data/episodes';
import seriesBanner from '@/assets/series-banner.png';
import stillHereLogo from '@/assets/still-here-logo.png';

interface SeriesHeroProps {
  series: Series;
}

export function SeriesHero({ series }: SeriesHeroProps) {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Banner image background */}
      <div className="relative h-[280px] sm:h-[340px] md:h-[400px] w-full">
        <img
          src={seriesBanner}
          alt={series.title}
          className="h-full w-full object-cover object-top"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />

        {/* Static noise overlay */}
        <div className="static-noise absolute inset-0 opacity-30" />
      </div>

      {/* Content overlaid at the bottom of the banner */}
      <div className="container relative -mt-32 px-4 pb-6 z-10">
        <div className="max-w-2xl">
          {/* Series badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Now Streaming
            </span>
          </div>

          {/* Logo image as title */}
          <img
            src={stillHereLogo}
            alt={series.title}
            className="h-16 sm:h-20 md:h-24 w-auto invert brightness-200"
          />

          {/* Tagline */}
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            {series.tagline}
          </p>

          {/* Episode count */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl text-foreground">
                {series.episodes.length}
              </span>
              <span className="text-sm uppercase tracking-widest text-muted-foreground">
                Episodes
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-sm uppercase tracking-widest text-muted-foreground">
              Horror • Sci-Fi • Thriller
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
