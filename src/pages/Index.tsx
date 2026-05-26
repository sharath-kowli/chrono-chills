import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { SeriesHero } from "@/components/SeriesHero";
import { EpisodeCard } from "@/components/EpisodeCard";
import { series } from "@/data/episodes";
import { useWatchHistory, useBookmarks } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { useGeoTracking } from "@/hooks/useGeoTracking";

const Index = () => {
  useGeoTracking("/");
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

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Chrono Chills",
      url: "https://chronochills.com",
      logo: "https://chronochills.com/pwa-512.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Chrono Chills",
      url: "https://chronochills.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: series.title,
      description: series.tagline,
      numberOfEpisodes: series.episodes.length,
      url: "https://chronochills.com/",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Chrono Chills — Horror Sci-Fi Short-Form Series"
        description={`Watch STILL HERE on Chrono Chills — a horror sci-fi thriller in ${series.episodes.length} bite-sized vertical episodes. New chapters drop weekly. Stream free.`}
        path="/"
        jsonLd={jsonLd}
      />
      <Header />

      <h1 className="sr-only">Chrono Chills — short, serialized horror sci-fi fiction</h1>

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
                  aria-label="Scroll Continue Watching left"
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
                  aria-label="Scroll Continue Watching right"
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
                  aria-label="Scroll My Favorites left"
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
                  aria-label="Scroll My Favorites right"
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
                aria-label="Scroll All Episodes left"
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
                aria-label="Scroll All Episodes right"
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
        <div className="container px-4 flex flex-col items-center gap-6 text-center text-xs text-muted-foreground/60">
          {/* Disclaimer */}
          <div className="max-w-2xl space-y-3">
            <h3 className="font-medium text-sm">Fictional Content, Genre & Likeness Disclaimer</h3>
            <p className="leading-relaxed">
              Chrono Chills is a fictional series created for entertainment purposes. The content falls within the genres of horror, science fiction, and fantasy, and may depict exaggerated, speculative, or supernatural scenarios that are not grounded in reality.
            </p>
            <p className="leading-relaxed">
              All characters, names, storylines, and events are products of the creators' imagination.
            </p>
            <p className="leading-relaxed">
              Any resemblance to real persons, living or dead, or to actual events, organizations, or locations is purely coincidental and unintended. No identification with actual individuals or entities is intended or should be inferred.
            </p>
            <p className="leading-relaxed font-medium">
              No Defamation or Harm Intended
            </p>
            <p className="leading-relaxed">
              The creators do not intend to harm, defame, or misrepresent any individual, group, or organization.
            </p>
            <p className="leading-relaxed font-medium">
              Viewer Discretion
            </p>
            <p className="leading-relaxed">
              This series may contain intense, disturbing, or psychologically unsettling themes. Viewer discretion is advised.
            </p>
          </div>

          {/* Copyright & Company Info */}
          <div className="border-t border-border/30 pt-6 space-y-4 w-full">
            <p>© 2026 StarRiver B.V.</p>
            <div className="space-y-1">
              <p className="font-medium">StarRiver B.V.</p>
              <p>Netherlands</p>
              <p>KvK: 81709323</p>
            </div>
            <p>Contact: <a href="mailto:support@chronochills.com" className="underline hover:text-muted-foreground transition-colors">support@chronochills.com</a></p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/terms" className="underline hover:text-muted-foreground transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="/refund" className="underline hover:text-muted-foreground transition-colors">Refund Policy</a>
              <span>|</span>
              <a href="/about" className="underline hover:text-muted-foreground transition-colors">About</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
