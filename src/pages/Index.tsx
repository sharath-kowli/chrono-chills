import { Header } from '@/components/Header';
import { SeriesHero } from '@/components/SeriesHero';
import { EpisodeCard } from '@/components/EpisodeCard';
import { series } from '@/data/episodes';

const Index = () => {
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
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {series.episodes.map((episode, index) => (
            <EpisodeCard 
              key={episode.id} 
              episode={episode} 
              index={index}
            />
          ))}
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
