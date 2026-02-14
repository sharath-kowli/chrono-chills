import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SeriesHero } from '@/components/SeriesHero';
import { EpisodeCard } from '@/components/EpisodeCard';
import { series } from '@/data/episodes';

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 20);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero section */}
      <SeriesHero series={series} />
      
      {/* Episodes grid */}
      <section className="container px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-foreground">
            All Episodes
          </h2>
          <span className="text-sm text-muted-foreground">
            {series.episodes.length} available
          </span>
        </div>
        
        <div className="relative group">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
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
              <EpisodeCard 
                key={episode.id} 
                episode={episode} 
                index={index}
              />
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground shadow-lg transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 STATIC. All rights reserved. Some signals were never meant to be received.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
