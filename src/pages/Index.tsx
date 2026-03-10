import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { SeriesHero } from "@/components/SeriesHero";
import { EpisodeCard } from "@/components/EpisodeCard";
import { series } from "@/data/episodes";
import { useWatchHistory, useBookmarks } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const continueWatchingRef = useRef<HTMLDivElement>(null);
  const bookmarksRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollCWLeft, setCanScrollCWLeft] = useState(false);
  const [canScrollCWRight, setCanScrollCWRight] = useState(false);
  const [canScrollFavLeft, setCanScrollFavLeft] = useState(false);
  const [canScrollFavRight, setCanScrollFavRight] = useState(false);

  // User Data State
  const [session, setSession] = useState<any>(null);
  const { data: watchHistory } = useWatchHistory();
  const { data: bookmarks } = useBookmarks();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const checkScroll = useCallback(
    (ref: React.RefObject<HTMLDivElement>, setLeft: (val: boolean) => void, setRight: (val: boolean) => void) => {
      const el = ref.current;
      if (!el) return;
      setLeft(el.scrollLeft > 20);
      setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    },
    [],
  );

  const handleAllScrolls = useCallback(() => {
    checkScroll(scrollRef, setCanScrollLeft, setCanScrollRight);
    checkScroll(continueWatchingRef, setCanScrollCWLeft, setCanScrollCWRight);
    checkScroll(bookmarksRef, setCanScrollFavLeft, setCanScrollFavRight);
  }, [checkScroll]);

  useEffect(() => {
    handleAllScrolls();
    window.addEventListener("resize", handleAllScrolls);

    const el1 = scrollRef.current;
    const el2 = continueWatchingRef.current;
    const el3 = bookmarksRef.current;

    const _handleScroll = () => handleAllScrolls();

    el1?.addEventListener("scroll", _handleScroll, { passive: true });
    el2?.addEventListener("scroll", _handleScroll, { passive: true });
    el3?.addEventListener("scroll", _handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleAllScrolls);
      el1?.removeEventListener("scroll", _handleScroll);
      el2?.removeEventListener("scroll", _handleScroll);
      el3?.removeEventListener("scroll", _handleScroll);
    };
  }, [handleAllScrolls, watchHistory, bookmarks]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Memoize episodes into lists
  const continueWatchingEpisodes =
    session && watchHistory
      ? (watchHistory
          .filter((w) => !w.completed) // Don't show completed episodes in "Continue Watching"
          .map((w) => series.episodes.find((e) => e.id === w.episode_id))
          .filter(Boolean) as typeof series.episodes)
      : [];

  const bookmarkedEpisodes =
    session && bookmarks
      ? (bookmarks
          .map((b) => series.episodes.find((e) => e.id === b.episode_id))
          .filter(Boolean) as typeof series.episodes)
      : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero section */}
      <SeriesHero series={series} />

      {/* Episodes grid */}
      <section className="container px-4 pb-20 space-y-12 mt-12">
        {continueWatchingEpisodes.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-foreground">Continue Watching</h2>
            </div>
            <div className="relative group">
              {canScrollCWLeft && (
                <button
                  onClick={() => scroll(continueWatchingRef, "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div
                ref={continueWatchingRef}
                className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:gap-4"
              >
                {continueWatchingEpisodes.map((episode, index) => (
                  <EpisodeCard key={`cw_${episode.id}`} episode={episode} index={index} />
                ))}
              </div>

              {canScrollCWRight && (
                <button
                  onClick={() => scroll(continueWatchingRef, "right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {bookmarkedEpisodes.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide text-foreground">My Favorites</h2>
            </div>
            <div className="relative group">
              {canScrollFavLeft && (
                <button
                  onClick={() => scroll(bookmarksRef, "left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              <div
                ref={bookmarksRef}
                className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:gap-4"
              >
                {bookmarkedEpisodes.map((episode, index) => (
                  <EpisodeCard key={`fav_${episode.id}`} episode={episode} index={index} />
                ))}
              </div>

              {canScrollFavRight && (
                <button
                  onClick={() => scroll(bookmarksRef, "right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-wide text-foreground">All Episodes</h2>
            <span className="text-sm text-muted-foreground">{series.episodes.length} available</span>
          </div>

          <div className="relative group">
            {canScrollLeft && (
              <button
                onClick={() => scroll(scrollRef, "left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:gap-4"
            >
              {series.episodes.map((episode, index) => (
                <EpisodeCard key={episode.id} episode={episode} index={index} />
              ))}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll(scrollRef, "right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container px-4 flex flex-col items-center gap-4 text-center text-xs text-muted-foreground">
          <p>© 2026 StarRiver B.V.</p>
          <div className="space-y-1">
            <p className="font-medium text-foreground/70">StarRiver B.V.</p>
            <p>Netherlands</p>
            <p>KvK: 81709323</p>
          </div>
          <p>Contact: <a href="mailto:support@chronochills.com" className="underline hover:text-foreground transition-colors">support@chronochills.com</a></p>
          <div className="flex gap-3">
            <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
            <span>|</span>
            <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="/refund" className="underline hover:text-foreground transition-colors">Refund Policy</a>
            <span>|</span>
            <a href="/about" className="underline hover:text-foreground transition-colors">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
