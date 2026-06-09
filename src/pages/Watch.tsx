import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, BookmarkMinus, SkipBack, SkipForward, Play } from "lucide-react";
import { series } from "@/data/episodes";
import { SEO } from "@/components/SEO";
import { PaywallModal } from "@/components/PaywallModal";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useEpisodeProgress, useUpdateWatchProgress, useIsBookmarked, useToggleBookmark } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGeoTracking } from "@/hooks/useGeoTracking";
import { pushEvent } from "@/lib/gtm";

type SlideDir = "" | "reels-slide-up" | "reels-slide-down" | "reels-rubber";

const Watch = () => {
  const { subscribed } = useSubscription();
  const { episodeId } = useParams<{ episodeId: string }>();
  useGeoTracking(`/watch/${episodeId}`);
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [slideClass, setSlideClass] = useState<SlideDir>("");
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

  const isNextEpisodePremium = nextEpisode && nextEpisode.number >= 13;
  const isNextEpisodeLocked = isNextEpisodePremium && !subscribed;

  const transitionTo = useCallback((path: string, direction: "up" | "down") => {
    setSlideClass(direction === "up" ? "reels-slide-up" : "reels-slide-down");
    window.setTimeout(() => navigate(path), 240);
  }, [navigate]);

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisode) return;
    if (isNextEpisodeLocked) {
      setShowPaywall(true);
    } else {
      transitionTo(`/watch/${nextEpisode.id}`, "up");
    }
  }, [nextEpisode, isNextEpisodeLocked, transitionTo]);

  const goToPrevEpisode = useCallback(() => {
    if (!prevEpisode) {
      // rubber-band bounce at first episode
      setSlideClass("reels-rubber");
      toast("You're on the first episode");
      window.setTimeout(() => setSlideClass(""), 450);
      return;
    }
    transitionTo(`/watch/${prevEpisode.id}`, "down");
  }, [prevEpisode, transitionTo]);

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

    const timeout = setTimeout(() => {
      try {
        const Stream = (window as any).Stream;
        if (!Stream || !iframeRef.current) return;

        const player = Stream(iframeRef.current);
        playerRef.current = player;

        if (progress?.timestamp && !progress?.completed) {
          player.currentTime = Math.max(0, progress.timestamp - 1);
        }

        player.addEventListener("play", () => setPaused(false));
        player.addEventListener("pause", () => setPaused(true));

        player.addEventListener("ended", () => {
          pushEvent("episode_completed", {
            episode_id: episode.id,
            episode_number: episode.number,
            episode_title: episode.title,
          });
          updateProgress({ episodeId: episode.id, timestamp: 0, completed: true });
          const advance = () => {
            if (nextEpisode) goToNextEpisode();
          };
          if (document.fullscreenElement) {
            document.exitFullscreen().then(advance).catch(advance);
          } else {
            advance();
          }
        });

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
  }, [sdkReady, episode, episodeId, progress, nextEpisode, session, updateProgress, goToNextEpisode]);

  // Reset state when episode changes
  useEffect(() => {
    setShowPaywall(false);
    setSlideClass("");
    setPaused(false);
  }, [episodeId]);

  // Track episode view + milestone events
  useEffect(() => {
    if (!episode) return;
    pushEvent("episode_started", {
      episode_id: episode.id,
      episode_number: episode.number,
      episode_title: episode.title,
    });

    const storageKey = "unique_episodes_watched";
    const firedKey = "milestone_events_fired";
    const watched: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const fired: string[] = JSON.parse(localStorage.getItem(firedKey) || "[]");
    if (!watched.includes(episode.id)) {
      watched.push(episode.id);
      localStorage.setItem(storageKey, JSON.stringify(watched));
    }
    const count = watched.length;
    if (count >= 2 && !fired.includes("2")) {
      pushEvent("milestone_2_episodes", { unique_episodes_count: count });
      fired.push("2");
      localStorage.setItem(firedKey, JSON.stringify(fired));
    }
    if (count >= 10 && !fired.includes("10")) {
      pushEvent("milestone_10_episodes", { unique_episodes_count: count });
      fired.push("10");
      localStorage.setItem(firedKey, JSON.stringify(fired));
    }
  }, [episode]);

  // Touch / swipe handlers (Reels-style vertical pager)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastSwipeDistRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;
    lastSwipeDistRef.current = Math.hypot(dx, dy);
    if (Math.abs(dy) < 60) return;
    if (Math.abs(dx) > Math.abs(dy)) return;
    const velocity = Math.abs(dy) / Math.max(dt, 1);
    if (velocity < 0.2 && Math.abs(dy) < 120) return;
    if (dy < 0) {
      goToNextEpisode();
    } else {
      goToPrevEpisode();
    }
  };

  // Tap (without swipe) → toggle play/pause
  const handleTapOverlay = (e: React.MouseEvent) => {
    // suppress accidental tap fired after a swipe
    if (lastSwipeDistRef.current > 10) {
      lastSwipeDistRef.current = 0;
      e.preventDefault();
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    try {
      if (paused) {
        player.play();
      } else {
        player.pause();
      }
    } catch {
      // ignore
    }
  };

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

  // controls=false hides Cloudflare's UI so our overlay owns interaction
  const streamSrc = `https://iframe.videodelivery.net/${episode.streamId}?autoplay=true&preload=auto&controls=false`;
  const thumbUrl = typeof episode.thumbnail === "string" ? episode.thumbnail : "";
  const seoTitle = `Watch STILL HERE Episode ${episode.number}: ${episode.title} — Chrono Chills`;
  const seoDesc = `${episode.subtitle} Episode ${episode.number} of the horror sci-fi series STILL HERE on Chrono Chills.`;
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${episode.title} — STILL HERE Episode ${episode.number}`,
    description: episode.subtitle,
    thumbnailUrl: thumbUrl ? `https://chronochills.com${thumbUrl}` : undefined,
    uploadDate: "2026-01-01",
    partOfSeries: { "@type": "TVSeries", name: "STILL HERE" },
    episodeNumber: episode.number,
  };

  return (
    <div
      className={`fixed inset-0 bg-background overflow-hidden ${slideClass}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/watch/${episode.id}`}
        image={thumbUrl ? `https://chronochills.com${thumbUrl}` : undefined}
        type="video.episode"
        jsonLd={videoJsonLd}
      />
      {/* Top overlay: back + nav (safe-area aware) */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background/80 to-transparent pt-safe pl-safe pr-safe">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            to="/"
            aria-label="Back to all episodes"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur-sm transition-colors hover:bg-background/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="pointer-events-auto flex items-center gap-2">
            {prevEpisode && (
              <button
                onClick={() => transitionTo(`/watch/${prevEpisode.id}`, "down")}
                aria-label={`Previous episode: ${prevEpisode.title}`}
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
                  if (nextEpisode.number >= 13 && !subscribed) {
                    setShowPaywall(true);
                  } else {
                    transitionTo(`/watch/${nextEpisode.id}`, "up");
                  }
                }}
                aria-label={`Next episode: ${nextEpisode.title}`}
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
          className="h-full w-full pointer-events-none"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ border: "none" }}
        />

        {/* Tap-to-pause / swipe gesture overlay (sits above iframe, below UI) */}
        <button
          type="button"
          aria-label={paused ? "Resume" : "Pause"}
          onClick={handleTapOverlay}
          className="absolute inset-0 z-30 h-full w-full bg-transparent focus:outline-none"
        />

        {/* Paused indicator */}
        {paused && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
              <Play className="h-10 w-10 text-foreground" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Episode info overlay at bottom (safe-area aware) */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/60 to-transparent p-4 pb-8 pl-safe pr-safe">
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
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this episode"}
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
      </div>

      {/* Paywall Modal */}
      {nextEpisode && (
        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} episodeTitle={nextEpisode.title} />
      )}
    </div>
  );
};

export default Watch;
