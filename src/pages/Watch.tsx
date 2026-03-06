import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { series } from "@/data/episodes";
import { Button } from "@/components/ui/button";
import { PaywallModal } from "@/components/PaywallModal";
import { useEffect, useRef, useState, useCallback } from "react";
import { isPremiumUnlocked } from "@/lib/unlock";
import { useEpisodeProgress, useUpdateWatchProgress, useIsBookmarked, useToggleBookmark } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { BookmarkPlus, BookmarkMinus } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Watch = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [session, setSession] = useState<any>(null);

  // User Data Hooks
  const { data: progress } = useEpisodeProgress(episodeId || "");
  const { mutate: updateProgress } = useUpdateWatchProgress();
  const { data: isBookmarked } = useIsBookmarked(episodeId || "");
  const { mutate: toggleBookmark } = useToggleBookmark();

  // Check auth session early
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const currentIndex = series.episodes.findIndex((ep) => ep.id === episodeId);
  const episode = series.episodes[currentIndex];

  const prevEpisode = currentIndex > 0 ? series.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < series.episodes.length - 1 ? series.episodes[currentIndex + 1] : null;

  // Check if next episode is locked (Episodes 3 and 4), unless already unlocked
  const isNextEpisodePremium = nextEpisode && nextEpisode.number >= 3;
  const isNextEpisodeLocked = isNextEpisodePremium && !isPremiumUnlocked();

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisode) return;

    if (isNextEpisodeLocked) {
      // Stop countdown and show paywall
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setShowNextPrompt(false);
      setShowPaywall(true);
    } else {
      navigate(`/watch/${nextEpisode.id}`);
    }
  }, [nextEpisode, navigate, isNextEpisodeLocked]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize player when API is ready
  useEffect(() => {
    if (!episode) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: episode.youtubeId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event: any) => {
            // Video ended (state = 0)
            if (event.data === 0 && nextEpisode) {
              console.log("Analytics: episode_completed", {
                episodeId: episode.id,
                episodeNumber: episode.number,
                title: episode.title,
                timestamp: new Date().toISOString(),
              });
              setShowNextPrompt(true);
              setCountdown(5);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [episode, nextEpisode]);

  // Reset state when episode changes
  useEffect(() => {
    setShowNextPrompt(false);
    setShowPaywall(false);
    setCountdown(5);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [episodeId]);

  // Countdown timer for auto-play
  useEffect(() => {
    if (!showNextPrompt) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          // Use setTimeout to avoid setState during render
          setTimeout(() => goToNextEpisode(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [showNextPrompt, goToNextEpisode]);

  // Track episode view (placeholder for analytics)
  useEffect(() => {
    if (episode) {
      console.log("Analytics: episode_started", {
        episodeId: episode.id,
        episodeNumber: episode.number,
        title: episode.title,
        timestamp: new Date().toISOString(),
      });
    }
  }, [episode]);

  if (!episode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground">Episode Not Found</h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Back to episodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Back button overlay */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex h-14 items-center px-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Full viewport video player */}
      <div className="vhs-lines relative h-full w-full bg-background">
        <div id="youtube-player" className="h-full w-full" />

        {/* Episode info overlay at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/60 to-transparent p-4 pb-8">
          <span className="font-display text-sm tracking-wider text-primary">Episode {episode.number}</span>
          <h1 className="font-display text-xl tracking-wide text-foreground">{episode.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{episode.subtitle}</p>
        </div>

        {/* Next Episode Prompt Overlay */}
        {showNextPrompt && nextEpisode && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="p-6 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Up Next</p>
              <h3 className="font-display text-2xl tracking-wide text-foreground">{nextEpisode.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{nextEpisode.subtitle}</p>

              {/* Thumbnail preview */}
              <div className="relative mx-auto mt-4 aspect-[9/16] w-32 overflow-hidden rounded-lg">
                <img src={nextEpisode.thumbnail} alt={nextEpisode.title} className="h-full w-full object-cover" />
                {isNextEpisodeLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>

              <Button onClick={goToNextEpisode} className="mt-6 gap-2 bg-primary px-8 py-6 text-lg hover:bg-primary/90">
                {isNextEpisodeLocked ? (
                  <>
                    <Lock className="h-5 w-5" />
                    Unlock Episode
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 fill-current" />
                    Play Now
                  </>
                )}
              </Button>

              <p className="mt-3 text-sm text-muted-foreground">
                {isNextEpisodeLocked ? "Premium content" : `Starting in ${countdown}...`}
              </p>

              <button
                onClick={() => setShowNextPrompt(false)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paywall Modal */}
      {nextEpisode && (
        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} episodeTitle={nextEpisode.title} />
      )}
    </div>
  );
};

export default Watch;
