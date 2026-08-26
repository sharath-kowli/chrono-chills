import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, BookmarkMinus, SkipBack, SkipForward, Play, Loader2 } from "lucide-react";
import { series } from "@/data/episodes";
import { SEO } from "@/components/SEO";
import { PaywallModal } from "@/components/PaywallModal";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useEpisodeProgress, useUpdateWatchProgress, useIsBookmarked, useToggleBookmark } from "@/hooks/useUserData";
import { useHlsSource } from "@/hooks/useHlsSource";
import { hlsUrl } from "@/lib/stream";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGeoTracking } from "@/hooks/useGeoTracking";
import { pushEvent } from "@/lib/gtm";

type SlideDir = "" | "reels-slide-up" | "reels-slide-down" | "reels-rubber";

// Module scope, not component state: it must survive episode navigation. Once the
// viewer has started one episode by hand, iOS lets us start the rest for them.
let hasUserStartedPlayback = false;

const Watch = () => {
  const { subscribed } = useSubscription();
  const { episodeId } = useParams<{ episodeId: string }>();
  useGeoTracking(`/watch/${episodeId}`);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [paused, setPaused] = useState(true);
  const [showPoster, setShowPoster] = useState(true);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [slideClass, setSlideClass] = useState<SlideDir>("");
  const progressSaveRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPlayRef = useRef(false);

  const currentIndex = series.episodes.findIndex((ep) => ep.id === episodeId);
  const episode = series.episodes[currentIndex];
  const prevEpisode = currentIndex > 0 ? series.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < series.episodes.length - 1 ? series.episodes[currentIndex + 1] : null;

  // Attaches the HLS manifest to the <video> — natively on iOS/Safari, via hls.js elsewhere.
  const { status: sourceStatus, attachedStreamId } = useHlsSource(videoRef, episode?.streamId);
  // Guard on the attached id, not just the status: during an episode swap the old
  // "ready" is still in this render's closure while the element has no source.
  const sourceReady = sourceStatus === "ready" && attachedStreamId === episode?.streamId;

  // User Data Hooks
  const { data: progress } = useEpisodeProgress(episodeId || "");
  const { mutate: updateProgress } = useUpdateWatchProgress();
  const { data: isBookmarked } = useIsBookmarked(episodeId || "");
  const { mutate: toggleBookmark } = useToggleBookmark();

  // Keep latest progress in a ref so the resume handler doesn't re-run on every save
  const progressRef = useRef(progress);

  const [sessionLoaded, setSessionLoaded] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const isNextEpisodePremium = nextEpisode && nextEpisode.number >= 13;
  const isNextEpisodeLocked = isNextEpisodePremium && !subscribed;
  const isNextRequiresSignIn = nextEpisode && nextEpisode.number >= 2 && nextEpisode.number <= 12 && !session && !subscribed;

  // Redirect guests trying to watch episodes 2-12 to sign-in
  useEffect(() => {
    if (!sessionLoaded || !episode) return;
    if (episode.number >= 2 && episode.number <= 12 && !session && !subscribed) {
      navigate(`/auth?redirect=/watch/${episode.id}`, { replace: true });
    }
  }, [sessionLoaded, session, subscribed, episode, navigate]);

  const transitionTo = useCallback((path: string, direction: "up" | "down") => {
    setSlideClass(direction === "up" ? "reels-slide-up" : "reels-slide-down");
    window.setTimeout(() => navigate(path), 240);
  }, [navigate]);

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisode) return;
    if (isNextEpisodeLocked) {
      setShowPaywall(true);
    } else if (isNextRequiresSignIn) {
      navigate(`/auth?redirect=/watch/${nextEpisode.id}`);
    } else {
      transitionTo(`/watch/${nextEpisode.id}`, "up");
    }
  }, [nextEpisode, isNextEpisodeLocked, isNextRequiresSignIn, transitionTo, navigate]);

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

  // Playback start. `video.play()` must be the first statement in a gesture handler —
  // iOS grants permission to the synchronous part of the tap and nothing after it.
  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      pendingPlayRef.current = true;
      return;
    }
    const p = video.play();
    hasUserStartedPlayback = true;
    pendingPlayRef.current = false;
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // Usually just "no source yet" — the tap has still unlocked the element,
        // so retry as soon as the manifest is attached.
        pendingPlayRef.current = true;
        setPlayBlocked(true);
      });
    }
  }, []);

  // Retry a tap that landed before the manifest was attached, and roll straight into
  // the next episode once the viewer has started playback by hand at least once.
  useEffect(() => {
    if (!sourceReady) return;
    if (!pendingPlayRef.current && !hasUserStartedPlayback) return;
    const video = videoRef.current;
    if (!video) return;
    pendingPlayRef.current = false;
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.catch(() => setPlayBlocked(true));
    }
  }, [sourceReady, episodeId]);

  // Restore the saved position. The saved progress and the media's metadata arrive in
  // either order, so this runs on both and seeks once, the first time both are in hand.
  const resumedForRef = useRef<string | null>(null);
  const resumeIfPossible = useCallback(() => {
    const video = videoRef.current;
    const initial = progressRef.current;
    if (!video || !episodeId || resumedForRef.current === episodeId) return;
    if (video.readyState < 1) return; // duration not known yet
    if (!initial?.timestamp || initial.completed) return;
    if (video.currentTime > 1) return; // already watching — don't yank them backwards
    const target = Math.max(0, initial.timestamp - 1);
    if (Number.isFinite(video.duration) && target >= video.duration - 1) return;
    resumedForRef.current = episodeId;
    video.currentTime = target;
  }, [episodeId]);

  useEffect(() => {
    progressRef.current = progress;
    resumeIfPossible();
  }, [progress, resumeIfPossible]);

  // Periodic progress save
  useEffect(() => {
    if (!episode || !session) return;
    progressSaveRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.currentTime > 0) {
        updateProgress({ episodeId: episode.id, timestamp: video.currentTime });
      }
    }, 10000);
    return () => {
      if (progressSaveRef.current) {
        clearInterval(progressSaveRef.current);
        progressSaveRef.current = null;
      }
    };
  }, [episode, session, updateProgress]);

  const handleEnded = useCallback(() => {
    if (!episode) return;
    pushEvent("episode_completed", {
      episode_id: episode.id,
      episode_number: episode.number,
      episode_title: episode.title,
    });
    updateProgress({ episodeId: episode.id, timestamp: 0, completed: true });
    const advance = () => {
      if (nextEpisode) goToNextEpisode();
    };
    // iOS reports fullscreen on the element, not the document.
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitDisplayingFullscreen?: boolean; webkitExitFullscreen?: () => void })
      | null;
    if (document.fullscreenElement) {
      document.exitFullscreen().then(advance).catch(advance);
    } else {
      if (video?.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
      advance();
    }
  }, [episode, nextEpisode, goToNextEpisode, updateProgress]);

  // Reset state when episode changes
  useEffect(() => {
    setShowPaywall(false);
    setSlideClass("");
    setPaused(true);
    setShowPoster(true);
    setPlayBlocked(false);
    setBuffering(false);
    resumedForRef.current = null;
  }, [episodeId]);

  // Warm the CDN for the adjacent episodes so a swipe starts instantly.
  useEffect(() => {
    const ids = [nextEpisode?.streamId, prevEpisode?.streamId].filter(Boolean) as string[];
    if (!ids.length) return;
    const timer = window.setTimeout(() => {
      ids.forEach((id) => {
        fetch(hlsUrl(id)).catch(() => {
          /* best-effort warm-up */
        });
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [nextEpisode?.streamId, prevEpisode?.streamId]);

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

  // Tap handling: single tap = play/pause toggle; double tap on left/right edge = skip ±10s.
  const lastTapRef = useRef<{ t: number; x: number } | null>(null);
  const tapTimeoutRef = useRef<number | null>(null);
  const DOUBLE_TAP_MS = 280;

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // The element is now in our own document, so `paused` is synchronous and truthful.
    if (video.paused) {
      const p = video.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const limit = Number.isFinite(video.duration) ? video.duration : Infinity;
    video.currentTime = Math.max(0, Math.min(limit, video.currentTime + seconds));
  }, []);

  const handleTapOverlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (lastSwipeDistRef.current > 10) {
      lastSwipeDistRef.current = 0;
      return;
    }
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const last = lastTapRef.current;

    if (last && now - last.t < DOUBLE_TAP_MS) {
      // Double tap — cancel pending single-tap action, perform skip.
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      lastTapRef.current = null;
      const isRight = x > rect.width / 2;
      skipBy(isRight ? 10 : -10);
      toast(isRight ? "+10s" : "-10s", { duration: 600 });
      return;
    }

    lastTapRef.current = { t: now, x };
    if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimeoutRef.current = null;
      lastTapRef.current = null;
      togglePlayPause();
    }, DOUBLE_TAP_MS);
  };

  // Cleanup pending tap timer on unmount
  useEffect(() => () => {
    if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
  }, []);

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
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-background/80 to-transparent">
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

      {/* Full viewport video player.
          A real <video> in our own document, not the Cloudflare iframe: user activation
          is never handed to a cross-origin child frame, so on iOS a tap on this page can
          only start playback if the media element lives on this page too.
          `playsInline` keeps it in the page instead of iOS's fullscreen takeover. */}
      <div className="vhs-lines relative h-full w-full bg-background">
        <video
          ref={videoRef}
          poster={episode.thumbnail}
          playsInline
          webkit-playsinline="true"
          preload="auto"
          className="pointer-events-none h-full w-full object-contain"
          onLoadedMetadata={resumeIfPossible}
          onPlay={() => {
            setPaused(false);
            setPlayBlocked(false);
          }}
          onPlaying={() => {
            setShowPoster(false);
            setBuffering(false);
          }}
          onWaiting={() => setBuffering(true)}
          onPause={() => setPaused(true)}
          onEnded={handleEnded}
        />

        {/* Tap-to-pause / swipe gesture overlay (sits above the video, below UI).
            Disabled while the poster is up so the first tap always hits the real play button. */}
        {!showPoster && (
          <button
            type="button"
            aria-label={paused ? "Resume" : "Pause"}
            onClick={handleTapOverlay}
            className="absolute inset-0 z-30 h-full w-full bg-transparent focus:outline-none"
          />
        )}

        {/* Poster overlay — shown until playback actually starts. Its onClick is the
            user gesture that unlocks the video element on iOS. */}
        {showPoster && (
          <button
            type="button"
            onClick={startPlayback}
            aria-label={`Play episode ${episode.number}: ${episode.title}`}
            className="absolute inset-0 z-[45] h-full w-full focus:outline-none"
          >
            <img
              src={episode.thumbnail}
              alt={`${episode.title} — STILL HERE Episode ${episode.number}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                {sourceStatus !== "error" && !sourceReady ? (
                  <Loader2 className="h-9 w-9 animate-spin text-foreground" />
                ) : (
                  <Play className="h-10 w-10 text-foreground" fill="currentColor" />
                )}
              </span>
              <span className="font-display text-xs tracking-widest text-foreground/80">
                {sourceStatus === "error"
                  ? "PLAYBACK UNAVAILABLE"
                  : playBlocked
                    ? "TAP TO PLAY"
                    : `EPISODE ${episode.number.toString().padStart(2, "0")}`}
              </span>
            </div>
          </button>
        )}

        {/* Buffering indicator */}
        {buffering && !showPoster && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-foreground/80" />
          </div>
        )}

        {/* Paused indicator */}
        {paused && !showPoster && !buffering && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
              <Play className="h-10 w-10 text-foreground" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Episode info overlay at bottom (safe-area aware) */}
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
