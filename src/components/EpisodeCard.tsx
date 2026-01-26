import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Episode } from '@/data/episodes';

interface EpisodeCardProps {
  episode: Episode;
  index: number;
}

export function EpisodeCard({ episode, index }: EpisodeCardProps) {
  return (
    <Link
      to={`/watch/${episode.id}`}
      className="episode-card group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-video overflow-hidden">
        {/* Thumbnail */}
        <img
          src={episode.thumbnail}
          alt={episode.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* VHS scan lines overlay */}
        <div className="vhs-lines absolute inset-0" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-horror-dark via-transparent to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="play-pulse flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
            <Play className="h-7 w-7 fill-primary-foreground text-primary-foreground" />
          </div>
        </div>
        
        {/* Episode number badge */}
        <div className="absolute left-3 top-3 z-20">
          <span className="font-display text-2xl tracking-wider text-foreground/80">
            EP {episode.number.toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* New badge */}
        {episode.isNew && (
          <div className="absolute right-3 top-3 z-20">
            <span className="rounded bg-primary px-2 py-0.5 font-display text-xs tracking-widest text-primary-foreground">
              NEW
            </span>
          </div>
        )}
        
        {/* Duration */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="rounded bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            {episode.duration}
          </span>
        </div>
      </div>
      
      {/* Episode info */}
      <div className="relative z-20 p-4">
        <h3 className="font-display text-xl tracking-wide text-foreground transition-colors group-hover:text-primary">
          {episode.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {episode.subtitle}
        </p>
      </div>
    </Link>
  );
}
