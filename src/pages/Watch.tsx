import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { series } from '@/data/episodes';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const [countdown, setCountdown] = useState(5);
  
  const currentIndex = series.episodes.findIndex(ep => ep.id === episodeId);
  const episode = series.episodes[currentIndex];
  
  const prevEpisode = currentIndex > 0 ? series.episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < series.episodes.length - 1 ? series.episodes[currentIndex + 1] : null;

  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) {
      navigate(`/watch/${nextEpisode.id}`);
    }
  }, [nextEpisode, navigate]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
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
      
      playerRef.current = new window.YT.Player('youtube-player', {
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
              console.log('Analytics: episode_completed', {
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
    setCountdown(5);
  }, [episodeId]);

  // Countdown timer for auto-play
  useEffect(() => {
    if (!showNextPrompt || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          goToNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showNextPrompt, countdown, goToNextEpisode]);
  
  // Track episode view (placeholder for analytics)
  useEffect(() => {
    if (episode) {
      console.log('Analytics: episode_started', {
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
    <div className="min-h-screen bg-horror-dark">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-horror-dark to-transparent">
        <div className="container flex h-16 items-center px-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </header>
      
      {/* Video player */}
      <div className="relative flex justify-center pt-16">
        <div className="vhs-lines relative aspect-[9/16] w-full max-w-md bg-background">
          <div id="youtube-player" className="h-full w-full" />
          
          {/* Next Episode Prompt Overlay */}
          {showNextPrompt && nextEpisode && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
              <div className="p-6 text-center">
                <p className="mb-2 text-sm text-muted-foreground">Up Next</p>
                <h3 className="font-display text-2xl tracking-wide text-foreground">
                  {nextEpisode.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{nextEpisode.subtitle}</p>
                
                {/* Thumbnail preview */}
                <div className="mx-auto mt-4 aspect-[9/16] w-32 overflow-hidden rounded-lg">
                  <img 
                    src={nextEpisode.thumbnail} 
                    alt={nextEpisode.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <Button
                  onClick={goToNextEpisode}
                  className="mt-6 gap-2 bg-primary px-8 py-6 text-lg hover:bg-primary/90"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play Now
                </Button>
                
                <p className="mt-3 text-sm text-muted-foreground">
                  Starting in {countdown}...
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
      </div>
      
      {/* Episode info */}
      <div className="container px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-display text-lg tracking-wider text-primary">
              Episode {episode.number}
            </span>
            <h1 className="mt-1 font-display text-3xl tracking-wide text-foreground md:text-4xl">
              {episode.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {episode.subtitle}
            </p>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {episode.duration}
          </span>
        </div>
        
        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {prevEpisode ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/watch/${prevEpisode.id}`)}
              className="flex items-center gap-2 border-border bg-card hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
          ) : (
            <div />
          )}
          
          {nextEpisode ? (
            <Button
              onClick={() => navigate(`/watch/${nextEpisode.id}`)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <span>Next Episode</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="rounded-lg border border-border bg-card px-4 py-2 text-center">
              <p className="text-sm text-muted-foreground">More episodes coming soon...</p>
            </div>
          )}
        </div>
        
        {/* Up next preview */}
        {nextEpisode && (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-xl tracking-wide text-foreground">
              Up Next
            </h2>
            <Link
              to={`/watch/${nextEpisode.id}`}
              className="episode-card group flex gap-4 p-4"
            >
              <div className="relative aspect-[9/16] w-24 shrink-0 overflow-hidden rounded">
                <img
                  src={nextEpisode.thumbnail}
                  alt={nextEpisode.title}
                  className="h-full w-full object-cover"
                />
                <div className="vhs-lines absolute inset-0" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm text-primary">Episode {nextEpisode.number}</span>
                <h3 className="font-display text-lg tracking-wide text-foreground group-hover:text-primary">
                  {nextEpisode.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{nextEpisode.subtitle}</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
