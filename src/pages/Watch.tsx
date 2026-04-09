import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Lock, BookmarkPlus, BookmarkMinus, SkipBack, SkipForward } from "lucide-react";
import { series } from "@/data/episodes";
import { Button } from "@/components/ui/button";
import { PaywallModal } from "@/components/PaywallModal";
import { useEffect, useRef, useState, useCallback } from "react";
import { isPremiumUnlocked } from "@/lib/unlock";
import { useSubscription } from "@/hooks/useSubscription";
import { useEpisodeProgress, useUpdateWatchProgress, useIsBookmarked, useToggleBookmark } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Watch = () => {
  const { subscribed } = useSubscription();
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [session, setSession] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const progressSaveRef = useRef<NodeJS.Timeout | null>(null);

  // User Data Hooks
  const { data: progress } = useEpisodeProgress(episodeId || "");
  const { mutate: updateProgress } = useUpdateWatchProgress();
  const { data: isBookmarked } = useIsBookmarked(episodeId || "");
  const { mutate: toggleBookmark } = useToggleBookmark();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const currentIndex = series.episodes.findIndex((ep) => ep.id === episodeId);
  const episode = series.episodes[currentIndex];
  const prevEpisode = currentIndex > 0 ? series.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < series.episodes.length - 1 ? series.episodes[currentIndex + 1] : null;

  const isNextEpisodePremium = nextEpisode && nextEpisode.number >= 10;
  const isNextEpisodeLocked = isNextEpisodePremium && !isPremiumUnlocked();

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisode) return;
    if (isNextEpisodeLocked) {
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

  // Load Cloudflare Stream SDK
  useEffect(() => {
    if (document.getElementById("stream-sdk")) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "stream-sdk";
    script.src = "https://embed.videodelivery.net/embed/sdk.latest.js";
    script.onload = () => setSdkReady(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Stream player when SDK + iframe are ready
  useEffect(() => {
    if (!sdkReady || !episode || !iframeRef.current) return;

    // Small delay to ensure iframe is mounted
    const timeout = setTimeout(() => {
      try {
        const Stream = (window as any).Stream;
        if (!Stream || !iframeRef.current) return;

        const player = Stream(iframeRef.current);
        playerRef.current = player;

        // Resume from saved position
        if (progress?.timestamp && !progress?.completed) {
          player.currentTime = Math.max(0, progress.timestamp - 1);
        }

        // Video ended → exit fullscreen first, then show next prompt
        player.addEventListener("ended", () => {
          console.log("Analytics: episode_completed", {
            episodeId: episode.id,
            episodeNumber: episode.number,
            title: episode.title,
            timestamp: new Date().toISOString(),
          });
          updateProgress({ episodeId: episode.id, timestamp: 0, completed: true });
          if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
              if (nextEpisode) {
                setShowNextPrompt(true);
                setCountdown(5);
              }
            }).catch(() => {
              if (nextEpisode) {
                setShowNextPrompt(true);
                setCountdown(5);
              }
            });
          } else if (nextEpisode) {
            setShowNextPrompt(true);
            setCountdown(5);
          }
        });

        // Save progress every 10 seconds
        if (progressSaveRef.current) clearInterval(progressSaveRef.current);
        progressSaveRef.current = setInterval(() => {
          if (player.currentTime > 0 && session) {
            updateProgress({ episodeId: episode.id, timestamp: player.currentTime });
          }
        }, 10000);
      } catch (e) {
        console.error("Stream player init error:", e);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (progressSaveRef.current) {
        clearInterval(progressSaveRef.current);
        progressSaveRef.current = null;
      }
      playerRef.current = null;
    };
  }, [sdkReady, episode, episodeId, progress, nextEpisode, session, updateProgress]);

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

  // Track episode view
  useEffect(() => {
    if (!episode) return;
    console.log("Analytics: episode_started", {
      episodeId: episode.id,
      episodeNumber: episode.number,
      title: episode.title,
      timestamp: new Date().toISOString(),
    });
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

  const streamSrc = `https://iframe.videodelivery.net/${episode.streamId}?autoplay=true&preload=auto`;

  return (
    <div className="fixed inset-0 bg-background">
      {/* Top overlay: back + nav */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Prev / Next episode nav */}
          <div className="pointer-events-auto flex items-center gap-2">
            {prevEpisode && (
              <button
                onClick={() => navigate(`/watch/${prevEpisode.id}`)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
                title={`Previous: ${prevEpisode.title}`}
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}
            <span className="font-display text-xs tracking-widest text-foreground/70">
              EP {episode.number.toString().padStart(2, "0")} / {series.episodes.length.toString().padStart(2, "0")}
            </span>
            {nextEpisode && (
              <button
                onClick={() => {
                  if (nextEpisode.number >= 10 && !isPremiumUnlocked()) {
                    setShowPaywall(true);
                  } else {
                    navigate(`/watch/${nextEpisode.id}`);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
                title={`Next: ${nextEpisode.title}`}
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Full viewport video player */}
      <div className="vhs-lines relative h-full w-full bg-background">
        <iframe
          key={episodeId}
          ref={iframeRef}
          src={streamSrc}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        />

        {/* Episode info overlay at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/60 to-transparent p-4 pb-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="font-display text-sm tracking-wider text-primary">Episode {episode.number}</span>
              <h1 className="font-display text-xl tracking-wide text-foreground">{episode.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{episode.subtitle}</p>
            </div>
            {session && (
              <button
                onClick={() => {
                  toggleBookmark(
                    { episodeId: episode.id, isBookmarked: !!isBookmarked },
                    {
                      onSuccess: () => {
                        toast(isBookmarked ? "Bookmark removed" : "Episode bookmarked");
                      },
                    }
                  );
                }}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
              >
                {isBookmarked ? (
                  <BookmarkMinus className="h-5 w-5 text-primary" />
                ) : (
                  <BookmarkPlus className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Next Episode Prompt Overlay */}
        {showNextPrompt && nextEpisode && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="p-6 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Up Next</p>
              <h3 className="font-display text-2xl tracking-wide text-foreground">{nextEpisode.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{nextEpisode.subtitle}</p>

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
