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
  
  const isPremiumEpisode = episode.number >= 3;
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
        className="group flex items-stretch gap-4 rounded-lg bg-card p-2 transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/10"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Thumbnail */}
        <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-20">
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="vhs-lines absolute inset-0" />
          
          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90">
                <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex flex-1 flex-col justify-center gap-0.5 overflow-hidden py-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs tracking-wider text-muted-foreground">
              EP {episode.number.toString().padStart(2, '0')}
            </span>
            {isLocked && (
              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-display text-[10px] tracking-widest text-primary">
                PREMIUM
              </span>
            )}
            {episode.isNew && !isLocked && (
              <span className="rounded bg-primary px-1.5 py-0.5 font-display text-[10px] tracking-widest text-primary-foreground">
                NEW
              </span>
            )}
          </div>
          <h3 className="truncate font-display text-lg tracking-wide text-foreground transition-colors group-hover:text-primary">
            {episode.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {episode.subtitle}
          </p>
        </div>
        
        {/* Duration */}
        <div className="flex flex-shrink-0 items-center pr-1">
          <span className="text-xs text-muted-foreground">
            {episode.duration}
          </span>
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
