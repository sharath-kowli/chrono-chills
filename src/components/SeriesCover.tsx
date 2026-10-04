import { Link } from "react-router-dom";
import type { Series } from "@/data/episodes";
import seriesBanner from "@/assets/series-banner.png";
import stillHereLogo from "@/assets/still-here-logo.png";

interface Props {
  series: Series;
  isStillHere: boolean;
}

export function SeriesCover({ series, isStillHere }: Props) {
  const comingSoon = series.episodes.length === 0;
  const inner = (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border/40 shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:border-foreground/60">
      {isStillHere ? (
        <img src={seriesBanner} alt={series.title} className="h-full w-full object-cover object-top" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-primary/40 via-background to-accent/30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        {isStillHere ? (
          <img src={stillHereLogo} alt={series.title} className="h-10 sm:h-12 w-auto invert brightness-200" />
        ) : (
          <h3 className="font-display text-2xl sm:text-3xl tracking-wider text-foreground">{series.title}</h3>
        )}
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {comingSoon ? "Coming soon" : `${series.episodes.length} episodes`}
        </p>
      </div>
    </div>
  );

  if (comingSoon) return <div className="group block cursor-default opacity-90">{inner}</div>;
  return (
    <Link to={`/series/${series.id}`} className="group block" aria-label={`Open ${series.title}`}>
      {inner}
    </Link>
  );
}
