import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Play, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Button } from "@/components/ui/button";
import { allSeries, series as stillHere } from "@/data/episodes";
import { useWatchHistory } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import seriesBanner from "@/assets/series-banner.png";
import stillHereLogo from "@/assets/still-here-logo.png";

const SeriesDetail = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const show = allSeries.find((s) => s.id === seriesId);
  const [session, setSession] = useState<any>(null);
  const { data: history } = useWatchHistory();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  if (!show) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 pt-32 text-center text-muted-foreground">
          Series not found. <Link to="/" className="underline">Go home</Link>
        </div>
      </div>
    );
  }

  const isStillHere = show.id === stillHere.id;
  const eps = show.episodes;

  // Latest watched episode of this series (history is sorted newest first)
  const last = session && history ? history.find((h) => eps.some((e) => e.id === h.episode_id)) : undefined;
  let resume = eps[0];
  let label = eps[0] ? `Play EP ${eps[0].number.toString().padStart(2, "0")}` : "";
  if (last) {
    const idx = eps.findIndex((e) => e.id === last.episode_id);
    const target = last.completed && idx < eps.length - 1 ? eps[idx + 1] : eps[idx];
    resume = target;
    label = `${last.completed ? "Play" : "Continue"} EP ${target.number.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${show.title} — Chrono Chills`} description={show.tagline} path={`/series/${show.id}`} />
      <Header />

      <section className="relative overflow-hidden pt-16">
        <div className="relative h-[320px] sm:h-[420px] md:h-[500px] w-full">
          {isStillHere ? (
            <img src={seriesBanner} alt={show.title} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/40 via-background to-accent/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />
        </div>

        <div className="container relative -mt-48 px-4 z-10">
          <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          {isStillHere ? (
            <img src={stillHereLogo} alt={show.title} className="h-16 sm:h-20 md:h-24 w-auto invert brightness-200" />
          ) : (
            <h1 className="font-display text-5xl md:text-7xl tracking-wider text-foreground">{show.title}</h1>
          )}
          <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
            {eps.length} Episodes • Horror • Sci-Fi • Thriller
          </p>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">{show.tagline}</p>

          {resume && (
            <Button size="lg" className="mt-6 gap-2 font-display tracking-widest" onClick={() => navigate(`/watch/${resume.id}`)}>
              <Play className="h-5 w-5 fill-current" /> {label}
            </Button>
          )}
          {resume && last && (
            <p className="mt-2 text-xs text-muted-foreground">{resume.title}</p>
          )}
        </div>
      </section>

      <section className="container px-4 pb-20 mt-12">
        <h2 className="mb-6 font-display text-2xl tracking-wide text-foreground border-b border-border/50 pb-3">
          Episodes
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
          {eps.map((episode, index) => (
            <EpisodeCard key={episode.id} episode={episode} index={index} fluid />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SeriesDetail;
