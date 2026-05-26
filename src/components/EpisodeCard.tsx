import { Play, Lock, Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Episode } from "@/data/episodes";
import { PaywallModal } from "./PaywallModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useEpisodeProgress, useIsBookmarked } from "@/hooks/useUserData";

interface EpisodeCardProps {
  episode: Episode;
  index: number;
}

export function EpisodeCard({ episode, index }: EpisodeCardProps) {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const { subscribed } = useSubscription();

  const { data: progress } = useEpisodeProgress(episode.id);
  const { data: isBookmarked } = useIsBookmarked(episode.id);

  const isPremiumEpisode = episode.number >= 13;
  const isLocked = isPremiumEpisode && !subscribed;

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
        className="episode-card group block w-36 flex-shrink-0 snap-start sm:w-44"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative aspect-[9/16] overflow-hidden rounded-lg">
          <img
            src={episode.thumbnail}
            alt={episode.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="vhs-lines absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-horror-dark via-transparent to-transparent" />

          {isBookmarked && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
              <Bookmark className="h-5 w-5 fill-primary text-primary drop-shadow-md" />
            </div>
          )}

          {isLocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="play-pulse flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm">
                <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          )}

          <div className="absolute left-2 top-2 z-20">
            <span className="font-display text-lg tracking-wider text-foreground/80">
              EP {episode.number.toString().padStart(2, "0")}
            </span>
          </div>

          {isLocked && (
            <div className="absolute right-2 top-2 z-20">
              <span className="rounded bg-primary px-1.5 py-0.5 font-display text-[10px] tracking-widest text-primary-foreground">
                PREMIUM
              </span>
            </div>
          )}
          {episode.isNew && !isLocked && (
            <div className="absolute right-2 top-2 z-20">
              <span className="rounded bg-primary px-1.5 py-0.5 font-display text-[10px] tracking-widest text-primary-foreground">
                NEW
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-20">
            <span className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
              {episode.duration}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-2 pt-6">
            <h3 className="font-display text-sm leading-tight tracking-wide text-foreground">{episode.title}</h3>
          </div>

          {progress && !progress.completed && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50 z-30">
              <div
                className="h-full bg-primary"
                style={{ width: `50%` }}
              />
            </div>
          )}
          {progress && progress.completed && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50 z-30">
              <div className="h-full bg-primary w-full" />
            </div>
          )}
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
