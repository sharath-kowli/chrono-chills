import { Play, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Episode } from '@/data/episodes';
import { PaywallModal } from './PaywallModal';
import { isPremiumUnlocked } from '@/lib/unlock';

interface EpisodeCardProps {
  episode: Episode;
  index: number;
}

export function EpisodeCard({ episode, index }: EpisodeCardProps) {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Episodes 3 and 4 require payment, unless already unlocked
  const isPremiumEpisode = episode.id === 'ep-3' || episode.id === 'ep-4';
  const isLocked = isPremiumEpisode && !isPremiumUnlocked();
  
  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      setShowPaywall(true);
    }
  };

  return (
    <>
      <Link
        to={`/watch/${episode.id}`}
        onClick={handleClick}
        className="episode-card group block"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="relative aspect-[9/16] overflow-hidden">
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
          
          {/* Lock overlay for premium episodes */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm">
                <Lock className="h-7 w-7 text-primary" />
              </div>
            </div>
          )}
          
          {/* Play button (only for unlocked episodes) */}
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="play-pulse flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
                <Play className="h-7 w-7 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          )}
          
          {/* Episode number badge */}
          <div className="absolute left-3 top-3 z-20">
            <span className="font-display text-2xl tracking-wider text-foreground/80">
              EP {episode.number.toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Premium badge for locked episodes */}
          {isLocked && (
            <div className="absolute right-3 top-3 z-20">
              <span className="rounded bg-primary px-2 py-0.5 font-display text-xs tracking-widest text-primary-foreground">
                PREMIUM
              </span>
            </div>
          )}
          
          {/* New badge (only if not locked) */}
          {episode.isNew && !isLocked && (
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
      
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        episodeTitle={episode.title}
        onUnlock={() => navigate(`/watch/${episode.id}`)}
      />
    </>
  );
}
