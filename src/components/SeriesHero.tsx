import type { Series } from '@/data/episodes';

interface SeriesHeroProps {
  series: Series;
}

export function SeriesHero({ series }: SeriesHeroProps) {
  return (
    <section className="relative overflow-hidden py-20 pt-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      {/* Static noise overlay */}
      <div className="static-noise absolute inset-0" />
      
      <div className="container relative px-4">
        <div className="max-w-2xl">
          {/* Series badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Now Streaming
            </span>
          </div>
          
          {/* Title */}
          <h1 
            className="glitch font-display text-6xl tracking-wider text-foreground md:text-8xl"
            data-text={series.title}
          >
            {series.title}
          </h1>
          
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
